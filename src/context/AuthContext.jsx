import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, dataService } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await dataService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Perfil inicial caso ainda não exista
            const newProfile = {
              uid: user.uid,
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              onboardingCompleted: false,
              cycleLength: 28,
              periodDuration: 5,
              lastPeriodDate: '',
              createdAt: new Date().toISOString()
            };
            await dataService.saveUserProfile(user.uid, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Erro ao carregar perfil:', err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      const profile = await dataService.getUserProfile(user.uid);
      setCurrentUser(user);
      setUserProfile(profile);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Falha ao autenticar.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cadastro
  const signup = useCallback(async (email, password, displayName) => {
    setIsLoading(true);
    try {
      const user = await authService.register(email, password, displayName);
      const initialProfile = {
        uid: user.uid,
        name: displayName || user.displayName || email.split('@')[0],
        email: user.email,
        onboardingCompleted: false,
        cycleLength: 28,
        periodDuration: 5,
        lastPeriodDate: '',
        createdAt: new Date().toISOString()
      };
      await dataService.saveUserProfile(user.uid, initialProfile);
      setCurrentUser(user);
      setUserProfile(initialProfile);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Falha ao cadastrar.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  // Atualizar dados do perfil (duração do ciclo, data última menstruação, nome, etc.)
  const updateProfileData = useCallback(async (data) => {
    if (!currentUser) return;
    const updated = await dataService.saveUserProfile(currentUser.uid, {
      ...userProfile,
      ...data
    });
    setUserProfile(updated);
    return updated;
  }, [currentUser, userProfile]);

  // Completar Onboarding pós-cadastro
  const completeOnboarding = useCallback(async ({ lastPeriodDate, cycleLength, periodDuration }) => {
    if (!currentUser) return;
    const updated = await dataService.saveUserProfile(currentUser.uid, {
      ...userProfile,
      lastPeriodDate,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      onboardingCompleted: true
    });
    setUserProfile(updated);
    return updated;
  }, [currentUser, userProfile]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        login,
        signup,
        logout,
        updateProfileData,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
