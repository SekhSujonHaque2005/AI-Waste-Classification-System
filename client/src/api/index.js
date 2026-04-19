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

export const classifyWaste = (formData) => API.post('/waste/classify', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getHistory = (userId) => API.get('/waste/history', { params: { userId } });
export const sendMessage = (data) => API.post('/chat', data);
export const getChatHistory = (userId) => API.get('/chat/history', { params: { userId } });

export default API;
