// src/components/modals/EditFestivalModal.jsx
import React, { useState } from 'react';
import './EditUserRoleModal.css'; // Reutilizamos estilos

export default function EditFestivalModal({ festival, onSave, onClose }) {
  // Inicializamos el estado con los datos existentes del festival
  const [nombre, setNombre] = useState(festival.nombre);
  const [fecha, setFecha] = useState(festival.fecha);
  const [lugar, setLugar] = useState(festival.lugar);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nombre || !fecha || !lugar) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // Pasamos solo los datos que pueden cambiar
    onSave({
      nombre,
      fecha,
      lugar,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Festival</h2>
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
          <button onClick={handleSave} className="button-save">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}