import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole, LoginRequest, RegisterRequest } from '../types';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup,
  signOut, onAuthStateChanged, updateProfile, setPersistence,
  browserLocalPersistence, browserSessionPersistence,
} from 'firebase/auth';
import { getFirebaseAuth, googleProvider } from '../firebase/config';
import { userApi } from '../api/userApi';
import { patientApi } from '../api/patientApi';
import { isDemoMode, demoUser, getDemoSession, saveDemoSession, clearDemoSession, saveDemoProfile, getDemoScenario } from '../lib/demo';
import { errorMessage } from '../lib/request';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../stores/cartStore';
import { clearNfcAccess } from '../lib/nfcDemo';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  fetchUserProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearError = () => setError(null);

  const fetchUserProfiles = async () => {
    const uid = isDemoMode ? null : getFirebaseAuth().currentUser?.uid;
    const response = await userApi.getCurrentUser();
    let profile = response.data;
    if (profile.role === 'PATIENT') {
      const patient = (await patientApi.getCurrentPatient()).data;
      // Patient details must not overwrite account identity or the authorized role.
      profile = {
        ...profile,
        bloodGroup: patient.bloodGroup, allergies: patient.allergies,
        chronicConditions: patient.chronicConditions, emergencyContact: patient.emergencyContact,
        dateOfBirth: patient.dateOfBirth ?? profile.dateOfBirth,
      };
    }
    if (!isDemoMode && getFirebaseAuth().currentUser?.uid !== uid) return;
    setUser(profile);
  };

  useEffect(() => {
    if (isDemoMode) {
      setUser(getDemoSession());
      setIsLoading(false);
      return;
    }
    try {
      return onAuthStateChanged(getFirebaseAuth(), async firebaseUser => {
        setIsLoading(true);
        if (!firebaseUser) {
          setUser(null);
          queryClient.clear();
          useCartStore.getState().clearCart();
          setIsLoading(false);
          return;
        }
        try {
          await fetchUserProfiles();
          clearError();
        } catch (failure) {
          setUser(null);
          setError(errorMessage(failure));
        } finally {
          setIsLoading(false);
        }
      });
    } catch (failure) {
      setError(errorMessage(failure));
      setIsLoading(false);
    }
  }, []);

  const authenticate = async (action: () => Promise<void>) => {
    setIsLoading(true);
    clearError();
    try {
      await action();
      return true;
    } catch (failure) {
      setError(errorMessage(failure));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startDemo = (profile: User, remember = true) => {
    // Demo credentials are never stored or sent to an authentication provider.
    clearNfcAccess();
    queryClient.clear();
    useCartStore.getState().clearCart();
    saveDemoSession(profile, remember);
    setUser(profile);
  };

  const login = (credentials: LoginRequest) => authenticate(async () => {
    if (isDemoMode) {
      startDemo(demoUser(credentials.email), credentials.rememberMe ?? true);
      return;
    }
    const auth = getFirebaseAuth();
    await setPersistence(auth, credentials.rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
    await fetchUserProfiles();
  });

  const loginWithGoogle = () => authenticate(async () => {
    if (isDemoMode) {
      startDemo(demoUser('demo.patient@healthconnect.example'));
      return;
    }
    await signInWithPopup(getFirebaseAuth(), googleProvider);
    await fetchUserProfiles();
  });

  const register = (payload: RegisterRequest) => authenticate(async () => {
    if (!payload.fullName.trim() || !payload.phoneNumber.trim()) throw new Error('Enter your name and phone number.');
    if (payload.password.length < 6) throw new Error('Use a password with at least 6 characters.');
    if (payload.confirmPassword && payload.password !== payload.confirmPassword) throw new Error('Passwords do not match.');
    if (!payload.termsAccepted) throw new Error('Accept the terms before continuing.');
    if (isDemoMode) {
      startDemo({
        ...demoUser(payload.email), fullName: payload.fullName.trim(), phoneNumber: payload.phoneNumber.trim(),
        dateOfBirth: payload.dateOfBirth, gender: payload.gender, role: 'PATIENT',
      });
      return;
    }
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), payload.email.trim(), payload.password);
    await updateProfile(credential.user, { displayName: payload.fullName.trim() });
    await userApi.updateCurrentUser({
      fullName: payload.fullName.trim(), phoneNumber: payload.phoneNumber.trim(),
      dateOfBirth: payload.dateOfBirth, gender: payload.gender,
    });
    await fetchUserProfiles();
  });

  const logout = async () => {
    clearError();
    try {
      if (isDemoMode) { clearNfcAccess(); clearDemoSession(); }
      else await signOut(getFirebaseAuth());
      setUser(null);
      queryClient.clear();
      useCartStore.getState().clearCart();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  const switchRole = (role: UserRole) => {
    if (!isDemoMode || !user) return;
    clearNfcAccess();
    queryClient.clear();
    const profile = { ...user, role };
    saveDemoProfile(profile);
    setUser(profile);
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    clearError();
    try {
      if (isDemoMode) {
        if (getDemoScenario() === 'error') throw new Error('Demo failure: profile changes were not saved. Switch to the Success scenario and retry.');
        const profile = { ...user, ...updates, id: user.id, email: user.email, role: user.role };
        saveDemoProfile(profile);
        setUser(profile);
      } else {
        setUser((await userApi.updateCurrentUser(updates)).data);
      }
      return true;
    } catch (failure) {
      setError(errorMessage(failure));
      return false;
    }
  };

  return <AuthContext.Provider value={{
    user, role: user?.role ?? 'PATIENT', isAuthenticated: !!user, isLoading, error,
    login, loginWithGoogle, register, logout, switchRole, updateUser, clearError, fetchUserProfiles,
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
