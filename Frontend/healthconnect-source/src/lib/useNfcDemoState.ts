import { useEffect, useState } from 'react';
import { getNfcState, NFC_CHANGED } from './nfcDemo';

export function useNfcDemoState() {
  const [state, setState] = useState<ReturnType<typeof getNfcState> | null>(null);
  const [error, setError] = useState('');
  const refresh = () => {
    try { setState(getNfcState()); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to load NFC demo data.'); }
  };
  useEffect(() => {
    refresh();
    window.addEventListener(NFC_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(NFC_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return { state, error, refresh };
}
