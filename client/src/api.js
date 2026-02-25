import axios from 'axios';

const API_URL = 'https://intern-tracker-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL
});

export const getInterns = (params) => api.get('/', { params });
export const getIntern = (id) => api.get(`/${id}`);
export const createIntern = (data) => api.post('/', data);
export const updateIntern = (id, data) => api.patch(`/${id}`, data);
export const deleteIntern = (id) => api.delete(`/${id}`);

export default api;
