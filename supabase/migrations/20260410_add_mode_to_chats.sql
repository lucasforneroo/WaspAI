-- Migración para persistir el modo/agente por chat
ALTER TABLE chats ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'review';
