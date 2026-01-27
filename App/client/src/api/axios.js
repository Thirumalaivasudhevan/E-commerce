import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
  withCredentials: true, // Enable cookies
});

// REQUEST INTERCEPTOR: Add Access Token from localStorage (backward compatibility)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR: Handle 401 & Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // console.log("🔄 Triggering Token Refresh...");
      originalRequest._retry = true;

      try {
        // Try to refresh using cookie or localStorage token
        const refreshToken = localStorage.getItem('refreshToken');
        const payload = refreshToken ? { refreshToken } : {};

        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          payload,
          { withCredentials: true } // Send cookies
        );

        if (res.status === 200) {
          // console.log("✅ Token Refreshed Successfully");
          const { accessToken } = res.data;

          // Store new token (backward compatibility)
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh Logic Failed:", refreshError.message);
        // Clear all auth data
        localStorage.clear();
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

