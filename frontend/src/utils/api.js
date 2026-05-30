import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

export const getLeads = (params) => API.get('/leads', { params });
export const getLead = (id) => API.get(`/leads/${id}`);
export const createLead = (data) => API.post('/leads', data);
export const updateLead = (id, data) => API.put(`/leads/${id}`, data);
export const updateLeadStatus = (id, status) => API.patch(`/leads/${id}/status`, { status });
export const deleteLead = (id) => API.delete(`/leads/${id}`);
export const getDashboard = () => API.get('/leads/dashboard');
export const getLocations = () => API.get('/leads/locations');

export default API;
