import STYLES from './styles';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import DataSources from './pages/DataSources';
import Pipelines from './pages/Pipelines';
import Blockchain from './pages/Blockchain';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Policies from './pages/Policies';
import Users from './pages/Users';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <>
      <style>{STYLES}</style>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/departments" element={<Protected><Departments /></Protected>} />
              <Route path="/datasources" element={<Protected><DataSources /></Protected>} />
              <Route path="/pipelines" element={<Protected><Pipelines /></Protected>} />
              <Route path="/blockchain" element={<Protected><Blockchain /></Protected>} />
              <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
              <Route path="/integrations" element={<Protected><Integrations /></Protected>} />
              <Route path="/policies" element={<Protected><Policies /></Protected>} />
              <Route path="/users" element={<Protected><Users /></Protected>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </>
  );
}