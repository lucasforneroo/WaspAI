'use client';

import React, { useState } from 'react';
import { Settings, Search, Edit, Trash2, LogOut } from 'lucide-react';
import { deleteChat } from '@/app/actions/chat';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  chats: any[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ isOpen, chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onOpenSettings }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevenir que se seleccione el chat al intentar borrar
    setDeletingId(chatId);
    try {
      const res = await deleteChat(chatId);
      if (res.success) {
        onDeleteChat(chatId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside 
      className={`${
        isOpen ? 'w-[260px]' : 'w-0'
      } bg-[#171717] transition-all duration-300 flex flex-col h-full overflow-hidden shrink-0`}
    >
      <div className="p-3 flex flex-col h-full w-[260px] text-sm text-[#ececec]">
        {/* Top actions */}
        <button 
          onClick={onNewChat}
          className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-[#202020] transition-colors mb-4 font-medium group"
        >
          <div className="flex bg-[#ececec] text-[#171717] rounded-full p-1 group-hover:scale-105 transition-transform">
             <Edit size={14} />
          </div>
          <span className="flex-1 text-left">Nuevo chat</span>
        </button>
        
        <div className="relative mb-6">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar chats" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202020] border-none text-[#ececec] rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-500"
          />
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto space-y-0.5 no-scrollbar px-1">
          <p className="text-xs font-semibold text-gray-500 mb-3 px-2 mt-2">Recientes</p>
          
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-2 rounded-lg cursor-pointer truncate flex items-center justify-between transition-colors group ${
                activeChatId === chat.id ? 'bg-[#202020] font-medium text-white' : 'hover:bg-[#202020] text-gray-300'
              }`}
            >
              <span className="truncate flex-1 pr-2">{chat.title}</span>
              
              <button 
                onClick={(e) => handleDelete(e, chat.id)}
                disabled={deletingId === chat.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-400 disabled:text-gray-600 focus:outline-none"
                title="Borrar chat"
              >
                <Trash2 size={16} className={deletingId === chat.id ? "animate-pulse" : ""} />
              </button>
            </div>
          ))}

          {filteredChats.length === 0 && (
             <p className="text-gray-500 text-xs px-2 italic mt-4">No hay chats recientes</p>
          )}
        </div>

        {/* Footer/Settings & Logout */}
        <div className="pt-2 mt-auto border-t border-purple-light/10 space-y-1">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full p-3 hover:bg-[#202020] rounded-lg transition-colors text-gray-300 font-medium group"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
            <span>Configuración</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 hover:bg-[#202020] rounded-lg transition-colors text-red-400 font-medium group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
