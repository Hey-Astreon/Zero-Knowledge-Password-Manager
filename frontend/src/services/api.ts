import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject('Requested timed out. Please check your connection or try again.');
        }
        if (!error.response) {
            return Promise.reject('Network error. Make sure the server is online.');
        }
        const message = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(message);
    }
);

export default api;
