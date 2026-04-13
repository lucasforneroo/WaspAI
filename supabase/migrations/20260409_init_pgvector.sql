-- 1. Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Crear la tabla para almacenar los embeddings de los archivos
CREATE TABLE IF NOT EXISTS file_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_path TEXT NOT NULL, -- Removido el UNIQUE
    content TEXT NOT NULL,
    embedding VECTOR(768), -- Dimensión para gemini-embedding-001 con outputDimensionality: 768
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE file_embeddings ENABLE ROW LEVEL SECURITY;

-- 4. Política: Solo lectura para usuarios autenticados (o lo que definamos luego)
CREATE POLICY "Authenticated users can read embeddings" ON file_embeddings
    FOR SELECT TO authenticated USING (true);

-- 5. Función RPC para búsqueda por similitud de coseno
-- Esta función será llamada desde nuestra API de chat
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  file_path TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    file_embeddings.id,
    file_embeddings.file_path,
    file_embeddings.content,
    file_embeddings.metadata,
    1 - (file_embeddings.embedding <=> query_embedding) AS similarity
  FROM file_embeddings
  WHERE 1 - (file_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
