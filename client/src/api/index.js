import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add interceptor to include token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const classifyWaste = (formData) => API.post('/waste/classify', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getHistory = (userId) => API.get(`/waste/history/${userId || ''}`);
export const sendMessage = (data) => API.post('/chat', data);
export const getChatHistory = (userId) => API.get(`/chat/history/${userId || ''}`);

export default API;
