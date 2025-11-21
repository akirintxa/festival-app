// src/components/modals/CreateUserModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../modals/Modal.css'; // Asegurar que importamos los estilos globales

export default function CreateUserModal({ onClose, onUserCreated }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('juez');
  const [error, setError] = useState('');
  const { createUserByAdmin } = useAuth();

  const handleCreate = async () => {
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');
    try {
      await createUserByAdmin(email, password, nombre, rol);
      onUserCreated();
      onClose();
    } catch (err) {
      setError('Error al crear usuario: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Usuario</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label>Nombre Completo:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej. Juan Pérez" />
          </div>
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="juan@ejemplo.com" />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="******" />
          </div>
          <div className="form-group">
            <label>Rol:</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="juez">Juez</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button onClick={handleCreate} className="btn btn-primary">Crear Usuario</button>
        </div>
      </div>
    </div>
  );
}