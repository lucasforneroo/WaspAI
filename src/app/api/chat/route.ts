import { GoogleGenerativeAI } from "@google/generative-ai";
import { REVIEW_PROMPT } from '@/prompts/review';
import { DEBUG_PROMPT } from '@/prompts/debug';
import { EXPLAIN_PROMPT } from '@/prompts/explain';
import { ARCHITECTURE_PROMPT } from '@/prompts/architecture';
import { EXECUTION_PROMPT } from '@/prompts/execution';
import { GITHUB_REVIEWER_PROMPT } from '@/prompts/github';
import { SECURITY_PROMPT } from '@/prompts/security';
import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

const PROMPTS: Record<string, string> = {
  review: REVIEW_PROMPT,
  debug: DEBUG_PROMPT,
  explain: EXPLAIN_PROMPT,
  architecture: ARCHITECTURE_PROMPT,
  execution: EXECUTION_PROMPT,
  github: GITHUB_REVIEWER_PROMPT,
  security: SECURITY_PROMPT,
  refactor: 'You are WaspAI, a staff engineer. Refactor the following code for better readability and performance without changing its functionality.'
};

interface Message {
  role: 'user' | 'assistant' | 'model';
  text: string;
}

interface RagDocument {
  file_path: string;
  content: string;
}

// Configuración de Helicone
const getHeliconeOptions = () => {
  const key = process.env.HELICONE_API_KEY;
  if (!key) {
    console.warn('⚠️ [Helicone]: No API Key found in environment.');
    return undefined;
  }
  
  // LOG PARA DEBUG: Vamos a ver si el SDK recibe esto
  console.log('🚀 [Helicone]: Attempting to route through Helicone Gateway...');
  
  return {
    baseUrl: "https://gateway.helicone.ai",
    customHeaders: {
      "Helicone-Auth": `Bearer ${key}`,
      "Helicone-Target-URL": "https://generativelanguage.googleapis.com",
    },
  };
};

async function getGitHubContext(text: string) {
  // Regex para PRs y Repos
  const prRegex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
  const repoRegex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/)?$/;
  
  const prMatch = text.match(prRegex);
  const repoMatch = text.match(repoRegex);
  
  if (!prMatch && !repoMatch) return '';

  try {
    if (prMatch) {
      const [ , owner, repo, prNumber] = prMatch;
      const diffUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}.diff`;
      const response = await fetch(diffUrl);
      if (!response.ok) return `\n[ERROR: Could not fetch PR #${prNumber} diff]\n`;
      const diffText = await response.text();
      return `\n\n[GITHUB CONTEXT: PR #${prNumber}]\n${diffText.substring(0, 15000)}`;
    } else if (repoMatch) {
      const [ , owner, repo] = repoMatch;
      // Para repositorios, intentamos ver si el usuario quiere info del repo
      // Podríamos usar la API de GitHub, pero por ahora damos contexto de que es un REPO
      return `\n\n[GITHUB CONTEXT: REPOSITORY DETECTED]\n` +
             `The user provided a link to the repository: https://github.com/${owner}/${repo}\n` +
             `As a Ghost Reviewer, analyze this project structure if the user asks for it.`;
    }
    return '';
  } catch (err) {
    console.error('[GitHub Context Error]:', err);
    return '';
  }
}

async function getLocalBrainContext(query: string, geminiKey: string, supabaseClient: SupabaseClient, depth: number = 5) {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel(
      { model: "text-embedding-004" },
      getHeliconeOptions()
    );

    // Si la cuota de embeddings está agotada, esto va a fallar.
    // Lo envolvemos para que el chat siga funcionando aunque el RAG falle.
    const result = await model.embedContent(query).catch(err => {
      console.warn('⚠️ [RAG]: Embedding quota exceeded or error.', err.message);
      return null;
    });

    if (!result) return '';

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
    console.log('📄 [RAG Files]:', (documents as RagDocument[]).map((d: RagDocument) => d.file_path).join(', '));

    return `\n\n[IMPORTANT: LOCAL CONTEXT FOUND]\n` +
      `Use the following code snippets from the current project to answer the query accurately. \n\n` +
      (documents as RagDocument[]).map((doc: RagDocument) => `--- FILE: ${doc.file_path} ---\n${doc.content}`).join('\n');
  } catch (err) {
    console.error('[Local Brain Error]:', err);
    return '';
  }
}

export const maxDuration = 60;

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

    const activeAgent = config?.agent || 'general';
    let githubContext = '';
    if (activeAgent === 'github') {
      githubContext = await getGitHubContext(lastUserMessage);
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

    // Volvemos a v1beta y al modelo que el usuario confirmó que funcionaba
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Dejamos el modelo que el usuario indica como estable para su entorno
    const modelToUse = config?.model || "gemini-2.5-flash";
    
    // SMART INTENT ROUTING (Lead Engineer Level)
    // Si el usuario usa el agente 'general', intentamos detectar si la consulta
    // amerita activar un cerebro especializado automáticamente.
    let activePrompt = PROMPTS[mode];
    
    if (activeAgent !== 'general') {
      activePrompt = PROMPTS[activeAgent] || PROMPTS[mode];
    } else {
      // Detección de intención por Keywords
      const lowerMsg = lastUserMessage.toLowerCase();
      if (lowerMsg.includes('vulnerabilidad') || lowerMsg.includes('seguridad') || lowerMsg.includes('ataque') || lowerMsg.includes('inyección')) {
        console.log('🎯 [Smart Routing]: Security Agent Activated');
        activePrompt = PROMPTS.security;
      } else if (lowerMsg.includes('arquitectura') || lowerMsg.includes('diagrama') || lowerMsg.includes('infraestructura')) {
        console.log('🎯 [Smart Routing]: Architecture Agent Activated');
        activePrompt = PROMPTS.architecture;
      } else if (lowerMsg.includes('github') || lowerMsg.includes('pull request') || lowerMsg.includes('pr ')) {
        console.log('🎯 [Smart Routing]: GitHub Agent Activated');
        activePrompt = PROMPTS.github;
      }
    }

    const basePrompt = activePrompt;

    // USAMOS v1beta (Donde gemini-1.5/2.5 y las systemInstructions son nativas)
    const model = genAI.getGenerativeModel(
      { model: modelToUse },
      { ...getHeliconeOptions(), apiVersion: 'v1beta' }
    );

    // Inyección de contexto manual para garantizar que el modelo siga la "persona" sin errores de esquema
    const fullPrompt = `[SYSTEM_INSTRUCTION]\n${basePrompt}${ragContext}${githubContext}\n\n[USER_MESSAGE]\n${lastUserMessage}`;

    const history = messages.slice(0, -1).map((m: Message) => ({
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
          contents: [...history, { role: 'user', parts: [{ text: fullPrompt }] }]
        });
        break; // Éxito, salimos del bucle
      } catch (error: unknown) {
        serverAttempt++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Solo reintentamos si es un error 503 (Servidor ocupado)
        if (errorMessage.includes('503')) {
          console.warn(`⚠️ [API] Gemini Busy (Attempt ${serverAttempt}/${MAX_SERVER_RETRIES}). Retrying...`);
          if (serverAttempt === MAX_SERVER_RETRIES) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * serverAttempt));
          continue;
        }
        
        // Si es un 429 (Cuota), no reintentamos en el servidor, tiramos el error para que el cliente lo maneje
        if (errorMessage.includes('429')) {
          console.error('🚫 [API] Gemini Quota Exceeded (429).');
          return new Response(JSON.stringify({ 
            error: 'API Quota Exceeded', 
            details: 'The free tier limit of 20 requests per minute has been reached. Please wait about 60 seconds.' 
          }), { status: 429 });
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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      }
    }), { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
