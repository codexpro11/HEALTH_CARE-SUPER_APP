import { apiClient, executeWithFallback } from './axios';
import { ApiResponse, BloodBank } from '../types';
import { mockBloodBanks } from '../data/mockData';

export const bloodBankApi = {
  getBloodBanks: async (filter?: {
    bloodGroup?: string;
    openOnly?: boolean;
    searchQuery?: string;
  }): Promise<ApiResponse<BloodBank[]>> => {
    return executeWithFallback(
      () => apiClient.get('/api/v1/blood-banks', { params: filter }),
      () => {
        let list = [...mockBloodBanks];
        if (!filter) return list;

        if (filter.searchQuery) {
          const q = filter.searchQuery.toLowerCase();
          list = list.filter((b) => b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q));
        }
        if (filter.openOnly) {
          list = list.filter((b) => b.isOpen24x7);
        }
        if (filter.bloodGroup && filter.bloodGroup !== 'ALL') {
          list = list.filter((b) =>
            b.inventory.some((inv) => inv.bloodGroup === filter.bloodGroup && inv.unitsAvailable > 0)
          );
        }
        return list;
      },
      'Blood banks retrieved'
    );
  },

  getBloodBankById: async (id: string): Promise<ApiResponse<BloodBank>> => {
    return executeWithFallback(
      () => apiClient.get(`/api/v1/blood-banks/${id}`),
      () => {
        const found = mockBloodBanks.find((b) => b.id === id);
        if (!found) throw new Error('Blood bank unavailable.');
        return found;
      },
      'Blood bank details retrieved'
    );
  },
};

