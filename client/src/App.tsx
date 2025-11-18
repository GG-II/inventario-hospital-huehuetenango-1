import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EquiposList } from './pages/equipos/EquiposList';  // ← AGREGAR
import { EquipoForm } from './pages/equipos/EquipoForm';
import { EquipoDetail } from './pages/equipos/EquipoDetail';
import { EquipoHistorial } from './pages/equipos/EquipoHistorial';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/equipos" element={<EquiposList />} />  
                    <Route path="/equipos/nuevo" element={<EquipoForm />} />  
                    <Route path="/equipos/:id/editar" element={<EquipoForm />} /> 
                    <Route path="/equipos/:id" element={<EquipoDetail />} />
                    <Route path="/equipos/:id/historial" element={<EquipoHistorial />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;