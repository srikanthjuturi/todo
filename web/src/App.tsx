import { Routes, Route, Navigate } from 'react-router-dom';

import { useLoader } from './contexts/LoadingContext';
import ManagePage from './pages/ManagePage';
import TodosPage from './pages/TodosPage';
import { Toaster } from './components/ui/sonner';

const App = () => {
  const { loading } = useLoader();

  return (
    <>
      {/* Animated background shapes */}
      <div className="bg-shapes" aria-hidden="true">
        <div className="bg-shape bg-shape-circle bg-shape-circle-1" />
        <div className="bg-shape bg-shape-circle bg-shape-circle-2" />
        <div className="bg-shape bg-shape-circle bg-shape-circle-3" />
        <div className="bg-shape bg-shape-circle bg-shape-circle-4" />
        <div className="bg-shape bg-shape-square bg-shape-square-1" />
        <div className="bg-shape bg-shape-square bg-shape-square-2" />
        <div className="bg-shape bg-shape-square bg-shape-square-3" />
        <div className="bg-shape bg-shape-square bg-shape-square-4" />
      </div>
      {loading && (
        <div
          role="progressbar"
          aria-label="Loading"
          className="fixed top-0 left-0 z-50 h-1 w-full bg-primary animate-pulse"
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
