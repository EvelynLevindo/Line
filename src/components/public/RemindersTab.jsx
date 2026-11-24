import React, { useState, useRef, useEffect } from 'react';
import { useCycle } from '../../context/CycleContext';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notifications';
import { 
  Bell, 
  Plus, 
  Lock, 
  Info, 
  Trash2, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function RemindersTab() {
  const { reminders, toggleReminder, addReminder, deleteReminder } = useCycle();
  const { triggerHiddenLayer, showToast } = useApp();

  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newFrequency, setNewFrequency] = useState('Diário');
  
  const [notifPermission, setNotifPermission] = useState(() => notificationService.getPermission());

  // Secret trigger logic: 3 fast clicks OR 2s hold
  const [clickCount, setClickCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const clickTimeoutRef = useRef(null);
  const holdIntervalRef = useRef(null);

  // Monitor notification permission
  useEffect(() => {
    setNotifPermission(notificationService.getPermission());
  }, []);

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      showToast('Permissão de notificações concedida com sucesso! 🔔');
      notificationService.sendNotification('Line 🌸: Notificações Ativadas', {
        body: 'Você receberá seus lembretes de bem-estar e saúde no horário agendado.'
      });
    } else if (perm === 'denied') {
      showToast('Notificações bloqueadas no navegador. Ative nas permissões do site.');
    }
  };

  // Handle 3 rapid clicks
  const handleSecretClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (nextCount >= 3) {
      setClickCount(0);
      triggerHiddenLayer();
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
      showToast('Armazenamento local criptografado e seguro.');
    }, 700);
  };

  // Handle 2s hold
  const handleStartHold = () => {
    let progress = 0;
    holdIntervalRef.current = setInterval(() => {
      progress += 10;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        setHoldProgress(0);
        triggerHiddenLayer();
      }
    }, 180); // ~1.8s
  };

  const handleCancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setHoldProgress(0);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Check notification permission if not yet requested
    if (notifPermission === 'default') {
      await handleRequestPermission();
    }

    addReminder({
      title: newTitle.trim(),
      time: newTime,
      frequency: newFrequency,
      createdAt: new Date().toISOString()
    });

    setNewTitle('');
    setIsAddReminderOpen(false);
    showToast('Novo lembrete salvo com sucesso!');
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Notification Permission Card (if not yet granted) */}
      {notifPermission !== 'granted' && (
        <div className="bg-[#fff0f2] border border-[#ffe8ec] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-5 h-5 text-[#7e001d] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#2e131b]">Ativar Notificações</span>
              <span className="text-[11px] text-[#5a4040]">Receba alertas dos seus horários agendados</span>
            </div>
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1.5 rounded-full bg-[#7e001d] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-transform shrink-0"
          >
            Permitir
          </button>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#7e001d]" />
          <h2 className="text-sm font-bold text-[#2e131b]">Meus Lembretes</h2>
        </div>
        <button
          onClick={() => setIsAddReminderOpen(true)}
          className="h-9 px-3 rounded-full bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lembrete</span>
        </button>
      </div>

      {/* Reminders List (Zero mock data: starts clean!) */}
      {reminders.length === 0 ? (
        <div className="bg-white border border-[#ffe8ec] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#fff0f2] flex items-center justify-center text-[#7e001d]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2e131b]">Nenhum lembrete ativo</h3>
            <p className="text-xs text-[#5a4040] mt-1 max-w-[260px] mx-auto leading-relaxed">
              Você ainda não cadastrou nenhum lembrete. Toque em "Novo Lembrete" para programar alertas de hidratação, pílula, exames ou autocuidado.
            </p>
          </div>
          <button
            onClick={() => setIsAddReminderOpen(true)}
            className="px-4 py-2 rounded-full bg-[#ffe8ec] hover:bg-[#ffd9e0] text-[#7e001d] text-xs font-bold active:scale-95 transition-all"
          >
            + Criar Meu Primeiro Lembrete
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reminders.map(rem => (
            <div
              key={rem.id}
              className="flex items-center justify-between p-3.5 bg-white border border-[#ffe8ec] rounded-2xl shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#fff0f2] flex items-center justify-center shrink-0 text-[#7e001d]">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#2e131b] truncate">
                    {rem.title}
                  </span>
                  <span className="text-[11px] text-[#5a4040] mt-0.5">
                    {rem.time} · {rem.frequency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Working Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={rem.enabled}
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                    rem.enabled ? 'bg-[#7e001d]' : 'bg-[#e2bebe]'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                      rem.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteReminder(rem.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#8e7070] hover:text-red-700 active:scale-90 transition-transform"
                  title="Excluir lembrete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISGUISED EMERGENCY ACTIVATION TRIGGER (SECRET LOCK ONLY) */}
      <div className="bg-[#fff0f2] border border-[#ffe8ec] rounded-3xl p-4 shadow-xs relative overflow-hidden select-none mt-4">
        <div className="flex items-start gap-3">
          {/* THE SECRET TOUCHPOINT LOCK ANCHOR */}
          <button
            id="stealthSafetyTrigger"
            onClick={handleSecretClick}
            onMouseDown={handleStartHold}
            onMouseUp={handleCancelHold}
            onMouseLeave={handleCancelHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleCancelHold}
            className="w-12 h-12 rounded-2xl bg-white border border-[#ffe8ec] flex items-center justify-center text-[#7e001d] hover:text-[#a60f2d] shadow-xs active:scale-90 transition-transform relative cursor-pointer shrink-0"
            aria-label="Sincronização de Segurança e Nuvem Privada"
            title="Segure por 2s ou clique 3 vezes seguidas"
          >
            <Lock className="w-5 h-5" />

            {/* Hold progress ring animation */}
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

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-[#2e131b]">
              Privacidade & Sincronização em Nuvem
            </span>
            <p className="text-[11px] text-[#5a4040] mt-0.5 leading-relaxed">
              Seus dados de ciclo e registros pessoais são protegidos com chave de privacidade local.
            </p>

            <div className="flex items-center gap-1.5 mt-2 bg-white/90 border border-[#ffe8ec] px-2.5 py-1.5 rounded-xl self-start">
              <Info className="w-3.5 h-3.5 text-[#8e7070] shrink-0" />
              <p className="text-[10px] text-[#5a4040]">
                Pressione o ícone do cadeado por 2s ou toque 3 vezes para o modo silencioso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Adicionar Lembrete */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[380px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#ffe8ec] pb-2">
              <h3 className="text-sm font-bold text-[#2e131b]">Novo Lembrete</h3>
              <button
                onClick={() => setIsAddReminderOpen(false)}
                className="w-8 h-8 rounded-full bg-[#fff0f2] flex items-center justify-center text-[#5a4040]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5a4040] uppercase">
                  Título do Lembrete
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tomar água, Pílula anticoncepcional..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#5a4040] uppercase">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5a4040] uppercase">
                    Frequência
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                  >
                    <option value="Diário">Diário</option>
                    <option value="Dias alternados">Dias alternados</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-full bg-[#7e001d] text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
              >
                Salvar Lembrete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
