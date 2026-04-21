'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GreetingProps {
  userName: string;
}

export default function Greeting({ userName }: GreetingProps) {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'Madrugando para programar?';
    if (hour >= 8 && hour < 12) return 'Buenos días, ¿comenzamos?';
    if (hour >= 12 && hour < 19) return 'Buenas tardes, ¡a trabajar!';
    if (hour >= 19 && hour < 24) return 'Buenas noches, ¿descansamos o programamos?';
    return 'Despierto tan tarde? Eres todo un trasnochador!';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-row items-center justify-center gap-4 py-6 text-left max-w-2xl mx-auto"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0"
      >
        <Image 
          src="/logo.png" 
          alt="WaspAI Logo" 
          width={56} 
          height={56} 
          priority
          className="object-contain drop-shadow-[0_0_20px_rgba(245,255,136,0.4)]" 
        />
      </motion.div>

      <div className="space-y-0.5">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-100 italic font-serif">
          {getTimeOfDay()}, <span className="text-yellow-wasp not-italic font-sans font-bold">{userName}</span>
        </h1>
        <p className="text-base md:text-lg text-slate-400 font-medium leading-none">
          ¿En qué código vamos a trabajar hoy?
        </p>
      </div>
    </motion.div>
  );
}
