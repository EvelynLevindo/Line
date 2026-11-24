import React, { useState } from 'react';
import { SAFETY_MANUAL } from '../../data/safetyManual';
import { 
  BookOpen, 
  ShieldAlert, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  FileCheck, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';

export default function SecurityYearbookTab() {
  const [expandedType, setExpandedType] = useState('fisica');

  const toggleType = (id) => {
    setExpandedType(expandedType === id ? null : id);
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#ffe8ec] text-[#7e001d] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ad2e42]">
            Base de Conhecimento Offline
          </span>
          <h2 className="text-sm font-bold text-[#2e131b]">
            Anuário de Segurança & Lei Maria da Penha
          </h2>
          <p className="text-xs text-[#5a4040] mt-1 leading-relaxed">
            Consolidado oficial com dados do Fórum Brasileiro de Segurança Pública, CNJ e Lei 11.340/2006. Salvo no dispositivo para consulta sem internet.
          </p>
        </div>
      </div>

      {/* 1. Estatísticas Oficiais */}
      <div className="grid grid-cols-2 gap-2">
        {SAFETY_MANUAL.stats.map((st, i) => (
          <div
            key={i}
            className="p-3 bg-white border border-[#ffe8ec] rounded-2xl shadow-xs flex flex-col justify-between gap-1"
          >
            <span className="text-base font-extrabold text-[#7e001d]">
              {st.metric}
            </span>
            <p className="text-[11px] text-[#5a4040] leading-snug">
              {st.label}
            </p>
            <span className="text-[9px] text-[#8e7070] font-semibold mt-1">
              Fonte: {st.source}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Os 5 Tipos de Violência (Acordeão) */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#7e001d]" />
          <h3 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            Os 5 Tipos de Violência Doméstica
          </h3>
        </div>
        <p className="text-xs text-[#5a4040] leading-relaxed">
          A violência contra a mulher não é apenas física. A Lei Maria da Penha reconhece formalmente 5 formas que configuram crime:
        </p>

        <div className="space-y-2 pt-1">
          {SAFETY_MANUAL.violenceTypes.map(vt => {
            const isOpen = expandedType === vt.id;
            return (
              <div
                key={vt.id}
                className="border border-[#ffe8ec] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleType(vt.id)}
                  className="w-full p-3 bg-[#fff0f2] flex items-center justify-between text-left select-none"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#2e131b]">
                      {vt.title}
                    </span>
                    <span className="text-[10px] text-[#ad2e42] font-semibold">
                      {vt.badge}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#7e001d]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#7e001d]" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-3 bg-white flex flex-col gap-2 animate-in fade-in duration-150">
                    <p className="text-xs text-[#2e131b] font-medium leading-relaxed">
                      {vt.description}
                    </p>
                    <div className="bg-[#fff8f7] rounded-xl p-2.5 flex flex-col gap-1.5 border border-[#ffe8ec]">
                      <span className="text-[10px] font-bold text-[#ad2e42] uppercase tracking-wider">
                        Exemplos Comuns na Prática:
                      </span>
                      {vt.examples.map((ex, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-[#5a4040]">
                          <span className="text-[#7e001d] font-bold">•</span>
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Medidas Protetivas e Direitos Legais */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#7e001d]" />
          <h3 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            Medidas Protetivas de Urgência (MPU)
          </h3>
        </div>

        <div className="space-y-3">
          {SAFETY_MANUAL.rightsAndProtections.map((rp, i) => (
            <div key={i} className="bg-[#fff0f2] rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2e131b]">{rp.title}</span>
                <span className="text-[10px] font-bold bg-[#ffe8ec] text-[#7e001d] px-2 py-0.5 rounded-full">
                  {rp.highlight}
                </span>
              </div>
              <div className="space-y-1.5">
                {rp.items.map((it, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-[#5a4040]">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Passo a Passo da Denúncia */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#7e001d]" />
          <h3 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            Passo a Passo para Denúncia Segura
          </h3>
        </div>

        <div className="space-y-2.5">
          {SAFETY_MANUAL.reportingStepByStep.map(st => (
            <div key={st.step} className="p-3 border border-[#ffe8ec] rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7e001d] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {st.step}
                </span>
                <span className="text-xs font-bold text-[#2e131b]">{st.title}</span>
              </div>
              <p className="text-xs text-[#5a4040] pl-8 leading-relaxed">
                {st.action}
              </p>
              <div className="ml-8 mt-1 bg-[#fff0f2] p-2 rounded-xl text-[11px] text-[#7e001d] font-medium">
                💡 Dica de proteção: {st.tip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
