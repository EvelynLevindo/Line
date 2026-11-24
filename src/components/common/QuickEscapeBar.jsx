import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';

export default function QuickEscapeBar() {
  const { quickEscape } = useApp();

  return (
    <div className="w-full flex flex-col gap-2 mb-3 select-none">
      {/* Primary Panic Button */}
      <div className="flex gap-2">
        <button
          onClick={() => quickEscape(false)}
          className="flex-1 min-h-[52px] bg-red-700 hover:bg-red-800 text-white rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-md active:scale-98 transition-all"
          title="Fecha a camada oculta e volta imediatamente para o calendário de saúde"
          aria-label="Saída rápida de emergência para o calendário"
        >
          <div className="flex items-center gap-2 text-left">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-200">
                Saída Rápida (ESC)
              </span>
              <span className="text-[13px] font-semibold leading-tight">
                Voltar ao Calendário
              </span>
            </div>
          </div>
          <div className="bg-red-900/60 px-2 py-1 rounded-lg text-xs font-mono font-bold text-white/90">
            ESC
          </div>
        </button>

        {/* Secondary Google escape */}
        <button
          onClick={() => quickEscape(true)}
          className="min-h-[52px] px-3.5 bg-neutral-900 hover:bg-black text-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-md active:scale-95 transition-all shrink-0"
          title="Apaga a tela e redireciona imediatamente para o Google"
          aria-label="Sair imediatamente e abrir Google"
        >
          <ExternalLink className="w-4 h-4 text-neutral-400 mb-0.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Google
          </span>
        </button>
      </div>

      {/* Security reassurance banner */}
      <div className="w-full bg-[#ffe8ec] border border-[#ffdadb] rounded-xl px-3 py-1.5 flex items-center justify-center gap-1.5 text-[#5a4040]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="text-[11px] font-medium tracking-tight text-center">
          Sessão segura · Sem histórico salvo no navegador · Retorno instantâneo
        </span>
      </div>
    </div>
  );
}
