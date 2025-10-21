// src/components/modals/ConfirmDeleteModal.jsx
import React from 'react';
import './EditUserRoleModal.css'; // Reutilizamos estilos

export default function ConfirmDeleteModal({ user, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmar Eliminación</h2>
        <p>
          ¿Estás seguro de que deseas eliminar al usuario <strong>{user.nombre}</strong> ({user.email})?
        </p>
        <p className="warning-text">Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={() => onConfirm(user.id)} className="button-delete">Sí, Eliminar</button>
        </div>
      </div>
    </div>
  );
}