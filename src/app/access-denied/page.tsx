'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#060010] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#1a141b]/50 backdrop-blur-xl border border-purple-light/20 p-10 rounded-[2.5rem] shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-wasp/20 blur-2xl rounded-full" />
            <Image 
              src="/logo.png" 
              alt="WaspAI Logo" 
              width={100} 
              height={100} 
              className="relative object-contain drop-shadow-[0_0_15px_rgba(245,255,136,0.5)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 text-red-400">
          <ShieldAlert size={20} />
          <h1 className="text-xl font-black uppercase tracking-widest">Acceso Restringido</h1>
        </div>

        <h2 className="text-3xl font-bold text-slate-100 mb-6 leading-tight">
          ¡El panal está en <span className="text-yellow-wasp">Beta Privada</span>!
        </h2>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Actualmente WaspAI está en una fase de pruebas controlada. Tu cuenta ha sido registrada, pero necesitas una invitación para comenzar a operar.
        </p>

        <div className="space-y-4">
          <a 
            href="mailto:lucasfornero2012@gmail.com?subject=Solicitud de Acceso a WaspAI" 
            className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-200 transition-all font-bold group"
          >
            <Mail size={18} className="group-hover:text-yellow-wasp transition-colors" />
            Solicitar Acceso
          </a>

          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-yellow-wasp transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Volver al Login
          </Link>
        </div>
      </motion.div>

      <p className="mt-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
        WaspAI Engineering Terminal • v0.1.0
      </p>
    </div>
  );
}
