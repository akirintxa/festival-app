// src/components/festivals/ManageJudges.jsx
import React from 'react';
import './ManageJudges.css'; // Crearemos este archivo para los estilos

// 👇 Recibimos el nuevo prop 'isLocked'
export default function ManageJudges({ assignedJudges, plantilla, onAssign, onDelete, isLocked }) {
  
  // Función para obtener los nombres de las subcategorías asignadas
  const getSubcategoryNames = (ids) => {
    if (!plantilla || !ids) return 'Cargando...';
    const allSubcats = plantilla.categorias.flatMap(c => c.subcategorias);
    return ids.map(id => {
      const subcat = allSubcats.find(s => s.id === id);
      return subcat ? subcat.nombre : 'ID Desconocido';
    }).join(', ');
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Jueces Asignados</h2>
        <button 
          className="button-primary-simple" 
          onClick={onAssign}
          disabled={isLocked} // 👈 BOTÓN DESHABILITADO
        >
          + Asignar Juez
        </button>
      </div>
      
      {/* Mostramos una advertencia si está bloqueado */}
      {isLocked && (
        <p className="lock-warning">
          La asignación de jueces está bloqueada porque el festival ya no está en estatus "Próximo".
        </p>
      )}
      
      <div className="judge-list">
        {assignedJudges.length > 0 ? (
          assignedJudges.map(juez => (
            <div key={juez.juezId} className="judge-list-item">
              <div className="judge-info">
                <strong>{juez.nombre}</strong>
                <span>({juez.email})</span>
                <p>
                  <strong>Subcategorías:</strong> {getSubcategoryNames(juez.subcategoriasAsignadasIds)}
                </p>
              </div>
              <button 
                className="button-danger-simple" 
                onClick={() => onDelete(juez.juezId)}
                disabled={isLocked} // 👈 BOTÓN DESHABILITADO
              >
                Eliminar
              </button>
            </div>
          ))
        ) : (
          <p>No hay jueces asignados a este festival.</p>
        )}
      </div>
    </div>
  );
}