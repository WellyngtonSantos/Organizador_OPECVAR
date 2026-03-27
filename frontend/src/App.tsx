import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Placeholder pages - will be implemented in later phases
function LoginPage() {
  return <div>Login Page - Coming in Phase 2</div>;
}

function TaskListPage() {
  return <div>Task List - Coming in Phase 4</div>;
}

function DashboardPage() {
  return <div>Dashboard - Coming in Phase 7</div>;
}

function SettingsPage() {
  return <div>Settings - Coming in Phase 8</div>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/tasks" element={<TaskListPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/tasks" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
