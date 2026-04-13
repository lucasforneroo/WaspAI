'use server'

import { createClient } from '@/utils/supabase/server'

export async function getChats() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[getChats] Error:', error)
    return []
  }
  return data || []
}

export async function deleteChat(chatId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)

  if (error) {
    console.error('[deleteChat] Error:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function getMessages(chatId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getMessages] Error:', error)
    return []
  }
  
  // Mapear al formato local
  return (data || []).map(msg => ({
    role: msg.role as 'user' | 'assistant',
    text: msg.content
  }))
}
