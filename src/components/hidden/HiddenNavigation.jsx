import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, MapPin, Users, PhoneCall, BookOpen } from 'lucide-react';

const TABS = [
  { id: 'chat', label: 'Chat IA & Apoio', icon: MessageSquare },
  { id: 'map', label: 'Mapa de Acolhimento', icon: MapPin },
  { id: 'forum', label: 'Fórum Anônimo', icon: Users },
  { id: 'nosim', label: 'SOS Sem Chip', icon: PhoneCall },
  { id: 'manual', label: 'Anuário & Direitos', icon: BookOpen },
];

export default function HiddenNavigation() {
  const { hiddenTab, setHiddenTab } = useApp();

  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = hiddenTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setHiddenTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
              active
                ? 'bg-[#7e001d] text-white shadow-xs'
                : 'bg-white text-[#5a4040] border border-[#ffe8ec] hover:bg-[#fff0f2]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
