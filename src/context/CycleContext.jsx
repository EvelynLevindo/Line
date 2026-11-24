import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../services/storage';
import { dataService } from '../services/firebase';
import { notificationService } from '../services/notifications';

const CycleContext = createContext(null);

export function CycleProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const uid = currentUser?.uid || 'guest';

  const [logs, setLogs] = useState({});
  const [reminders, setReminders] = useState([]);

  // Selected date on calendar (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Load user's data when currentUser changes
  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      dataService.getUserCycleLogs(currentUser.uid).then(remoteLogs => {
        if (isMounted) {
          setLogs(remoteLogs || storage.getCycleLogs(currentUser.uid));
        }
      });
      dataService.getUserReminders(currentUser.uid).then(remoteReminders => {
        if (isMounted) {
          setReminders(remoteReminders || storage.getReminders(currentUser.uid));
        }
      });
    } else {
      setLogs({});
      setReminders([]);
    }
    return () => { isMounted = false; };
  }, [currentUser]);

  // Persist logs whenever changed
  useEffect(() => {
    if (currentUser) {
      storage.saveCycleLogs(logs, currentUser.uid);
      dataService.saveUserCycleLogs(currentUser.uid, logs);
    }
  }, [logs, currentUser]);

  // Persist reminders whenever changed
  useEffect(() => {
    if (currentUser) {
      storage.saveReminders(reminders, currentUser.uid);
      dataService.saveUserReminders(currentUser.uid, reminders);
    }
  }, [reminders, currentUser]);

  // Notification checker interval: checks scheduled reminders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      notificationService.checkAndNotify(reminders);
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Cycle Settings from user profile
  const cycleLength = userProfile?.cycleLength || 28;
  const periodDuration = userProfile?.periodDuration || 5;

  // Calculate most recent period start date from logs or profile
  const effectiveLastPeriodDate = useMemo(() => {
    // 1. Look for logged dates with menstrual flow
    const periodDates = Object.entries(logs)
      .filter(([_, log]) => log.flow && log.flow !== 'none')
      .map(([dateStr]) => dateStr)
      .sort();

    if (periodDates.length > 0) {
      // Find the start of the latest continuous period block
      const latest = periodDates[periodDates.length - 1];
      return latest;
    }

    // 2. Fallback to onboarding last period date
    if (userProfile?.lastPeriodDate) {
      return userProfile.lastPeriodDate;
    }

    // Default: 14 days ago if not yet onboarded
    const fallback = new Date(Date.now() - 14 * 86400000);
    return fallback.toISOString().split('T')[0];
  }, [logs, userProfile?.lastPeriodDate]);

  // Synchronized Cycle Statistics (Estilo Clue - shared by Dial & Calendar)
  const cycleStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastPeriodObj = new Date(effectiveLastPeriodDate + 'T00:00:00');
    if (isNaN(lastPeriodObj.getTime())) {
      lastPeriodObj = new Date(today.getTime() - 14 * 86400000);
    }

    const diffMs = today.getTime() - lastPeriodObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Day of current cycle (1-indexed)
    const currentDay = diffDays >= 0 ? (diffDays % cycleLength) + 1 : 1;
    const daysUntilNext = Math.max(0, cycleLength - currentDay);

    // Ovulation is approximately 14 days before next period
    const ovulationDay = Math.max(periodDuration + 2, cycleLength - 14);
    const fertileStart = Math.max(periodDuration + 1, ovulationDay - 4);
    const fertileEnd = Math.min(cycleLength, ovulationDay + 1);

    // Today's log
    const todayStr = today.toISOString().split('T')[0];
    const todayLog = logs[todayStr];
    const hasTodayFlow = todayLog && todayLog.flow && todayLog.flow !== 'none';

    // Determine current phase
    let phase = 'Fase Folicular';
    let pregnancyChance = 'Baixa';

    if (hasTodayFlow || currentDay <= periodDuration) {
      phase = 'Menstruação';
      pregnancyChance = 'Mínima';
    } else if (currentDay === ovulationDay) {
      phase = 'Ovulação';
      pregnancyChance = 'Máxima (Pico Fértil)';
    } else if (currentDay >= fertileStart && currentDay <= fertileEnd) {
      phase = 'Período Fértil';
      pregnancyChance = 'Alta';
    } else if (currentDay > fertileEnd) {
      phase = 'Fase Lútea';
      pregnancyChance = 'Baixa';
    }

    // Next period prediction date
    const nextPeriodObj = new Date(today.getTime() + daysUntilNext * 86400000);
    const nextPeriodFormatted = nextPeriodObj.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });

    return {
      currentDay,
      cycleLength,
      periodDuration,
      phase,
      pregnancyChance,
      daysUntilNext,
      nextPeriodFormatted,
      ovulationDay,
      fertileStart,
      fertileEnd,
      lastPeriodDate: effectiveLastPeriodDate,
      hasTodayFlow
    };
  }, [effectiveLastPeriodDate, cycleLength, periodDuration, logs]);

  // Log update for a specific date
  const updateLog = useCallback((dateStr, updates) => {
    setLogs(prev => {
      const existing = prev[dateStr] || {
        date: dateStr,
        flow: 'none',
        mood: 'Calma',
        symptoms: [],
        notes: ''
      };
      return {
        ...prev,
        [dateStr]: {
          ...existing,
          ...updates
        }
      };
    });
  }, []);

  // Quick toggle symptom
  const toggleSymptom = useCallback((dateStr, symptom) => {
    setLogs(prev => {
      const existing = prev[dateStr] || {
        date: dateStr,
        flow: 'none',
        mood: 'Calma',
        symptoms: [],
        notes: ''
      };
      const current = existing.symptoms || [];
      const hasIt = current.includes(symptom);
      const nextSymptoms = hasIt ? current.filter(s => s !== symptom) : [...current, symptom];

      return {
        ...prev,
        [dateStr]: {
          ...existing,
          symptoms: nextSymptoms
        }
      };
    });
  }, []);

  // Quick set mood
  const setMood = useCallback((dateStr, mood) => {
    updateLog(dateStr, { mood });
  }, [updateLog]);

  // Quick set flow
  const setFlow = useCallback((dateStr, flow) => {
    updateLog(dateStr, { flow });
  }, [updateLog]);

  // Reminders Management
  const toggleReminder = useCallback((id) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const addReminder = useCallback((newReminder) => {
    setReminders(prev => [
      ...prev,
      {
        ...newReminder,
        id: `rem_${Date.now()}`,
        enabled: true
      }
    ]);
  }, []);

  const deleteReminder = useCallback((id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <CycleContext.Provider
      value={{
        logs,
        reminders,
        selectedDate,
        setSelectedDate,
        cycleStats,
        updateLog,
        toggleSymptom,
        setMood,
        setFlow,
        toggleReminder,
        addReminder,
        deleteReminder
      }}
    >
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle deve ser utilizado dentro de um CycleProvider');
  }
  return context;
}
