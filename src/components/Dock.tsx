'use client';

import React, { useState, Children, cloneElement, ReactElement } from 'react';

export default function Dock({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {Children.map(children, child => cloneElement(child as ReactElement<any>, { isHovered }))}
    </div>
  );
}
