// src/components/modals/EditUserRoleModal.jsx
import React, { useState } from 'react';
import './EditUserRoleModal.css';

export default function EditUserRoleModal({ user, onSave, onClose }) {
  const [newName, setNewName] = useState(user.nombre); // <-- AÑADIDO
  const [newRole, setNewRole] = useState(user.rol);

  const handleSave = () => {
    // Pasamos un objeto con todos los datos actualizados
    onSave(user.id, { nombre: newName, rol: newRole }); // <-- MODIFICADO
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Usuario</h2>
        <p><strong>Usuario:</strong> {user.email}</p>
        
        {/* 👇 CAMPO NUEVO PARA EDITAR EL NOMBRE 👇 */}
        <div className="form-group">
          <label htmlFor="name-input">Nombre:</label>
          <input 
            id="name-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role-select">Rol:</label>
          <select 
            id="role-select" 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="juez">Juez</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}