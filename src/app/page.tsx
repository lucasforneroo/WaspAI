'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import SettingsModal from '@/components/SettingsModal';
import LightPillar from '@/components/LightPillar';
import { getChats } from '@/app/actions/chat';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Estado de Configuración Global
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    model: 'gemini-2.5-flash',
    ragDepth: 5,
    bgEnabled: true
  });

  // Obtener usuario
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const userData = {
          name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'Developer',
          avatar: data.user.user_metadata.avatar_url,
          email: data.user.email
        };
        setUser(userData);

        // Guardar en la lista de cuentas conocidas para el login picker
        const saved = localStorage.getItem('waspai-known-accounts');
        let knownAccounts = saved ? JSON.parse(saved) : [];
        
        // Evitar duplicados por email
        if (!knownAccounts.find((acc: any) => acc.email === userData.email)) {
          knownAccounts.push(userData);
          localStorage.setItem('waspai-known-accounts', JSON.stringify(knownAccounts));
        }
      }
    });
  }, []);

  // Cargar config de localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem('waspai-settings');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }, []);

  // Guardar config cuando cambie
  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
    localStorage.setItem('waspai-settings', JSON.stringify(newConfig));
  };

  const fetchChats = useCallback(async () => {
    const data = await getChats();
    setChats(data);
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (deletedId: string) => {
    if (activeChatId === deletedId) {
      setActiveChatId(null);
    }
    fetchChats();
  };

  const handleChatCreated = (newChatId: string) => {
    setActiveChatId(newChatId);
    fetchChats();
  };

  return (
    <div className="flex h-screen bg-[#060010] text-slate-100 overflow-hidden font-sans relative">
      {config.bgEnabled && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <LightPillar
            topColor="#bb00ff"
            bottomColor="#fff700"
            intensity={0.8}
            rotationSpeed={0.3}
            glowAmount={0.002}
            pillarWidth={4}
            pillarHeight={0.3}
            noiseIntensity={0.2}
            pillarRotation={36}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
      )}
      
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          chats={chats} 
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
          <div className="flex-1 overflow-hidden h-full">
            <Chat 
              activeChatId={activeChatId} 
              onChatCreated={handleChatCreated}
              config={config} 
              user={user}
            />
          </div>
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}
