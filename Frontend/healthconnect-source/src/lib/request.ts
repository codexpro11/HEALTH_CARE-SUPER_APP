import type { ApiResponse } from '../types';

export type DemoScenario = 'success' | 'error' | 'empty';

export function errorMessage(error: unknown): string {
  const failure = error as { response?: { status?: number; data?: { message?: string; error?: { message?: string } } }; message?: string };
  if (failure?.response?.data?.error?.message) return failure.response.data.error.message;
  if (failure?.response?.data?.message) return failure.response.data.message;
  if (failure?.response?.status === 409) return 'This slot is no longer available. Choose another time.';
  if (failure?.response?.status === 403) return 'You do not have permission to perform this action.';
  if (failure?.response?.status === 401) return 'Your session has expired. Sign in again.';
  if (failure?.response?.status) return 'The request could not be completed. Please try again.';
  return failure?.message || 'Could not connect. Check your connection and try again.';
}

export async function executeRequest<T>(
  apiCall: () => Promise<{ data: ApiResponse<T> }>,
  mock: () => T | Promise<T>,
  options: { demo: boolean; scenario: DemoScenario; message: string }
): Promise<ApiResponse<T>> {
  if (options.demo) {
    if (options.scenario === 'error') throw new Error('Demo failure: this request could not be completed. Switch the preview scenario to Success to retry.');
    const generated = await mock();
    const data = options.scenario === 'empty' && Array.isArray(generated) ? [] as T : generated;
    return { success: true, data, message: options.message, timestamp: new Date().toISOString() };
  }
  try {
    const response = await apiCall();
    if (!response.data.success) throw new Error(errorMessage({ response: { data: response.data } }));
    return response.data;
  } catch (error) {
    // Live requests always expose failures; never turn them into a mock success.
    throw new Error(errorMessage(error));
  }
}
