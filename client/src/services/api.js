import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        return Promise.reject(data.error || { message: 'Request failed' });
      }
      return data.data;
    }
    return data;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    return Promise.reject({ message });
  },
);

export default api;
