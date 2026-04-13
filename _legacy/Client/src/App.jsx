import React, { useState } from 'react';
import Chat from './components/Chat';
import { MessageSquare, Plus, History, Settings, PanelLeft } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-wasp-purple text-slate-100 overflow-hidden font-sans">
      {/* Sidebar - Estilo Claude */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-wasp-purple-dark border-r border-wasp-purple-light transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex flex-col h-full">
          <button className="flex items-center gap-2 w-full p-3 border border-wasp-purple-light rounded-xl hover:bg-wasp-purple-light transition-colors mb-6 text-sm">
            <Plus size={18} className="text-wasp-yellow" />
            <span>New Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">History</p>
            {/* Placeholder de historial */}
            <div className="p-2 rounded-lg hover:bg-wasp-purple-light cursor-pointer text-sm truncate flex items-center gap-2">
              <MessageSquare size={14} />
              <span>Fixing auth middleware...</span>
            </div>
            <div className="p-2 rounded-lg hover:bg-wasp-purple-light cursor-pointer text-sm truncate flex items-center gap-2 text-slate-400">
              <MessageSquare size={14} />
              <span>React performance tips</span>
            </div>
          </div>

          <div className="pt-4 border-t border-wasp-purple-light space-y-2">
            <button className="flex items-center gap-2 w-full p-2 hover:bg-wasp-purple-light rounded-lg text-sm transition-colors">
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header simple */}
        <header className="h-14 border-b border-wasp-purple-light flex items-center px-4 justify-between bg-wasp-purple/50 backdrop-blur-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-wasp-purple-light rounded-lg transition-colors"
          >
            <PanelLeft size={20} className="text-wasp-yellow" />
          </button>
          <div className="font-bold text-wasp-yellow tracking-tighter text-xl">WaspAI</div>
          <div className="w-8 h-8 rounded-full bg-wasp-yellow text-wasp-purple flex items-center justify-center font-bold text-xs">
            JD
          </div>
        </header>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>
      </main>
    </div>
  );
}
