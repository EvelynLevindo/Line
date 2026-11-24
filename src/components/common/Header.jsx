import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ArrowLeft, HeartHandshake } from 'lucide-react';

export default function Header() {
  const { activeLayer, publicTab, setPublicTab, quickEscape } = useApp();
  const { userProfile } = useAuth();

  const isHidden = activeLayer === 'hidden';

  const getPublicSubtitle = () => {
    switch (publicTab) {
      case 'calendar': return 'Calendário';
      case 'reminders': return 'Lembretes';
      case 'profile': return 'Perfil';
      default: return 'Início';
    }
  };

  return (
    <header className="fixed top-0 w-full max-w-[440px] z-50 bg-[#fff8f7]/90 backdrop-blur-xl border-b border-[#ffe8ec]/80 pt-safe">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left Branding / Navigation */}
        <div className="flex items-center gap-2.5">
          {isHidden ? (
            <button
              onClick={() => quickEscape(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#2e131b] hover:text-[#7e001d] active:scale-95 transition-transform"
              aria-label="Voltar à tela pública"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${isHidden ? 'bg-[#7e001d] text-white' : 'bg-gradient-to-tr from-[#7e001d] to-[#fe6a7b] text-white'}`}>
              {isHidden ? (
                <HeartHandshake className="w-4 h-4" />
              ) : (
                <span className="text-base select-none">🌸</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-base font-bold text-[#7e001d] tracking-tight leading-tight">
                {isHidden ? 'Apoio Line' : 'Line'}
              </span>
              <span className="text-[11px] font-medium text-[#5a4040] leading-none">
                {isHidden ? 'Rede de Proteção' : `Aura Ciclo • ${getPublicSubtitle()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons (Protection icon REMOVED per user requirement) */}
        <div className="flex items-center gap-1.5">
          {isHidden ? (
            <button
              onClick={() => quickEscape(false)}
              className="h-9 px-3 rounded-full bg-[#ffe8ec] text-[#7e001d] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#ffd9e0] active:scale-95 transition-all shadow-xs"
              title="Voltar ao Calendário"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              onClick={() => setPublicTab('profile')}
              aria-label="Meu Perfil"
              title="Meu Perfil"
              className="w-9 h-9 rounded-full bg-[#7e001d] flex items-center justify-center text-white shadow-xs active:scale-95 transition-transform"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
