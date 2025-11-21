// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// --- Páginas Públicas ---
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// --- Componentes de Ruteo ---
import RoleRouter from './components/RoleRouter.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// --- Layouts ---
import SuperAdminLayout from './layouts/SuperAdminLayout.jsx';
// AdminLayout ya no se usa

// --- Páginas SuperAdmin ---
import ManageUsersPage from './pages/ManageUsersPage.jsx';
import ManageTemplatesPage from './pages/ManageTemplatesPage.jsx';
import ManageFestivalsPage from './pages/ManageFestivalsPage.jsx';
import FestivalDetailPage from './pages/FestivalDetailPage.jsx'; // Usado solo por SuperAdmin

// --- Páginas Juez ---
import JuezFestivalPage from './pages/JuezFestivalPage.jsx';

const SuperAdminHome = () => <div className="manage-users-container"><h1>Bienvenido, Superadmin</h1><p>Usa el menú lateral para navegar.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<div className="app-container"><LoginPage /></div>} />
          <Route path="/register" element={<div className="app-container"><RegisterPage /></div>} />

          {/* --- RUTA PROTEGIDA PRINCIPAL (Redirige según rol) --- */}
          <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />

          {/* --- RUTA VISTA JUEZ --- */}
          <Route
            path="/festival/:festivalId"
            element={<ProtectedRoute><div className="app-container"><JuezFestivalPage /></div></ProtectedRoute>}
          />

          {/* --- RUTAS ANIDADAS DEL SUPERADMIN --- */}
          <Route
            path="/superadmin"
            element={<ProtectedRoute requiredRole="superadmin"><SuperAdminLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="festivales" replace />} />
            <Route path="usuarios" element={<ManageUsersPage />} />
            <Route path="plantillas" element={<ManageTemplatesPage />} />
            <Route path="festivales" element={<ManageFestivalsPage />} />
            <Route path="festival/:festivalId" element={<FestivalDetailPage />} />
          </Route>

          {/* --- RUTAS ADMIN ELIMINADAS --- */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;