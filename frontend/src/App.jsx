import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EquipmentList } from './pages/Equipment/EquipmentList';
import { EquipmentForm } from './pages/Equipment/EquipmentForm';
import { EquipmentDetail } from './pages/Equipment/EquipmentDetail';
import { MaintenanceList } from './pages/Maintenance/MaintenanceList';
import { MaintenanceForm } from './pages/Maintenance/MaintenanceForm';
import { TechnicianList } from './pages/Technicians/TechnicianList';
import { TechnicianForm } from './pages/Technicians/TechnicianForm';
import { Reports } from './pages/Reports';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <EquipmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/new"
        element={
          <ProtectedRoute>
            <EquipmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id"
        element={
          <ProtectedRoute>
            <EquipmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id/edit"
        element={
          <ProtectedRoute>
            <EquipmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <MaintenanceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance/new"
        element={
          <ProtectedRoute>
            <MaintenanceForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance/:id/edit"
        element={
          <ProtectedRoute>
            <MaintenanceForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technicians"
        element={
          <ProtectedRoute>
            <TechnicianList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technicians/new"
        element={
          <ProtectedRoute>
            <TechnicianForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technicians/:id/edit"
        element={
          <ProtectedRoute>
            <TechnicianForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
