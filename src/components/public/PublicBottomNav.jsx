import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Calendar as CalendarIcon, Sparkles, User } from 'lucide-react';

export default function PublicBottomNav() {
  const { publicTab, setPublicTab } = useApp();

  return (
    <div className="fixed bottom-0 w-full max-w-[440px] z-40 pb-safe pointer-events-none px-4 mb-3">
      <nav className="pointer-events-auto h-16 w-full rounded-full bg-white/95 backdrop-blur-xl border border-[#ffe8ec] shadow-[0_8px_30px_rgba(91,58,66,0.12)] flex items-center justify-around px-2">
        {/* Início */}
        <button
          type="button"
          onClick={() => setPublicTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors active:scale-95 ${
            publicTab === 'dashboard'
              ? 'text-[#7e001d] font-bold'
              : 'text-[#5a4040] hover:text-[#7e001d]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        {/* Calendário */}
        <button
          type="button"
          onClick={() => setPublicTab('calendar')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors active:scale-95 ${
            publicTab === 'calendar'
              ? 'text-[#7e001d] font-bold'
              : 'text-[#5a4040] hover:text-[#7e001d]'
          }`}
        >
          <CalendarIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Calendário</span>
        </button>

        {/* Lembretes */}
        <button
          type="button"
          onClick={() => setPublicTab('reminders')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors active:scale-95 ${
            publicTab === 'reminders'
              ? 'text-[#7e001d] font-bold'
              : 'text-[#5a4040] hover:text-[#7e001d]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lembretes</span>
        </button>

        {/* Perfil (Fully Activated) */}
        <button
          type="button"
          onClick={() => setPublicTab('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors active:scale-95 ${
            publicTab === 'profile'
              ? 'text-[#7e001d] font-bold'
              : 'text-[#5a4040] hover:text-[#7e001d]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
