import { mockCurrentUser } from '../data/mockData';
import type { User } from '../types';
import type { DemoScenario } from './request';

export const isDemoMode = import.meta.env?.VITE_DEMO_MODE === 'true';
const SESSION_KEY = 'hc_demo_session';

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Changes could not be saved in this browser. Enable browser storage and try again.');
  }
}

export function getDemoScenario(): DemoScenario {
  const value = readStored<DemoScenario>('hc_demo_scenario', 'success');
  return ['success', 'error', 'empty'].includes(value) ? value : 'success';
}

export function demoProfileKey(email: string): string {
  return 'hc_demo_profile:' + email.trim().toLowerCase();
}

export function getDemoSession(): User | null {
  let session = readStored<User | null>(SESSION_KEY, null);
  try { session = session ?? JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { /* ignore invalid session */ }
  return session?.id && session.email ? session : null;
}

export function demoUser(email: string): User {
  const normalized = email.trim().toLowerCase();
  return readStored<User>(demoProfileKey(normalized), {
    ...mockCurrentUser, id: 'demo:' + normalized, email: normalized,
  });
}

export function saveDemoSession(user: User, remember = true): void {
  writeStored(demoProfileKey(user.email), user);
  sessionStorage.removeItem(SESSION_KEY);
  if (remember) writeStored(SESSION_KEY, user);
  else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function clearDemoSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveDemoProfile(user: User): void {
  writeStored(demoProfileKey(user.email), user);
  if (localStorage.getItem(SESSION_KEY)) writeStored(SESSION_KEY, user);
  else if (sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function settingsKey(userId: string): string {
  return 'hc_preferences:' + userId;
}

export function clearDemoData(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('hc_') || key === 'healthconnect-cart');
  keys.forEach(key => localStorage.removeItem(key));
  sessionStorage.removeItem(SESSION_KEY);
}

export function demoStorageKey(key: string): string {
  return key + ':' + (getDemoSession()?.id ?? 'guest');
}
