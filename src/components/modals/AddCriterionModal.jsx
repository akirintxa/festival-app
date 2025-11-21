// src/components/modals/AddCriterionModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './EditUserRoleModal.css'; // Reutilizamos los mismos estilos

export default function AddCriterionModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [puntajeMaximo, setPuntajeMaximo] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nombre || !puntajeMaximo) {
      setError('El nombre y el puntaje son obligatorios.');
      return;
    }
    if (isNaN(puntajeMaximo) || puntajeMaximo <= 0) {
      setError('El puntaje debe ser un número positivo.');
      return;
    }

    onSave({
      id: `crit_${Date.now()}`, // 👈 AÑADIMOS ID
      nombre,
      puntajeMaximo: Number(puntajeMaximo) // Convertimos a número
    });
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Añadir Nuevo Criterio</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre del Criterio:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Puntaje Máximo:</label>
          <input
            type="number"
            value={puntajeMaximo}
            onChange={(e) => setPuntajeMaximo(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Añadir</button>
        </div>
      </div>
    </div>,
    document.body
  );
}