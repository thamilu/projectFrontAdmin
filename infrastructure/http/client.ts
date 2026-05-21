import axios from 'axios';
import axiosRetry from 'axios-retry';
import { env } from '@/env';
import { requestInterceptor, responseInterceptor } from './interceptors';
import { handleApiError } from './error-handler';

/**
 * Enterprise Axios Client
 * Serves as the single HTTP gateway for all feature APIs in the application.
 */
/** Same-origin BFF routes; must not point at Spring Boot from the browser */
const API_BASE_URL = env.clientApiBaseUrl || '/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Configure robust exponential retry strategy
axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ?? 0) >= 500
    );
  },
  shouldResetTimeout: true,
});

// Bind interceptors and error handlers
axiosClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
axiosClient.interceptors.response.use(responseInterceptor, handleApiError);

export default axiosClient;
