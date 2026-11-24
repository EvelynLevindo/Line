import React, { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { X, Check, Droplets, Sparkles, Activity, FileText } from 'lucide-react';

const MOODS = [
  { label: 'Calma', emoji: '🌸' },
  { label: 'Animada', emoji: '✨' },
  { label: 'Sensível', emoji: '🥺' },
  { label: 'Ansiosa', emoji: '💭' },
  { label: 'Irritada', emoji: '⚡' },
  { label: 'Cansada', emoji: '😴' },
];

const SYMPTOMS_LIST = [
  'Cólica leve', 'Cólica forte', 'Dor de cabeça', 'Inchaço', 
  'Disposição', 'Sensibilidade nos seios', 'Acne', 'Dor lombar',
  'Náusea', 'Insônia'
];

const FLOWS = [
  { id: 'none', label: 'Nenhum' },
  { id: 'light', label: 'Leve' },
  { id: 'medium', label: 'Médio' },
  { id: 'heavy', label: 'Intenso' },
];

export default function LogModal({ isOpen, onClose, targetDate }) {
  const { logs, updateLog } = useCycle();
  
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  const currentLog = logs[dateStr] || {
    flow: 'none',
    mood: 'Calma',
    symptoms: [],
    notes: ''
  };

  const [flow, setFlow] = useState(currentLog.flow || 'none');
  const [mood, setMood] = useState(currentLog.mood || 'Calma');
  const [symptoms, setSymptoms] = useState(currentLog.symptoms || []);
  const [notes, setNotes] = useState(currentLog.notes || '');

  if (!isOpen) return null;

  const toggleSymptom = (sym) => {
    setSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    updateLog(dateStr, {
      flow,
      mood,
      symptoms,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ffe8ec] pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#2e131b]">Registrar Sintomas & Humor</h3>
            <p className="text-xs text-[#5a4040]">
              {new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#fff0f2] flex items-center justify-center text-[#5a4040] hover:text-[#7e001d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Menstrual Flow */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#5a4040] uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-[#7e001d]" />
            Fluxo Menstrual
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FLOWS.map(f => {
              const active = flow === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlow(f.id)}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    active
                      ? 'bg-[#7e001d] text-white shadow-xs font-bold'
                      : 'bg-[#fff0f2] text-[#5a4040] hover:bg-[#ffe8ec]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mood */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#5a4040] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Como você se sente hoje?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => {
              const active = mood === m.label;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setMood(m.label)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    active
                      ? 'bg-[#ffe8ec] text-[#7e001d] border-2 border-[#7e001d] font-bold'
                      : 'bg-[#fff0f2] text-[#5a4040] border-2 border-transparent hover:bg-[#ffe8ec]'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Physical Symptoms */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#5a4040] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#ad2e42]" />
            Sintomas Físicos
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS_LIST.map(sym => {
              const selected = symptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                    selected
                      ? 'bg-[#7e001d] text-white font-semibold'
                      : 'bg-[#fff0f2] text-[#5a4040] hover:bg-[#ffe8ec]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#5a4040] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#5a4040]" />
            Anotações Pessoais (Privadas)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Registre como foi seu dia, remédios tomados ou sensações..."
            rows={3}
            className="w-full bg-[#fff0f2] border border-[#e2bebe]/60 rounded-2xl p-3 text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-[#fff0f2] text-[#5a4040] font-semibold text-xs active:scale-95 transition-transform"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 w-full py-3 rounded-full bg-[#7e001d] text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
          >
            Salvar Registro
          </button>
        </div>
      </div>
    </div>
  );
}
