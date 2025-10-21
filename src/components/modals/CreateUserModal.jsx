// src/components/modals/CreateUserModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EditUserRoleModal.css'; // Reutilizamos los estilos

export default function CreateUserModal({ onClose, onUserCreated }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('juez');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleCreate = async () => {
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');
    try {
      await signup(email, password, nombre, rol);
      onUserCreated();
      onClose();
    } catch (err) {
      setError('Error al crear usuario: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Nuevo Usuario</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre Completo:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Rol:</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="juez">Juez</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleCreate} className="button-save">Crear Usuario</button>
        </div>
      </div>
    </div>
  );
}