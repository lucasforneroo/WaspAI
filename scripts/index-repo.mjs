import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 1. Cargar variables de entorno
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'public', '_legacy'];
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.md', '.css'];

// 2. Funciones de utilidad
function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function chunkText(text, size = 1500, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

async function getFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (!IGNORE_DIRS.some(ignored => name.includes(ignored))) {
        await getFiles(name, allFiles);
      }
    } else {
      if (ALLOWED_EXTENSIONS.includes(path.extname(name))) {
        allFiles.push(name);
      }
    }
  }
  return allFiles;
}

// 3. Proceso Principal
async function main() {
  console.log('🚀 Iniciando indexación inteligente...');
  
  const files = await getFiles('.');
  console.log(`📂 Analizando ${files.length} archivos...`);

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileHash = generateHash(content);

      // Verificar si el archivo ya fue indexado y no cambió (basado en metadata hash)
      // Nota: Para esto necesitaríamos que la tabla guarde el hash. 
      // Por ahora vamos a re-indexar pero con CHUNKING para mejorar la calidad.

      console.log(`📦 Procesando chunks para: ${filePath}...`);
      const chunks = chunkText(content);

      // Borramos los chunks viejos de este archivo antes de subir los nuevos
      await supabase.from('file_embeddings').delete().eq('file_path', filePath);

      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const result = await model.embedContent({
          content: { parts: [{ text: chunkContent }] },
          outputDimensionality: 768
        });
        const embedding = result.embedding.values;

        const { error } = await supabase
          .from('file_embeddings')
          .insert({
            file_path: filePath,
            content: chunkContent,
            embedding: embedding,
            metadata: { 
              extension: path.extname(filePath),
              chunk_index: i,
              total_chunks: chunks.length,
              hash: fileHash
            }
          });

        if (error) throw error;
      }

    } catch (err) {
      console.error(`❌ Error en ${filePath}:`, err.message);
    }
  }

  console.log('✅ ¡Cerebro Local actualizado y optimizado con chunks!');
}

main();
