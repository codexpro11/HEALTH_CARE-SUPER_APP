import { create } from 'zustand';
import { EmergencyRequest } from '../types';
import { emergencyApi } from '../api/emergencyApi';

interface EmergencyState {
  isActive: boolean;
  activeRequest: EmergencyRequest | null;
  stage: 'IDLE' | 'LOCATING' | 'DISPATCHING' | 'LIVE_TRACKING' | 'RESOLVED';
  simulatedEtaSeconds: number;
  isTriggerModalOpen: boolean;
  webSocketConnected: boolean;
  triggerSOS: (emergencyType?: string) => Promise<void>;
  cancelEmergency: () => Promise<void>;
  setIsTriggerModalOpen: (open: boolean) => void;
  decrementEta: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  isActive: false,
  activeRequest: null,
  stage: 'IDLE',
  simulatedEtaSeconds: 360, // 6 minutes
  isTriggerModalOpen: false,
  webSocketConnected: true, // Prepared for Spring Boot STOMP/WebSocket

  triggerSOS: async (emergencyType = 'Critical Medical Distress') => {
    set({ stage: 'LOCATING', isTriggerModalOpen: false });

    // Simulate rapid GPS fix & API dispatch call
    setTimeout(async () => {
      try {
        const response = await emergencyApi.triggerSOS({
          latitude: 37.7749,
          longitude: -122.4194,
          address: '742 Evergreen Terrace, Metro City, CA',
          emergencyType,
        });

        if (response.success && response.data) {
          set({
            isActive: true,
            activeRequest: response.data,
            stage: 'LIVE_TRACKING',
            simulatedEtaSeconds: response.data.etaMinutes * 60,
          });
        }
      } catch {
        set({ stage: 'IDLE', isActive: false });
      }
    }, 900);
  },

  cancelEmergency: async () => {
    const current = get().activeRequest;
    if (current) {
      await emergencyApi.cancelEmergency(current.id, 'User reported false alarm or condition resolved');
    }
    set({
      isActive: false,
      activeRequest: null,
      stage: 'IDLE',
      simulatedEtaSeconds: 360,
    });
  },

  setIsTriggerModalOpen: (open) => set({ isTriggerModalOpen: open }),

  decrementEta: () => {
    set((state) => ({
      simulatedEtaSeconds: Math.max(0, state.simulatedEtaSeconds - 1),
    }));
  },
}));
