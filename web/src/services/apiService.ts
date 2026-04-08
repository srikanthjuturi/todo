import { useAxiosInstance } from '../config/axiosConfig';

export const useApiService = () => {
  const axios = useAxiosInstance();

  const handleError = (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown } };
      switch (axiosError.response.status) {
        case 404:
          console.error('Resource not found');
          break;
        case 409:
          console.error('Conflict — resource already exists');
          break;
        case 422:
          console.error('Validation error', axiosError.response.data);
          break;
        default:
          console.error('Server error:', axiosError.response.status);
      }
    } else if (error && typeof error === 'object' && 'request' in error) {
      console.error('Network error — no response received');
    } else {
      console.error('Unexpected error:', error);
    }
  };

  const apiService = {
    get: async <T = unknown>(endpoint: string, showGlobalLoader = true): Promise<T> => {
      try {
        const response = await axios.get<T>(endpoint, { showGlobalLoader } as Record<string, unknown>);
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    post: async <T = unknown>(endpoint: string, data: unknown, showGlobalLoader = true): Promise<T> => {
      try {
        const response = await axios.post<T>(endpoint, data, { showGlobalLoader } as Record<string, unknown>);
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    put: async <T = unknown>(endpoint: string, data: unknown, showGlobalLoader = true): Promise<T> => {
      try {
        const response = await axios.put<T>(endpoint, data, { showGlobalLoader } as Record<string, unknown>);
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    patch: async <T = unknown>(endpoint: string, data: unknown, showGlobalLoader = true): Promise<T> => {
      try {
        const response = await axios.patch<T>(endpoint, data, { showGlobalLoader } as Record<string, unknown>);
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },

    delete: async <T = unknown>(endpoint: string, showGlobalLoader = true): Promise<T> => {
      try {
        const response = await axios.delete<T>(endpoint, { showGlobalLoader } as Record<string, unknown>);
        return response.data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  };

  return apiService;
};
