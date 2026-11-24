// Serviço de Notificações Reais do Navegador (Web Notification API)

export const notificationService = {
  // Verifica se o navegador suporta notificações
  isSupported: () => {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Retorna o status atual da permissão
  getPermission: () => {
    if (!notificationService.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Solicita permissão da usuária
  requestPermission: async () => {
    if (!notificationService.isSupported()) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação:', err);
      return 'denied';
    }
  },

  // Dispara uma notificação imediata
  sendNotification: (title, options = {}) => {
    if (!notificationService.isSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
        ...options
      };
      return new Notification(title, defaultOptions);
    } catch (err) {
      console.warn('Erro ao disparar notificação:', err);
      return null;
    }
  },

  // Verifica lembretes agendados e dispara se o horário coincidir
  checkAndNotify: (reminders = []) => {
    if (!notificationService.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().split('T')[0];

    reminders.forEach(rem => {
      if (!rem.enabled) return;

      // Se o lembrete tiver horário exato (ex: '08:00', '15:30')
      const remTime = rem.time;
      if (remTime && remTime.includes(currentTimeStr)) {
        const firedKey = `line_notif_fired_${rem.id}_${todayDateStr}_${currentTimeStr}`;
        if (!sessionStorage.getItem(firedKey)) {
          notificationService.sendNotification(`Line 🌸: ${rem.title}`, {
            body: `Lembrete agendado para às ${rem.time}. Hora de cuidar do seu bem-estar!`
          });
          sessionStorage.setItem(firedKey, 'true');
        }
      }
    });
  }
};
