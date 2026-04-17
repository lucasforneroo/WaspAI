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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6"
    >
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-10"
      >
        <Image 
          src="/logo.png" 
          alt="WaspAI Logo" 
          width={224} 
          height={224} 
          className="object-contain drop-shadow-[0_0_50px_rgba(245,255,136,0.5)]" 
        />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-100 italic font-serif">
          {getTimeOfDay()}, <span className="text-yellow-wasp not-italic font-sans font-bold">{userName}</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
          ¿En qué código vamos a trabajar hoy? <br/>
        </p>
      </div>
    </motion.div>
  );
}
