import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './EditUserRoleModal.css'; // Reutilizamos estilos

export default function AddPenaltyRuleModal({ categories, onSave, onClose }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [deducciones, setDeducciones] = useState([{ categoriaId: '', puntos: 0 }]);

    const handleAddDeduction = () => {
        setDeducciones([...deducciones, { categoriaId: '', puntos: 0 }]);
    };

    const handleRemoveDeduction = (index) => {
        setDeducciones(deducciones.filter((_, i) => i !== index));
    };

    const handleDeductionChange = (index, field, value) => {
        const newDeducciones = [...deducciones];
        newDeducciones[index][field] = value;
        setDeducciones(newDeducciones);
    };

    const handleSave = () => {
        if (!nombre.trim()) {
            alert('El nombre de la penalización es obligatorio.');
            return;
        }

        // Validar y formatear deducciones
        const validDeductions = deducciones.filter(d => d.categoriaId && d.puntos > 0).map(d => {
            const cat = categories.find(c => c.id === d.categoriaId);
            return {
                categoriaId: d.categoriaId,
                categoriaNombre: cat ? cat.nombre : 'Desconocida',
                puntos: Number(d.puntos)
            };
        });

        if (validDeductions.length === 0) {
            alert('Debes añadir al menos una deducción válida (seleccionar categoría y puntos > 0).');
            return;
        }

        onSave({
            id: Date.now().toString(), // ID temporal simple
            nombre,
            descripcion,
            deducciones: validDeductions
        });
    };

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <h2>Añadir Regla de Penalización</h2>

                <div className="form-group">
                    <label>Nombre de la Regla:</label>
                    <input
                        type="text"
                        placeholder="Ej. Tiempo Excedido"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Descripción (Opcional):</label>
                    <textarea
                        placeholder="Explica cuándo se aplica esta penalización..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div className="form-group">
                    <label>Deducciones:</label>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                        Define cuántos puntos se restan de cada categoría.
                    </p>

                    {deducciones.map((deduction, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                            <select
                                value={deduction.categoriaId}
                                onChange={(e) => handleDeductionChange(index, 'categoriaId', e.target.value)}
                                style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Categoría Afectada --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Puntos"
                                min="0"
                                value={deduction.puntos}
                                onChange={(e) => handleDeductionChange(index, 'puntos', e.target.value)}
                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />

                            {deducciones.length > 1 && (
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRemoveDeduction(index)}
                                    type="button"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}

                    <button className="btn btn-sm btn-secondary" onClick={handleAddDeduction}>
                        + Añadir otra deducción
                    </button>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="button-cancel">Cancelar</button>
                    <button onClick={handleSave} className="button-save">Guardar Regla</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
