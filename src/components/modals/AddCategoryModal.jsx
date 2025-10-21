// src/components/modals/AddCategoryModal.jsx
import React, { useState } from 'react';
import './EditUserRoleModal.css'; // Reutilizamos los mismos estilos

export default function AddCategoryModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [peso, setPeso] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nombre || !peso) {
      setError('El nombre y el peso son obligatorios.');
      return;
    }
    if (isNaN(peso) || peso <= 0) {
      setError('El peso debe ser un número positivo.');
      return;
    }

    onSave({
      id: `cat_${Date.now()}`, // 👈 AÑADIMOS ID
      nombre,
      peso: Number(peso), // Convertimos el peso a número
      subcategorias: [] // Toda nueva categoría empieza sin subcategorías
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Añadir Nueva Categoría</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre de la Categoría:</label>
          <input 
            type="text" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Peso (%):</label>
          <input 
            type="number" 
            value={peso} 
            onChange={(e) => setPeso(e.target.value)} 
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Añadir</button>
        </div>
      </div>
    </div>
  );
}