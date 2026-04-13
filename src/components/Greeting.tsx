'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GreetingProps {
  userName: string;
}

export default function Greeting({ userName }: GreetingProps) {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 8 && hour > 5) return 'Madrugando para programar?';
    if (hour < 12 && hour > 8) return 'Buenos días, ¿comenzamos?';
    if (hour < 19 && hour > 12) return 'Buenas tardes, ¡a trabajar!';
    if (hour < 24 && hour > 19) return 'Buenas noches, ¿descansamos o programamos?';
    return 'Despierto tan tarde? Eres todo un trasnochador!';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-100 italic font-serif">
          {getTimeOfDay()}, <span className="text-yellow-wasp not-italic font-sans font-bold">{userName}</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
          ¿En qué código vamos a trabajar hoy? <br/>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full px-4 pt-10">
        {[
          { title: 'Review', desc: 'Analizar arquitectura y bugs' },
          { title: 'Explain', desc: 'Entender lógica compleja' },
          { title: 'Refactor', desc: 'Optimizar y limpiar código' }
        ].map((box, i) => (
          <motion.div
            key={box.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors cursor-default"
          >
            <h3 className="font-bold text-yellow-wasp text-sm mb-1">{box.title}</h3>
            <p className="text-xs text-slate-400">{box.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
