import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 60000, // 60 seconds to accommodate Render free-tier cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject('Server connection timed out. Please retry in a few seconds as the backend wakes up.');
        }
        if (!error.response) {
            return Promise.reject('Network error. Make sure the backend server is online.');
        }
        const message = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(message);
    }
);

export default api;
