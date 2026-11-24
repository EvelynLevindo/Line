import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Calendar, Clock, Droplets, ArrowRight } from 'lucide-react';

export default function OnboardingModal() {
  const { userProfile, completeOnboarding } = useAuth();

  // Initial suggested values
  const today = new Date();
  const defaultLastPeriod = new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0];

  const [lastPeriodDate, setLastPeriodDate] = useState(defaultLastPeriod);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user profile is missing or already onboarded, don't show modal
  if (!userProfile || userProfile.onboardingCompleted) {
    return null;
  }

  const handleFinish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        lastPeriodDate: lastPeriodDate || defaultLastPeriod,
        cycleLength: Number(cycleLength) || 28,
        periodDuration: Number(periodDuration) || 5
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-2xl border border-[#ffe8ec] flex flex-col gap-5 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe8ec] text-[#7e001d] flex items-center justify-center mb-2 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#7e001d]" />
          </div>
          <h2 className="text-xl font-bold text-[#2e131b]">
            Olá, {userProfile.name || 'Sofia'} ✨
          </h2>
          <p className="text-xs text-[#5a4040] mt-1 leading-relaxed">
            Para personalizar o seu calendário menstrual e prever suas fases com exatidão, precisamos de apenas 3 informações:
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleFinish} className="flex flex-col gap-4">
          {/* 1. Data da última menstruação */}
          <div className="bg-[#fff0f2] p-3.5 rounded-2xl border border-[#ffe8ec] flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#7e001d] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              1. Quando começou sua última menstruação?
            </label>
            <input
              type="date"
              required
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full mt-1 bg-white border border-[#e2bebe] rounded-xl px-3 py-2 text-xs font-semibold text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
            />
            <span className="text-[10px] text-[#5a4040]">
              Pode ser aproximado caso não se lembre com precisão.
            </span>
          </div>

          {/* 2. Duração média do ciclo */}
          <div className="bg-[#fff0f2] p-3.5 rounded-2xl border border-[#ffe8ec] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#7e001d] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                2. Duração média do seu ciclo:
              </label>
              <span className="text-xs font-bold bg-white text-[#7e001d] px-2.5 py-0.5 rounded-full border border-[#ffe8ec]">
                {cycleLength} dias
              </span>
            </div>
            <input
              type="range"
              min="21"
              max="40"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-[#7e001d] mt-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#5a4040]">
              <span>21 dias (mais curto)</span>
              <span>28 dias (padrão)</span>
              <span>40 dias (mais longo)</span>
            </div>
          </div>

          {/* 3. Duração do fluxo */}
          <div className="bg-[#fff0f2] p-3.5 rounded-2xl border border-[#ffe8ec] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#7e001d] flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                3. Quantos dias dura seu fluxo (sangramento)?
              </label>
              <span className="text-xs font-bold bg-white text-[#7e001d] px-2.5 py-0.5 rounded-full border border-[#ffe8ec]">
                {periodDuration} dias
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(Number(e.target.value))}
              className="w-full accent-[#7e001d] mt-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#5a4040]">
              <span>2 dias</span>
              <span>5 dias (comum)</span>
              <span>10 dias</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-full bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Configurando seu ciclo...' : 'Configurar e Acessar Meu Ciclo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
