import { GoogleGenerativeAI } from "@google/generative-ai";
import { REVIEW_PROMPT } from '@/prompts/review';
import { DEBUG_PROMPT } from '@/prompts/debug';
import { EXPLAIN_PROMPT } from '@/prompts/explain';
import { ARCHITECTURE_PROMPT } from '@/prompts/architecture';
import { EXECUTION_PROMPT } from '@/prompts/execution';
import { createClient } from '@/utils/supabase/server';

const PROMPTS: Record<string, string> = {
  review: REVIEW_PROMPT,
  debug: DEBUG_PROMPT,
  explain: EXPLAIN_PROMPT,
  architecture: ARCHITECTURE_PROMPT,
  execution: EXECUTION_PROMPT,
  refactor: 'You are WaspAI, a staff engineer. Refactor the following code for better readability and performance without changing its functionality.'
};

async function getLocalBrainContext(query: string, geminiKey: string, supabaseClient: any, depth: number = 5) {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

    const { data: documents, error } = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: depth
    });

    if (error) throw error;

    if (!documents || documents.length === 0) {
      console.log('⚠️ [RAG]: No se encontraron documentos relevantes.');
      return '';
    }

    console.log(`✅ [RAG]: Encontrados ${documents.length} fragmentos relevantes.`);
    console.log('📄 [RAG Files]:', documents.map((d: any) => d.file_path).join(', '));

    return `\n\n[IMPORTANT: LOCAL CONTEXT FOUND]\n` +
      `Use the following code snippets from the current project to answer the query accurately. \n\n` +
      documents.map((doc: any) => `--- FILE: ${doc.file_path} ---\n${doc.content}`).join('\n');
  } catch (err) {
    console.error('[Local Brain Error]:', err);
    return '';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mode = 'review', chatId, useLocalBrain = false, config } = body;

    console.log('📬 [API Request]:', { mode, chatId, useLocalBrain, agent: config?.agent });

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Config error: API Key missing' }), { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    let currentChatId = chatId;
    const lastUserMessage = messages[messages.length - 1].text;

    let ragContext = '';
    if (useLocalBrain) {
      const depth = config?.ragDepth || 5;
      ragContext = await getLocalBrainContext(lastUserMessage, process.env.GEMINI_API_KEY, supabase, depth);
    }

    if (!currentChatId) {
      const title = lastUserMessage.split(' ').slice(0, 5).join(' ') + '...';
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([{ user_id: user.id, title, mode }]) // Guardamos el modo aquí
        .select().single();
        
      if (chatError || !newChat) {
        console.error('[API] Error creating chat:', chatError);
        return new Response(JSON.stringify({ error: 'Error creating chat', details: chatError?.message }), { status: 500 });
      }
      currentChatId = newChat.id;
    } else {
      await supabase.from('chats').update({ 
        updated_at: new Date().toISOString(),
        mode: mode // Actualizamos el modo por si el usuario lo cambió en el mismo chat
      }).eq('id', currentChatId);
    }

    await supabase.from('messages').insert([{
      chat_id: currentChatId,
      role: 'user',
      content: lastUserMessage
    }]);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelToUse = config?.model || "gemini-2.5-flash";
    const activeAgent = config?.agent || 'general';
    const basePrompt = activeAgent !== 'general' ? (PROMPTS[activeAgent] || PROMPTS[mode]) : PROMPTS[mode];

    const model = genAI.getGenerativeModel({
      model: modelToUse,
      systemInstruction: (basePrompt || PROMPTS.review) + ragContext,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // RETRY LOGIC EN EL SERVIDOR
    let result;
    let serverAttempt = 0;
    const MAX_SERVER_RETRIES = 3;

    while (serverAttempt < MAX_SERVER_RETRIES) {
      try {
        result = await model.generateContentStream({
          contents: [...history, { role: 'user', parts: [{ text: lastUserMessage }] }]
        });
        break; // Éxito, salimos del bucle
      } catch (error: any) {
        serverAttempt++;
        if (error.message?.includes('503') || error.message?.includes('429')) {
          console.warn(`⚠️ [API] Gemini Busy (Attempt ${serverAttempt}/${MAX_SERVER_RETRIES}). Retrying...`);
          if (serverAttempt === MAX_SERVER_RETRIES) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * serverAttempt));
          continue;
        }
        throw error; // Otros errores, tiramos de una
      }
    }

    if (!result) throw new Error('Failed to generate content');

    const encoder = new TextEncoder();
    return new Response(new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chatId: currentChatId })}\n\n`));
          let fullResponse = '';
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          await supabase.from('messages').insert([{ chat_id: currentChatId, role: 'assistant', content: fullResponse }]);
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      }
    }), { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
