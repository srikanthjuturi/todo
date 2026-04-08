import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LoadingProvider } from './contexts/LoadingContext';
import './index.css';
import App from  './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
