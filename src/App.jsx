import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { CycleProvider } from './context/CycleContext';

// Authentication & Onboarding
import AuthView from './components/auth/AuthView';
import OnboardingModal from './components/auth/OnboardingModal';

// Common Components
import Header from './components/common/Header';
import QuickEscapeBar from './components/common/QuickEscapeBar';

// Public Layer Components
import DashboardTab from './components/public/DashboardTab';
import CalendarTab from './components/public/CalendarTab';
import RemindersTab from './components/public/RemindersTab';
import ProfileTab from './components/public/ProfileTab';
import PublicBottomNav from './components/public/PublicBottomNav';

// Hidden Layer Components
import HiddenNavigation from './components/hidden/HiddenNavigation';
import SafeChatTab from './components/hidden/SafeChatTab';
import SafeMapTab from './components/hidden/SafeMapTab';
import CommunityForumTab from './components/hidden/CommunityForumTab';
import NoSimEmergencyTab from './components/hidden/NoSimEmergencyTab';
import SecurityYearbookTab from './components/hidden/SecurityYearbookTab';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const { activeLayer, publicTab, hiddenTab, toastMessage } = useApp();

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#fff8f7] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7e001d] to-[#fe6a7b] flex items-center justify-center text-white text-2xl animate-bounce shadow-md">
          🌸
        </div>
        <span className="text-xs font-bold text-[#7e001d] tracking-wider uppercase">
          Carregando Line...
        </span>
      </div>
    );
  }

  // Not logged in: Show Login / Cadastro screen
  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="w-full min-h-screen bg-[#fff8f7] flex justify-center selection:bg-[#fe6a7b]/30">
      <div className="w-full max-w-[440px] flex flex-col min-h-screen relative bg-[#fff8f7] shadow-xl border-x border-[#ffe8ec]">
        {/* Onboarding pós-cadastro (se ainda não completado) */}
        <OnboardingModal />

        {/* Top Header */}
        <Header />

        {/* Main Content Canvas */}
        <main className={`flex-1 flex flex-col relative w-full px-4 pt-20 ${
          activeLayer === 'public' ? 'pb-24' : 'pb-8'
        }`}>
          {activeLayer === 'public' ? (
            /* --- CAMADA PÚBLICA (Saúde Feminina - Aura Ciclo) --- */
            <>
              {publicTab === 'dashboard' && <DashboardTab />}
              {publicTab === 'calendar' && <CalendarTab />}
              {publicTab === 'reminders' && <RemindersTab />}
              {publicTab === 'profile' && <ProfileTab />}
              <PublicBottomNav />
            </>
          ) : (
            /* --- CAMADA OCULTA (Portal de Apoio a Vítimas - Apoio Line) --- */
            <div className="flex flex-col w-full animate-in fade-in duration-200">
              {/* Omnipresent Quick Escape Bar */}
              <QuickEscapeBar />

              {/* Sub-navigation for the 5 hidden tools */}
              <HiddenNavigation />

              {/* Active hidden tool */}
              {hiddenTab === 'chat' && <SafeChatTab />}
              {hiddenTab === 'map' && <SafeMapTab />}
              {hiddenTab === 'forum' && <CommunityForumTab />}
              {hiddenTab === 'nosim' && <NoSimEmergencyTab />}
              {hiddenTab === 'manual' && <SecurityYearbookTab />}
            </div>
          )}
        </main>

        {/* Discreet Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2e131b] text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CycleProvider>
          <AppContent />
        </CycleProvider>
      </AppProvider>
    </AuthProvider>
  );
}
