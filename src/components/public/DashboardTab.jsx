import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LogModal from './LogModal';
import { PlusCircle, Check } from 'lucide-react';

const MOODS = [
  { label: 'Calma', emoji: '🌸' },
  { label: 'Animada', emoji: '✨' },
  { label: 'Sensível', emoji: '🥺' },
  { label: 'Ansiosa', emoji: '💭' },
];

const QUICK_SYMPTOMS = [
  { id: 'Cólica leve', label: 'Cólica leve' },
  { id: 'Disposição', label: 'Disposição' },
  { id: 'Dor de cabeça', label: 'Dor de cabeça' },
  { id: 'Inchaço', label: 'Inchaço' },
];

const FLOWS = ['Nenhum', 'Leve', 'Médio', 'Intenso'];

export default function DashboardTab() {
  const { logs, cycleStats, toggleSymptom, setMood, setFlow, selectedDate } = useCycle();
  const { userProfile } = useAuth();
  const { showToast, triggerHiddenLayer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Discreet secret hold on the flower icon
  const [holdProgress, setHoldProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs[todayStr] || {
    flow: 'none',
    mood: '',
    symptoms: [],
    notes: ''
  };

  const handleStartHold = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setHoldProgress(0);
        triggerHiddenLayer();
      }
    }, 150); // 1.5s hold
    setPressTimer(interval);
  };

  const handleCancelHold = () => {
    if (pressTimer) {
      clearInterval(pressTimer);
      setPressTimer(null);
      setHoldProgress(0);
    }
  };

  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const userName = userProfile?.name || 'Sofia';

  // SVG Clue-style dial calculations
  const circumference = 257.6;
  const progressRatio = Math.min(1, Math.max(0, cycleStats.currentDay / cycleStats.cycleLength));
  const progressOffset = circumference - (circumference * progressRatio);

  const fertileStartRatio = cycleStats.fertileStart / cycleStats.cycleLength;
  const fertileArcLength = ((cycleStats.fertileEnd - cycleStats.fertileStart + 1) / cycleStats.cycleLength) * circumference;

  return (
    <div className="flex flex-col w-full pb-8 space-y-5">
      {/* Top Greeting & Camouflaged Security Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#ad2e42] tracking-wider uppercase">
            {formattedDate}
          </span>
          <h1 className="text-2xl font-bold text-[#2e131b] tracking-tight">
            Olá, {userName} ✨
          </h1>
        </div>

        {/* Discreet Micro Trigger: Flower Sync Icon */}
        <div className="relative">
          <button
            onMouseDown={handleStartHold}
            onMouseUp={handleCancelHold}
            onMouseLeave={handleCancelHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleCancelHold}
            onClick={() => showToast('Ciclo atualizado em tempo real.')}
            className="w-12 h-12 rounded-full bg-[#ffe8ec] hover:bg-[#ffd9e0] flex items-center justify-center text-[#7e001d] transition-all active:scale-90 select-none relative shadow-xs"
            title="Sincronização Segura do Ciclo"
            aria-label="Sincronização Segura"
          >
            <span className="text-xl">🌸</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fe6a7b] animate-pulse"></span>
            
            {holdProgress > 0 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  stroke="#7e001d"
                  strokeWidth="3"
                  strokeDasharray="132"
                  strokeDashoffset={132 - (132 * holdProgress) / 100}
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section: Central Cycle Dial (Estilo Clue, 100% Sincronizado com Calendário) */}
      <div className="relative w-full bg-white rounded-3xl p-5 shadow-xs border border-[#ffe8ec] flex flex-col items-center overflow-hidden">
        {/* Soft Background Ambiance */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ffe8ec] opacity-60 filter blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#ffe1e6] opacity-50 filter blur-xl pointer-events-none"></div>

        {/* Cycle Ring Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center my-1">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="transparent"
              stroke="#ffd9e0"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Fertile Window Arc */}
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="transparent"
              stroke="#fe6a7b"
              strokeWidth="7"
              strokeDasharray={`${fertileArcLength} ${circumference}`}
              strokeDashoffset={-(fertileStartRatio * circumference)}
              strokeLinecap="round"
            />
            {/* Active Cycle Progress Tracker */}
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="transparent"
              stroke="#a60f2d"
              strokeWidth="7.5"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Typography & State Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-[11px] text-[#ad2e42] uppercase font-bold tracking-wider">
              {cycleStats.phase}
            </span>
            <div className="flex items-baseline justify-center gap-0.5 my-0.5">
              <span className="text-4xl text-[#7e001d] font-extrabold tracking-tight leading-none">
                {cycleStats.currentDay}
              </span>
              <span className="text-xs text-[#5a4040] font-semibold">
                º dia
              </span>
            </div>
            <span className="text-xs text-[#5a4040] font-medium">
              Ciclo de {cycleStats.cycleLength} dias
            </span>
            <div className="mt-2.5 px-3 py-1 rounded-full bg-[#ffe8ec] text-[#7e001d] text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe6a7b]"></span>
              {cycleStats.daysUntilNext === 0
                ? 'Início do fluxo hoje'
                : `Menstruação em ${cycleStats.daysUntilNext} dias`}
            </div>
          </div>
        </div>

        {/* Fertility & Hormone Probability Pill */}
        <div className="w-full mt-2 grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#fff0f2] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-[#5a4040]">Chance de Engravidar</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#a60f2d]"></span>
              <span className="text-xs text-[#7e001d] font-bold">
                {cycleStats.pregnancyChance}
              </span>
            </div>
          </div>

          <div className="bg-[#fff0f2] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-[#5a4040]">Próximo Início Previsto</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#fe6a7b]"></span>
              <span className="text-xs text-[#7e001d] font-bold">
                {cycleStats.nextPeriodFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA: Registrar Sintomas */}
      <div className="w-full">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-14 bg-[#7e001d] hover:bg-[#920023] text-white rounded-full shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span className="text-sm font-bold tracking-wide">
            Registrar Sintomas & Humor
          </span>
        </button>
      </div>

      {/* Interactive Daily Check-in */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-[#2e131b]">Como você se sente hoje?</h2>
          <span className="text-xs text-[#ad2e42] font-medium">Toque para marcar</span>
        </div>

        {/* Category 1: Humor */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-[#5a4040] uppercase tracking-wider font-semibold pl-1">
            Humor
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MOODS.map(m => {
              const isSelected = todayLog.mood === m.label;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setMood(todayStr, isSelected ? '' : m.label)}
                  className={`flex-shrink-0 min-h-[44px] px-3.5 py-2 rounded-2xl text-xs flex items-center gap-2 active:scale-95 transition-all select-none ${
                    isSelected
                      ? 'bg-[#ffe8ec] text-[#7e001d] font-bold border-2 border-[#7e001d] shadow-2xs'
                      : 'bg-white text-[#5a4040] font-medium border-2 border-transparent hover:bg-[#fff0f2] shadow-2xs'
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category 2: Sintomas Físicos */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-[#5a4040] uppercase tracking-wider font-semibold pl-1">
            Sintomas Físicos
          </span>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SYMPTOMS.map(s => {
              const isSelected = todayLog.symptoms?.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(todayStr, s.id)}
                  className={`min-h-[44px] p-2.5 rounded-2xl flex items-center justify-between shadow-2xs active:scale-98 transition-all text-xs ${
                    isSelected
                      ? 'bg-[#ffe8ec] text-[#7e001d] font-bold border border-[#7e001d]/30'
                      : 'bg-white text-[#2e131b] font-medium hover:bg-[#fff0f2] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#ad2e42]">●</span>
                    <span>{s.label}</span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-[#7e001d] text-white' : 'bg-[#fff0f2]'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category 3: Fluxo */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-[#5a4040] uppercase tracking-wider font-semibold pl-1">
            Fluxo Menstrual
          </span>
          <div className="flex items-center gap-2">
            {FLOWS.map(f => {
              const val = f.toLowerCase();
              const isSelected = todayLog.flow?.toLowerCase() === val;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlow(todayStr, val)}
                  className={`flex-1 min-h-[42px] py-2 rounded-2xl text-xs text-center active:scale-95 transition-all shadow-2xs ${
                    isSelected
                      ? 'bg-[#7e001d] text-white font-bold'
                      : 'bg-white text-[#5a4040] font-semibold hover:bg-[#fff0f2]'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Registro Completo */}
      <LogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetDate={selectedDate || todayStr}
      />
    </div>
  );
}
