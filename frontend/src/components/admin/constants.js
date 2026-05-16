export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}`
});
