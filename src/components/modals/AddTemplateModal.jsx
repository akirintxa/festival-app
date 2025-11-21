// src/components/modals/AddTemplateModal.jsx
import React, { useState } from 'react';
import '../modals/Modal.css';

export default function AddTemplateModal({ templates, onSave, onClose }) {
    const [newTemplateName, setNewTemplateName] = useState('');
    const [sourceTemplateId, setSourceTemplateId] = useState('');

    const handleCreate = () => {
        if (!newTemplateName.trim()) return;
        onSave(newTemplateName, sourceTemplateId);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nueva Plantilla</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Nombre de la Plantilla:</label>
                        <input
                            type="text"
                            placeholder="Ej. Gaitas 2025"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Copiar desde (Opcional):</label>
                        <select
                            value={sourceTemplateId}
                            onChange={(e) => setSourceTemplateId(e.target.value)}
                        >
                            <option value="">-- Empezar de cero (Vacía) --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                            Si seleccionas una plantilla existente, se copiarán sus categorías y reglas de penalización.
                        </p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleCreate} className="btn btn-primary">Crear Plantilla</button>
                </div>
            </div>
        </div>
    );
}
