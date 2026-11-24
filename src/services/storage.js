// Gerenciador de armazenamento local estritamente offline-first e seguro
// Inicia 100% limpo (zero dados fictícios) conforme solicitado

export const storage = {
  // Cycle logs (starts empty)
  getCycleLogs: (uid = 'anonymous') => {
    try {
      const data = localStorage.getItem(`line_cycle_logs_${uid}`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveCycleLogs: (logs, uid = 'anonymous') => {
    try {
      localStorage.setItem(`line_cycle_logs_${uid}`, JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  // Reminders (starts empty: 0 sample reminders)
  getReminders: (uid = 'anonymous') => {
    try {
      const data = localStorage.getItem(`line_reminders_${uid}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReminders: (reminders, uid = 'anonymous') => {
    try {
      localStorage.setItem(`line_reminders_${uid}`, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  // Hidden post IDs for local hide
  getHiddenPostIds: () => {
    try {
      const data = localStorage.getItem('line_hidden_post_ids');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHiddenPostIds: (ids) => {
    try {
      localStorage.setItem('line_hidden_post_ids', JSON.stringify(ids));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  // Quick Escape: Purge temporary hidden session data
  clearHiddenSession: () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing hidden session:', e);
    }
  }
};
