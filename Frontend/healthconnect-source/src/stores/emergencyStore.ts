import { create } from 'zustand';
import type { EmergencyRequest } from '../types';
import type { SosInput } from '../lib/emergencyRules';
import { activeEmergency } from '../lib/emergencyRules';
import { emergencyApi } from '../api/emergencyApi';
import { errorMessage } from '../lib/request';

interface EmergencyState {
  owner: string | null;
  isActive: boolean;
  activeRequest: EmergencyRequest | null;
  isTriggerModalOpen: boolean;
  busy: boolean;
  error: string | null;
  reset: () => void;
  restore: (owner: string) => Promise<void>;
  triggerSOS: (input: SosInput) => Promise<boolean>;
  cancelEmergency: (reason: string) => Promise<boolean>;
  setIsTriggerModalOpen: (open: boolean) => void;
}
let generation = 0;
const idle = { owner: null, isActive: false, activeRequest: null, isTriggerModalOpen: false, busy: false, error: null };
export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  ...idle,
  reset: () => { generation++; set(idle); },
  restore: async owner => {
    const current = ++generation;
    set({ ...idle, owner, busy: true });
    try {
      const result = await emergencyApi.getActiveEmergency();
      const active = result.data && activeEmergency(result.data) ? result.data : null;
      if (current === generation) set({ activeRequest: active, isActive: !!active, busy: false });
    } catch (failure) { if (current === generation) set({ error: errorMessage(failure), busy: false }); }
  },
  triggerSOS: async input => {
    if (get().busy || !get().owner) return false;
    const current = generation;
    set({ busy: true, error: null });
    try {
      const result = await emergencyApi.triggerSOS(input);
      if (current !== generation) return false;
      const active = activeEmergency(result.data);
      set({ activeRequest: active ? result.data : null, isActive: active, busy: false, isTriggerModalOpen: false });
      return true;
    } catch (failure) { if (current === generation) set({ error: errorMessage(failure), busy: false }); return false; }
  },
  cancelEmergency: async reason => {
    if (get().busy || !get().activeRequest) return false;
    const current = generation;
    const id = get().activeRequest!.id;
    set({ busy: true, error: null });
    try {
      const response = await emergencyApi.cancelEmergency(id, reason);
      if (!response.data.cancelled) throw new Error(response.data.message || 'Cancellation was not confirmed.');
      if (current !== generation) return false;
      set({ activeRequest: null, isActive: false, busy: false });
      return true;
    } catch (failure) { if (current === generation) set({ error: errorMessage(failure), busy: false }); return false; }
  },
  setIsTriggerModalOpen: open => set({ isTriggerModalOpen: open, error: null }),
}));
