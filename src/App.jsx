// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoleRouter from './components/RoleRouter.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SuperAdminLayout from './layouts/SuperAdminLayout.jsx';
import ManageUsersPage from './pages/ManageUsersPage.jsx';
import ManageTemplatesPage from './pages/ManageTemplatesPage.jsx';
import ManageFestivalsPage from './pages/ManageFestivalsPage.jsx';
import FestivalDetailPage from './pages/FestivalDetailPage.jsx';
import ManagePenaltyTemplatesPage from './pages/ManagePenaltyTemplatesPage.jsx';
import JuezFestivalPage from './pages/JuezFestivalPage.jsx';

const SuperAdminHome = () => <div className="manage-users-container"><h1>Bienvenido, Superadmin</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<div className="app-container"><LoginPage /></div>} />
          <Route path="/register" element={<div className="app-container"><RegisterPage /></div>} />

          {/* --- RUTAS PROTEGIDAS PRINCIPALES --- */}
          <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />
          
          {/* 👇 RUTA PARA LA VISTA DEL JUEZ (AHORA ESTÁ EN EL LUGAR CORRECTO) 👇 */}
          <Route 
            path="/festival/:festivalId" 
            element={<ProtectedRoute><div className="app-container"><JuezFestivalPage /></div></ProtectedRoute>}
          />

          {/* --- RUTAS ANIDADAS DEL SUPERADMIN --- */}
          <Route
            path="/superadmin"
            element={<ProtectedRoute><SuperAdminLayout /></ProtectedRoute>}
          >
            <Route path="dashboard" element={<SuperAdminHome />} />
            <Route path="usuarios" element={<ManageUsersPage />} />
            <Route path="plantillas" element={<ManageTemplatesPage />} />
            <Route path="festivales" element={<ManageFestivalsPage />} />
            <Route path="penalizaciones" element={<ManagePenaltyTemplatesPage />} />
            {/* Esta es la vista de detalle del festival para el ADMIN, es diferente a la del juez */}
            <Route path="festival/:festivalId" element={<FestivalDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;