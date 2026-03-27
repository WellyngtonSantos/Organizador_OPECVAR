import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';

// Placeholder pages - will be implemented in later phases
function TaskListPage() {
  return (
    <div>
      <h2>Tarefas</h2>
      <p>Módulo de tarefas será implementado na Fase 4.</p>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Dashboard semanal será implementado na Fase 7.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h2>Configurações</h2>
      <p>Configurações serão implementadas na Fase 8.</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/tasks" element={<TaskListPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/tasks" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
