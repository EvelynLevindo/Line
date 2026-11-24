import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import LogModal from './LogModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit3, SunMedium } from 'lucide-react';

export default function CalendarTab() {
  const { logs, cycleStats, selectedDate, setSelectedDate } = useCycle();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Month title
  const monthName = currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Selected date log
  const selectedLog = logs[selectedDate] || {
    flow: 'none',
    mood: '',
    symptoms: [],
    notes: ''
  };

  // Format selected date
  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const selectedDateFormatted = selectedDateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Calculate day cycle phase synchronized with cycleStats
  const getDayInfo = (cellDateStr) => {
    const cellDate = new Date(cellDateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = cellDate.getTime() === today.getTime();
    const cellLog = logs[cellDateStr];
    const hasRegisteredFlow = cellLog && cellLog.flow && cellLog.flow !== 'none';

    // Last period calculation
    const lastPeriodObj = new Date(cycleStats.lastPeriodDate + 'T00:00:00');
    const diffMs = cellDate.getTime() - lastPeriodObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const cycleDay = ((diffDays % cycleStats.cycleLength) + cycleStats.cycleLength) % cycleStats.cycleLength + 1;

    // Phase classification
    if (hasRegisteredFlow) {
      return {
        type: 'registered_period',
        label: 'Menstruação Registrada',
        bg: 'bg-[#7e001d] text-white shadow-2xs font-bold',
        cycleDay
      };
    }

    if (cellDate >= today && cycleDay <= cycleStats.periodDuration) {
      return {
        type: 'predicted_period',
        label: 'Previsão de Menstruação',
        bg: 'bg-[#ffe1e6] text-[#7e001d] font-semibold border border-dashed border-[#7e001d]/50',
        cycleDay
      };
    }

    if (cycleDay === cycleStats.ovulationDay) {
      return {
        type: 'ovulation',
        label: 'Ovulação',
        bg: 'bg-[#ffdadb] text-[#ad2e42] font-bold ring-2 ring-[#ad2e42]/30',
        cycleDay
      };
    }

    if (cycleDay >= cycleStats.fertileStart && cycleDay <= cycleStats.fertileEnd) {
      return {
        type: 'fertile',
        label: 'Janela Fértil',
        bg: 'bg-[#ffd9e0] text-[#ad2e42] font-semibold',
        cycleDay
      };
    }

    return {
      type: 'regular',
      label: 'Fase Regular',
      bg: 'text-[#2e131b] hover:bg-[#ffe8ec]',
      cycleDay
    };
  };

  // Selected date cycle day calculation
  const selectedDayInfo = getDayInfo(selectedDate);

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Header Card: Selector de Mês & Resumo do Ciclo */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#5a4040] hover:text-[#7e001d] active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-[#2e131b] tracking-tight">
              {capitalizedMonth}
            </span>
            <span className="text-xs text-[#ad2e42] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ad2e42]"></span>
              Ciclo médio: {cycleStats.cycleLength} dias
            </span>
          </div>

          <button
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#5a4040] hover:text-[#7e001d] active:scale-95 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pílula informativa de status sincronizado */}
        <div className="bg-[#fff0f2] rounded-2xl px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-[#7e001d]" />
            <span className="text-xs text-[#5a4040]">Hoje:</span>
            <span className="text-xs font-bold text-[#7e001d]">{cycleStats.phase}</span>
          </div>
          <span className="text-xs text-[#5a4040]">
            Próx. fluxo em {cycleStats.daysUntilNext} dias
          </span>
        </div>
      </div>

      {/* Grade do Calendário Mensal */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col gap-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, i) => (
            <span key={i} className="text-xs font-bold text-[#5a4040] py-1">
              {wd}
            </span>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-y-1.5 place-items-center">
          {/* Previous month leading days */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayWeekday + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="w-10 h-10 flex items-center justify-center text-[#e2bebe] text-xs select-none"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const currentDayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === currentDayDateStr;
            const info = getDayInfo(currentDayDateStr);
            const dayLog = logs[currentDayDateStr];
            const hasSymptom = dayLog && ((dayLog.symptoms && dayLog.symptoms.length > 0) || dayLog.notes || dayLog.mood);

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => setSelectedDate(currentDayDateStr)}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs transition-all active:scale-90 relative ${
                  isSelected
                    ? 'ring-2 ring-[#7e001d] ring-offset-2 ring-offset-white font-extrabold z-10'
                    : ''
                } ${info.bg}`}
              >
                <span>{dayNum}</span>

                {/* Ovulation flower indicator */}
                {info.type === 'ovulation' && (
                  <span className="text-[9px] leading-none -mt-0.5">🌸</span>
                )}

                {/* Logged symptoms/notes dot */}
                {hasSymptom && info.type !== 'ovulation' && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    info.type === 'registered_period' ? 'bg-white' : 'bg-[#ad2e42]'
                  }`}></span>
                )}
              </button>
            );
          })}

          {/* Next month trailing days */}
          {Array.from({ length: (7 - ((firstDayWeekday + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div
              key={`next-${i}`}
              className="w-10 h-10 flex items-center justify-center text-[#e2bebe] text-xs select-none"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Legenda de Acessibilidade */}
        <div className="pt-2 mt-2 bg-[#fff0f2]/60 rounded-2xl p-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#5a4040] uppercase tracking-wider">
            Legenda do Ciclo
          </span>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7e001d] shrink-0"></span>
              <span className="text-[#2e131b]">Fluxo Registrado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ffdadb] border border-[#ad2e42] shrink-0"></span>
              <span className="text-[#2e131b]">Período Fértil / Ovulação</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ffe1e6] border border-dashed border-[#7e001d] shrink-0"></span>
              <span className="text-[#2e131b]">Previsão Futura</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ad2e42] shrink-0 mx-0.5"></span>
              <span className="text-[#2e131b]">Sintomas Registrados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Detalhes do Dia Selecionado */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#ad2e42] font-bold uppercase tracking-wider bg-[#ffdadb] px-2.5 py-0.5 rounded-full">
                Dia {selectedDayInfo.cycleDay} do Ciclo
              </span>
              <span className="text-xs text-[#5a4040]">• {selectedDayInfo.label}</span>
            </div>
            <h2 className="text-base font-bold text-[#2e131b] mt-1 capitalize">
              {selectedDateFormatted}
            </h2>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#ffe8ec] flex items-center justify-center text-[#7e001d] shrink-0">
            <SunMedium className="w-5 h-5" />
          </div>
        </div>

        {/* Tags de Registro / Sintomas do Dia */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between bg-[#fff0f2] rounded-xl px-3 py-2 text-xs">
            <span className="text-[#5a4040]">Fluxo Menstrual:</span>
            <span className="font-bold text-[#2e131b] capitalize">
              {selectedLog.flow && selectedLog.flow !== 'none'
                ? selectedLog.flow
                : 'Nenhum sangramento'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#fff0f2] rounded-xl px-3 py-2 text-xs">
            <span className="text-[#5a4040]">Humor:</span>
            <span className="font-bold text-[#2e131b]">
              {selectedLog.mood || 'Não registrado'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#fff0f2] rounded-xl px-3 py-2 text-xs">
            <span className="text-[#5a4040]">Sintomas Físicos:</span>
            <span className="font-bold text-[#2e131b]">
              {selectedLog.symptoms && selectedLog.symptoms.length > 0
                ? selectedLog.symptoms.join(', ')
                : 'Nenhum sintoma'}
            </span>
          </div>

          {selectedLog.notes && (
            <div className="flex flex-col bg-[#fff0f2] rounded-xl p-3 text-xs">
              <span className="text-[#5a4040] font-semibold mb-0.5">Anotações:</span>
              <span className="text-[#2e131b]">{selectedLog.notes}</span>
            </div>
          )}
        </div>

        {/* Ação de Edição */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="w-full h-12 bg-[#7e001d] hover:bg-[#920023] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>Editar Registro deste Dia</span>
        </button>
      </div>

      {/* Modal de Edição */}
      <LogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        targetDate={selectedDate}
      />
    </div>
  );
}
