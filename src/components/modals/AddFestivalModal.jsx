// src/components/modals/AddFestivalModal.jsx
import React, { useState } from 'react';
import './EditUserRoleModal.css';

export default function AddFestivalModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nombre || !fecha || !lugar) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    // Volvemos a pasar solo el objeto de datos, sin el archivo de imagen
    onSave({
      nombre,
      fecha,
      lugar,
      estatus: 'proximo',
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Nuevo Festival</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre del Festival:</label>
          <input 
            type="text" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input 
            type="date"
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Lugar:</label>
          <input 
            type="text" 
            value={lugar} 
            onChange={(e) => setLugar(e.target.value)} 
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Crear</button>
        </div>
      </div>
    </div>
  );
}