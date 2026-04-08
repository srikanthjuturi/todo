import axios from 'axios';

import { useLoader } from '../contexts/LoadingContext';

const createAxiosInstance = (showLoader: () => void, hideLoader: () => void) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    (config) => {
      if ((config as unknown as Record<string, unknown>).showGlobalLoader !== false) {
        showLoader();
      }
      if (!config.headers['Content-Type']) {
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        } else {
          config.headers['Content-Type'] = 'application/json';
        }
      }
      return config;
    },
    (error: unknown) => {
      hideLoader();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      if ((response.config as unknown as Record<string, unknown>).showGlobalLoader !== false) {
        hideLoader();
      }
      return response;
    },
    (error: unknown) => {
      if (
        error &&
        typeof error === 'object' &&
        'config' in error &&
        (error as Record<string, unknown>).config &&
        ((error as Record<string, Record<string, unknown>>).config).showGlobalLoader !== false
      ) {
        hideLoader();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const useAxiosInstance = () => {
  const { showLoader, hideLoader } = useLoader();
  return createAxiosInstance(showLoader, hideLoader);
};
