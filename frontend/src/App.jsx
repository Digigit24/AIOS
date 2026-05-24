import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUiStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { applyThemeConfig } from './api/services/themeService';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Pages from './pages/Pages';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      <div className="min-w-0">
        <h1 className="text-[32px] font-bold tracking-normal text-[color:var(--text)] font-nav leading-tight">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[color:var(--secondary)]">
          {description}
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">Organization Details</h2>
            <div className="w-16 h-1 bg-[color:var(--accent)] rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-4 rounded-md shimmer w-[90%]" />
            <div className="h-4 rounded-md shimmer w-[75%]" />
            <div className="h-4 rounded-md shimmer w-[80%]" />
            <div className="h-4 rounded-md shimmer w-[40%]" />
          </div>
        </div>
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">Secure Integrity Audits</h2>
            <div className="w-16 h-1 bg-[color:var(--secondary-accent)] rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-4 rounded-md shimmer w-[85%]" />
            <div className="h-4 rounded-md shimmer w-[90%]" />
            <div className="h-4 rounded-md shimmer w-[60%]" />
            <div className="h-4 rounded-md shimmer w-[50%]" />
          </div>
        </div>
      </div>

      <footer className="p-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--secondary)] text-xs text-center">
        This is a placeholder page for {title}.
      </footer>
    </div>
  );
}

export default function App() {
  const themeConfig = useUiStore((s) => s.themeConfig);

  useEffect(() => {
    applyThemeConfig(themeConfig);
  }, [themeConfig]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected app shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="pages" element={<Pages />} />
          <Route
            path="projects"
            element={
              <PlaceholderPage
                title="Secure Vaults & Projects"
                description="Encrypted workspace areas containing proprietary documentation and key pipelines."
              />
            }
          />
          <Route
            path="companies"
            element={
              <PlaceholderPage
                title="Organizations & Companies"
                description="View configurations and tenant rules associated with your multi-client structures."
              />
            }
          />
          <Route
            path="audit"
            element={
              <PlaceholderPage
                title="System Audit Logs"
                description="Chronological event logs mapping system interactions, database alterations, and authorization successes."
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
