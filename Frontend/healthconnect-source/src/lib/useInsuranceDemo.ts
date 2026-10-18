import { useEffect, useState } from 'react';
import { getInsuranceState, INSURANCE_CHANGED } from './insuranceDemo';

export function useInsuranceDemo() {
  const [state, setState] = useState<ReturnType<typeof getInsuranceState> | null>(null);
  const [error, setError] = useState('');
  const refresh = () => {
    try { setState(getInsuranceState()); setError(''); }
    catch (failure) { setState(null); setError(failure instanceof Error ? failure.message : 'Unable to load insurance.'); }
  };
  useEffect(() => {
    refresh();
    window.addEventListener(INSURANCE_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(INSURANCE_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return { state, error, refresh };
}

