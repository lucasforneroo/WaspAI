'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import LightPillar from '@/components/LightPillar'
import { Plus, User, ArrowRight, Code } from 'lucide-react'

export default function LoginPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    // Cargar cuentas guardadas localmente
    const saved = localStorage.getItem('waspai-known-accounts')
    if (saved) {
      setAccounts(JSON.parse(saved))
      setShowPicker(true)
    }
  }, [])

  const handleGithubLogin = async (forceNew = false) => {
    const supabase = createClient()
    
    // Si queremos forzar una cuenta nueva, primero limpiamos la sesión local
    if (forceNew) {
      await supabase.auth.signOut();
    }

    const options: any = {
      redirectTo: `${window.location.origin}/auth/callback`,
    }

    // Usamos una combinación de parámetros para intentar forzar a GitHub
    if (forceNew) {
      options.queryParams = {
        prompt: 'consent',
        allow_reauthentication: 'true'
      }
    }

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options,
    })
  }

  const removeAccount = (email: string) => {
    const newAccounts = accounts.filter(acc => acc.email !== email);
    setAccounts(newAccounts);
    localStorage.setItem('waspai-known-accounts', JSON.stringify(newAccounts));
    if (newAccounts.length === 0) setShowPicker(false);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#060010] text-white relative overflow-hidden font-sans">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="#bb00ff"
          bottomColor="#fff700"
          intensity={0.8}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={4}
          pillarHeight={0.3}
          noiseIntensity={0.2}
          pillarRotation={45}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 p-10 bg-[#1a141b]/80 backdrop-blur-2xl border border-yellow-wasp/20 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] max-w-md w-full mx-4 transition-all duration-500">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-yellow-wasp rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,255,136,0.3)] rotate-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#060010" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            WASP<span className="text-yellow-wasp">AI</span>
          </h1>
        </div>

        {showPicker && accounts.length > 0 ? (
          /* ACCOUNT PICKER VIEW */
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-slate-400 text-center text-sm font-bold uppercase tracking-widest mb-4">
              Seleccionar Cuenta
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {accounts.map((acc, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => handleGithubLogin(false)}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-wasp/30 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 shadow-md">
                      <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-100">{acc.name}</p>
                      <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-yellow-wasp group-hover:translate-x-1 transition-all" />
                  </button>
                  
                  <button 
                    onClick={() => removeAccount(acc.email)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[#1a141b] shadow-lg hover:scale-110"
                    title="Olvidar cuenta"
                  >
                    <Plus size={14} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={() => handleGithubLogin(true)}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl border border-dashed border-white/20 text-slate-400 hover:text-yellow-wasp hover:border-yellow-wasp/50 hover:bg-yellow-wasp/5 transition-all text-sm font-bold"
              >
                <Plus size={18} />
                Usar otra cuenta de GitHub
              </button>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-blue-400 font-bold uppercase block mb-1">Nota de Seguridad</span>
                Por seguridad, el login se realiza en los servidores de GitHub. Si se auto-conecta a la cuenta anterior, hacé click aquí: 
                <a href="https://github.com/logout" target="_blank" className="text-blue-400 underline ml-1 hover:text-blue-300 font-bold">Cerrar sesión en GitHub</a>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD LOGIN VIEW */
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
            <p className="text-slate-300 text-center text-sm font-medium leading-relaxed">
              The next generation of <span className="text-yellow-wasp font-bold italic">Engineering Intelligence</span>. 
              Sign in to access your terminal.
            </p>

            <button
              onClick={() => handleGithubLogin(false)}
              className="flex items-center gap-3 px-6 py-4 bg-yellow-wasp hover:bg-white text-purple-dark font-black rounded-2xl transition-all w-full justify-center group shadow-[0_10px_30px_rgba(245,255,136,0.2)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Code size={20} className="transition-transform group-hover:rotate-12" />
              Continuar con GitHub
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 mt-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Engineering Partner v2.5
          </p>
          <div className="h-1 w-12 bg-yellow-wasp/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
