import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notifications';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Droplets, 
  Bell, 
  LogOut, 
  Save, 
  Sparkles, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function ProfileTab() {
  const { currentUser, userProfile, updateProfileData, logout } = useAuth();
  const { cycleStats } = useCycle();
  const { showToast } = useApp();

  const [name, setName] = useState(userProfile?.name || '');
  const [cycleLength, setCycleLength] = useState(userProfile?.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState(userProfile?.periodDuration || 5);
  const [lastPeriodDate, setLastPeriodDate] = useState(userProfile?.lastPeriodDate || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileData({
        name: name.trim() || userProfile?.name,
        cycleLength: Number(cycleLength),
        periodDuration: Number(periodDuration),
        lastPeriodDate: lastPeriodDate || userProfile?.lastPeriodDate
      });
      showToast('Configurações do ciclo atualizadas!');
    } catch {
      showToast('Erro ao atualizar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRerunOnboarding = async () => {
    await updateProfileData({ onboardingCompleted: false });
    showToast('Etapa inicial reaberta.');
  };

  const handleTestNotification = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      notificationService.sendNotification('Line 🌸: Teste de Notificação', {
        body: 'Suas notificações estão configuradas e funcionando perfeitamente!'
      });
      showToast('Notificação de teste enviada!');
    } else {
      showToast('Permissão de notificação negada no navegador.');
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Account Header Card */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7e001d] to-[#fe6a7b] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
          {(userProfile?.name || 'S').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-bold text-[#2e131b] truncate">
            {userProfile?.name || 'Sofia'}
          </h2>
          <span className="text-xs text-[#5a4040] flex items-center gap-1 mt-0.5 truncate">
            <Mail className="w-3.5 h-3.5 text-[#8e7070] shrink-0" />
            <span>{currentUser?.email || 'conta.local@line.app'}</span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 self-start">
            ● Conta Individual Ativa
          </span>
        </div>
      </div>

      {/* Cycle Configuration Form */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#ffe8ec] pb-2.5">
          <Calendar className="w-4 h-4 text-[#7e001d]" />
          <h3 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            Ajustes do Ciclo Menstrual
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como quer ser chamada"
              className="w-full bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3.5 py-2.5 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
                Duração do Ciclo
              </label>
              <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#2e131b] focus:outline-none"
                />
                <span className="text-xs text-[#5a4040] font-medium">dias</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
                Duração do Fluxo
              </label>
              <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#2e131b] focus:outline-none"
                />
                <span className="text-xs text-[#5a4040] font-medium">dias</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
              Data da Última Menstruação
            </label>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3.5 py-2.5 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-full bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all mt-1 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </form>
      </div>

      {/* Notifications & Tools Card */}
      <div className="bg-white border border-[#ffe8ec] rounded-3xl p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-[#ffe8ec] pb-2">
          <Bell className="w-4 h-4 text-[#7e001d]" />
          <h3 className="text-xs font-bold text-[#2e131b] uppercase tracking-wider">
            Notificações & Preferências
          </h3>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2e131b]">Notificações do Navegador</span>
            <span className="text-[11px] text-[#5a4040]">Status: {notificationService.getPermission()}</span>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 rounded-full bg-[#fff0f2] hover:bg-[#ffe8ec] text-[#7e001d] text-xs font-bold active:scale-95 transition-all"
          >
            Testar Alerta
          </button>
        </div>

        <button
          onClick={handleRerunOnboarding}
          className="w-full py-2.5 rounded-2xl bg-[#fff0f2] hover:bg-[#ffe8ec] text-[#5a4040] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#7e001d]" />
          <span>Refazer Etapa Inicial (Onboarding)</span>
        </button>
      </div>

      {/* Logout Action */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Sair da Minha Conta</span>
      </button>
    </div>
  );
}
