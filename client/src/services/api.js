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
    const apiError = error.response?.data?.error;
    return Promise.reject({
      message:
        (apiError && typeof apiError === 'object' ? apiError.message : apiError) ||
        error.message ||
        'Request failed',
      issues: Array.isArray(apiError?.issues) ? apiError.issues : null,
      status: error.response?.status ?? null,
    });
  },
);

export default api;
