// src/components/modals/EditTemplateItemModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './EditUserRoleModal.css';

export default function EditTemplateItemModal({ item, itemType, onSave, onClose }) {
  const [nombre, setNombre] = useState(item.nombre);
  const [peso, setPeso] = useState(item.peso || '');
  const [puntajeMaximo, setPuntajeMaximo] = useState(item.puntajeMaximo || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nombre) {
      setError('El nombre es obligatorio.');
      return;
    }

    const updatedItem = { ...item, nombre };

    if (itemType !== 'criterio') {
      if (!peso || isNaN(peso) || peso <= 0) {
        setError('El peso debe ser un número positivo.');
        return;
      }
      updatedItem.peso = Number(peso);
    }

    if (itemType === 'criterio') {
      if (!puntajeMaximo || isNaN(puntajeMaximo) || puntajeMaximo <= 0) {
        setError('El puntaje debe ser un número positivo.');
        return;
      }
      updatedItem.puntajeMaximo = Number(puntajeMaximo);
    }

    onSave(updatedItem);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        {itemType !== 'criterio' && (
          <div className="form-group">
            <label>Peso (%):</label>
            <input type="number" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>
        )}

        {itemType === 'criterio' && (
          <div className="form-group">
            <label>Puntaje Máximo:</label>
            <input type="number" value={puntajeMaximo} onChange={(e) => setPuntajeMaximo(e.target.value)} />
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Guardar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}