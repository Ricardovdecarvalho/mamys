// services/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3002/api'
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;