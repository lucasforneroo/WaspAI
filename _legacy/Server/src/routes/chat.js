import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { REVIEW_PROMPT } from '../prompts/review.js';
import { DEBUG_PROMPT } from '../prompts/debug.js';
import { EXPLAIN_PROMPT } from '../prompts/explain.js';

const router = express.Router();

const PROMPTS = {
  review: REVIEW_PROMPT,
  debug: DEBUG_PROMPT,
  explain: EXPLAIN_PROMPT,
  refactor: 'You are WaspAI, a senior engineer. Refactor the following code for better readability and performance without changing its functionality.'
};

router.post('/', async (req, res) => {
  const { messages, mode = 'review' } = req.body;

  // En 2026 usamos el nuevo SDK @google/genai
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  if (!messages || !messages.length) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  // Configuramos los headers para Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const history = messages
      .slice(0, -1)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

    const lastMessage = messages[messages.length - 1].text;

    // Usamos el Stream de Gemini 3.1
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      systemInstruction: PROMPTS[mode] || PROMPTS.review,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ]
    });

    // Iteramos sobre el resultado directamente (es un async iterator)
    for await (const chunk of result) {
      if (chunk.text) {
        // Formato SSE: data: <mensaje>\n\n
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('[Gemini Stream Error]:', error.message);
    // En SSE los errores también se mandan por el stream si es posible
    res.write(`data: ${JSON.stringify({ error: 'Hubo un error con el flujo de datos loco.' })}\n\n`);
    res.end();
  }
});

export default router;
