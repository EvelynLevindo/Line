import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Dual-layer state: NEVER alters browser URL
  const [activeLayer, setActiveLayer] = useState('public'); // 'public' | 'hidden'
  const [publicTab, setPublicTab] = useState('dashboard');  // 'dashboard' | 'calendar' | 'reminders'
  const [hiddenTab, setHiddenTab] = useState('chat');       // 'chat' | 'map' | 'forum' | 'nosim' | 'manual'
  
  // Discreet feedback notification (e.g. "Ambiente seguro & sincronizado")
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, durationMs = 2500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, durationMs);
  }, []);

  // Activate the hidden layer (Portal de Apoio a Vítimas)
  const triggerHiddenLayer = useCallback(() => {
    setActiveLayer('hidden');
    setHiddenTab('chat');
    showToast('Modo de Acolhimento Seguro ativado');
  }, [showToast]);

  // Quick Escape (Saída Rápida de Emergência)
  const quickEscape = useCallback((redirectToGoogle = false) => {
    storage.clearHiddenSession();
    setActiveLayer('public');
    setPublicTab('dashboard');
    
    if (redirectToGoogle) {
      // Clear DOM and redirect immediately
      document.body.innerHTML = '';
      window.location.replace('https://www.google.com');
    }
  }, []);

  // Omnipresent Keyboard Listener: Pressing ESC anytime while in hidden layer executes Quick Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeLayer === 'hidden') {
        quickEscape(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayer, quickEscape]);

  return (
    <AppContext.Provider
      value={{
        activeLayer,
        setActiveLayer,
        publicTab,
        setPublicTab,
        hiddenTab,
        setHiddenTab,
        triggerHiddenLayer,
        quickEscape,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
