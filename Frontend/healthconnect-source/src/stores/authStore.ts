import { create } from 'zustand';
import { User, UserRole, LoginRequest, RegisterRequest } from '../types';
import { auth, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { userApi } from '../api/userApi';
import { patientApi } from '../api/patientApi';

interface AuthState {
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: 'PATIENT',
  isAuthenticated: false,
  isLoading: true, // Start true while Firebase initializes
  error: null,

  fetchUserProfiles: async () => {
    try {
      // 1. Fetch user profile from /api/v1/users/me
      const userResponse = await userApi.getCurrentUser();
      if (!userResponse.success) {
        throw new Error(userResponse.message || 'Failed to fetch user profile');
      }

      let finalUser = userResponse.data;

      // 2. If the user is a PATIENT, fetch additional patient details
      if (finalUser.role === 'PATIENT') {
        try {
          const patientResponse = await patientApi.getCurrentPatient();
          if (patientResponse.success) {
            // Merge additional patient details (like blood group, allergies) into the user object
            finalUser = { ...finalUser, ...patientResponse.data };
          }
        } catch (err) {
          console.error('Failed to fetch patient specific details:', err);
          // Non-fatal, we continue with user details
        }
      }

      set({
        user: finalUser,
        role: finalUser.role,
        isAuthenticated: true,
      });
    } catch (err: unknown) {
      console.error('Error fetching user profiles:', err);
      // Wait to sign out to avoid infinite loops if backend is down
      set({ error: 'Failed to load user data from server.', isAuthenticated: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      // After Firebase login, onAuthStateChanged will handle fetching the profile
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Google Login failed', isLoading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      // In a real flow, you'd likely create the user via backend API which handles Firebase creation,
      // or create in Firebase then POST to backend. 
      // Assuming simple Firebase creation for now:
      await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        role: 'PATIENT',
        error: null,
        isLoading: false
      });
    }
  },

  switchRole: (role: UserRole) => {
    set((state) => ({
      role,
      user: state.user ? { ...state.user, role } : null,
    }));
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  clearError: () => set({ error: null }),
}));

// Setup Firebase auth state listener
auth.onAuthStateChanged(async (firebaseUser) => {
  const store = useAuthStore.getState();
  if (firebaseUser) {
    store.clearError();
    // Fetch profile data from backend
    await store.fetchUserProfiles();
    useAuthStore.setState({ isLoading: false });
  } else {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
});
