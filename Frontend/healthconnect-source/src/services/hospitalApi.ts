import axios from 'axios';

const API_BASE = '/api/v1/hospitals';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  type: string;
}

export const hospitalApi = {
  getHospitals: async (): Promise<Hospital[]> => {
    // const response = await axios.get(API_BASE);
    // return response.data;
    return [
      { id: 'h-1', name: 'Central City Hospital', location: 'Downtown', type: 'General' },
      { id: 'h-2', name: 'Wellness Clinic', location: 'Uptown', type: 'Specialty' }
    ];
  }
};
