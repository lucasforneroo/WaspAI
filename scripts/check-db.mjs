import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { count, error } = await supabase
    .from('file_embeddings')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Total registros en file_embeddings:', count);
  }
  
  // Ver un ejemplo de contenido
  const { data: sample } = await supabase.from('file_embeddings').select('file_path, content').limit(1);
  console.log('📂 Ejemplo de archivo indexado:', sample?.[0]?.file_path);
}

check();
