import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, LoginRequest, RegisterRequest } from '../types';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { userApi } from '../api/userApi';
import { patientApi } from '../api/patientApi';

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
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  fetchUserProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchUserProfiles = async () => {
    try {
      const userResponse = await userApi.getCurrentUser();
      if (!userResponse.success) {
        throw new Error(userResponse.message || 'Failed to fetch user profile');
      }

      let finalUser = userResponse.data;

      if (finalUser.role === 'PATIENT') {
        try {
          const patientResponse = await patientApi.getCurrentPatient();
          if (patientResponse.success) {
            finalUser = { ...finalUser, ...patientResponse.data };
          }
        } catch (err) {
          console.error('Failed to fetch patient specific details:', err);
        }
      }

      setUser(finalUser);
      setRole(finalUser.role);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      console.error('Error fetching user profiles:', err);
      setError('Failed to load user data from server.');
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        clearError();
        await fetchUserProfiles();
        setIsLoading(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (payload: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setRole('PATIENT');
      setError(null);
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value = {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    switchRole,
    updateUser,
    clearError,
    fetchUserProfiles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
