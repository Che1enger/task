const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const ENDPOINTS = {
  INFLUENCERS: `${API_URL}/api/influencers`,
  EMPLOYEES: `${API_URL}/api/influencers/employees`
};
