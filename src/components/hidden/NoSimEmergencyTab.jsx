import React, { useState } from 'react';
import { NO_SIM_EMERGENCY_GUIDE } from '../../data/offlineGuides';
import { useApp } from '../../context/AppContext';
import { 
  Phone, 
  Wifi, 
  ShieldCheck, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  MessageCircle, 
  Key, 
  FileText, 
  Flame, 
  Radio
} from 'lucide-react';

export default function NoSimEmergencyTab() {
  const { setHiddenTab, showToast } = useApp();
  
  // Interactive checklist state
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-4">
      {/* Top Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold text-red-900 uppercase tracking-wide">
            Protocolo de Risco Imediato
          </h2>
          <p className="text-xs text-red-800 leading-relaxed">
            Se você estiver sob ameaça direta agora, disque 190 ou 180 imediatamente. Essas ligações funcionam mesmo se o aparelho não tiver chip ou internet móvel.
          </p>
        </div>
      </div>

      {/* Direct Numbers Grid */}
      <div className="grid grid-cols-2 gap-2">
        {NO_SIM_EMERGENCY_GUIDE.directNumbers.map(item => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="p-3.5 bg-white border border-[#ffe8ec] rounded-2xl shadow-xs flex flex-col justify-between gap-2 active:scale-98 transition-transform hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg ${item.color}`}>
                {item.number}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#2e131b]">{item.label}</h3>
              <p className="text-[11px] text-[#5a4040] mt-0.5 leading-snug">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Guide: How Calling without SIM Card Works */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#7e001d]" />
          <h2 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            {NO_SIM_EMERGENCY_GUIDE.howNoSimWorks.title}
          </h2>
        </div>
        <p className="text-xs text-[#5a4040] leading-relaxed">
          {NO_SIM_EMERGENCY_GUIDE.howNoSimWorks.summary}
        </p>

        <div className="space-y-2 pt-1">
          {NO_SIM_EMERGENCY_GUIDE.howNoSimWorks.steps.map((st, i) => (
            <div key={i} className="bg-[#fff0f2] rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-xs font-bold text-[#7e001d]">
                {i + 1}. {st.title}
              </span>
              <p className="text-xs text-[#5a4040] leading-relaxed">
                {st.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Wi-Fi & Silent Communications */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-[#ad2e42]" />
          <h2 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            {NO_SIM_EMERGENCY_GUIDE.wifiAndSilentOptions.title}
          </h2>
        </div>
        <p className="text-xs text-[#5a4040] leading-relaxed">
          {NO_SIM_EMERGENCY_GUIDE.wifiAndSilentOptions.summary}
        </p>

        <div className="space-y-2 pt-1">
          {NO_SIM_EMERGENCY_GUIDE.wifiAndSilentOptions.tips.map((tip, i) => (
            <div key={i} className="border border-[#ffe8ec] rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-xs font-bold text-[#2e131b]">
                • {tip.title}
              </span>
              <p className="text-xs text-[#5a4040] leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setHiddenTab('chat')}
          className="w-full py-2.5 rounded-full bg-[#ffe8ec] text-[#7e001d] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform mt-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Iniciar Chat Silencioso com IA</span>
        </button>
      </div>

      {/* Safety Escape Plan Interactive Checklist */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#7e001d]" />
          <h2 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            {NO_SIM_EMERGENCY_GUIDE.escapePlan.title}
          </h2>
        </div>
        <p className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
          ⚠️ {NO_SIM_EMERGENCY_GUIDE.escapePlan.warning}
        </p>

        <div className="space-y-2 pt-1">
          {NO_SIM_EMERGENCY_GUIDE.escapePlan.items.map((it, idx) => {
            const isChecked = Boolean(checkedItems[idx]);
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-[#fff0f2]/60 border-[#ffe8ec] text-[#2e131b]'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-[#7e001d]">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8e7070]" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold ${isChecked ? 'line-through text-emerald-800' : ''}`}>
                    {it.category}
                  </span>
                  <p className="text-xs text-[#5a4040] mt-0.5 leading-relaxed">
                    {it.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
