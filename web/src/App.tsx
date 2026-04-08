import { Routes, Route, Navigate } from 'react-router-dom';

import { useLoader } from './contexts/LoadingContext';
import ManagePage from './pages/ManagePage';
import TodosPage from './pages/TodosPage';
import { Toaster } from './components/ui/sonner';

const App = () => {
  const { loading } = useLoader();

  return (
    <>
      {loading && (
        <div
          role="progressbar"
          aria-label="Loading"
          className="fixed top-0 left-0 z-50 h-1 w-full bg-blue-500 animate-pulse"
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
};

export default App;
