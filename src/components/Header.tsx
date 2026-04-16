'use client';

import React from 'react';
import { PanelLeft } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: { name: string; avatar: string };
}

export default function Header({ onToggleSidebar, user }: HeaderProps) {
  return (
    <header className="h-20 border-b border-purple-light/10 flex items-center px-8 justify-between bg-[#3b2a3d]/30 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-yellow-wasp hover:scale-110 active:scale-95 opacity-100-forced shadow-lg"
        >
          <PanelLeft size={22} />
        </button>

        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="WaspAI Logo" 
            width={56} 
            height={56} 
            className="object-contain drop-shadow-[0_0_18px_rgba(245,255,136,0.7)]" 
          />
          <div className="flex flex-col">
            <div className="font-black text-yellow-wasp tracking-tighter text-3xl select-none drop-shadow-[0_0_15px_rgba(245,255,136,0.4)] opacity-100-forced leading-none">
              WaspAI
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ml-0.5">Engineering Terminal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Developer</p>
            <p className="text-xs text-slate-200 font-semibold">{user.name}</p>
          </div>
        )}
        <div className="w-9 h-9 rounded-xl bg-yellow-wasp overflow-hidden border-2 border-yellow-wasp/30 shadow-lg hover:scale-110 transition-transform cursor-pointer opacity-100-forced">
          {user?.avatar ? (
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={36} 
              height={36} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple font-bold text-sm">
              {user?.name?.substring(0, 2).toUpperCase() || '??'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
