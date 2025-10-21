// src/components/modals/VoteAuditModal.jsx
import React from 'react';
import './Modal.css'; // 👈 1. Importar el CSS del Modal

export default function VoteAuditModal({ results, onClose }) {
  if (!results) return null;

  const {
    netoCategorias,
    ponderadoCategorias,
    categoriasPlantilla,
    allPenalties
  } = results;

  // Función para encontrar el total de penalización por colegio y categoría
  const getPenalty = (colegioNombre, categoriaId) => {
    let totalPenalty = 0;
    const penaltiesForSchool = allPenalties.filter(p => p.colegioNombre === colegioNombre);
    for (const penalty of penaltiesForSchool) {
      for (const deduccion of penalty.deducciones) {
        if (deduccion.categoriaId === categoriaId) {
          totalPenalty += deduccion.puntos;
        }
      }
    }
    return totalPenalty;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* 2. Añadir la clase 'large' */}
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Matriz de Puntos de Auditoría</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">

          {/* --- MATRIZ 1: PUNTAJES NETOS (CON PENALIZACIONES) --- */}
          <h4>Puntajes Netos por Categoría (con penalizaciones)</h4>
          <div className="audit-table-container">
            <table className="audit-matrix-table">
              <thead>
                <tr>
                  <th>Colegio</th>
                  {categoriasPlantilla.map(cat => (
                    <th key={cat.id}>{cat.nombre} (Neto)</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {netoCategorias.map(colegio => (
                  <tr key={colegio.colegioNombre}>
                    <td>{colegio.colegioNombre}</td>
                    {categoriasPlantilla.map(cat => (
                      <td key={cat.id}>
                        {colegio[cat.nombre]?.toFixed(2) ?? '0.00'} pts
                        {/* Mostramos la penalización si existe */}
                        {getPenalty(colegio.colegioNombre, cat.id) !== 0 && (
                          <span className="penalty-amount">
                            ({getPenalty(colegio.colegioNombre, cat.id)} pts)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- MATRIZ 2: PUNTAJES PONDERADOS (PUNTAJE FINAL) --- */}
          <h4 className="table-spacer">Puntajes Ponderados (Base para el Ranking General)</h4>
          <div className="audit-table-container">
            <table className="audit-matrix-table">
              <thead>
                <tr>
                  <th>Colegio</th>
                  {categoriasPlantilla.map(cat => (
                    <th key={cat.id}>{cat.nombre} (Pond. {cat.peso}%)</th>
                  ))}
                  <th>Total General</th>
                </tr>
              </thead>
              <tbody>
                {ponderadoCategorias.map(colegio => {
                  // Calculamos el total sumando los puntajes ponderados
                  const totalGeneral = categoriasPlantilla.reduce((sum, cat) => {
                    return sum + (colegio[cat.nombre] || 0);
                  }, 0);
                  
                  return (
                    <tr key={colegio.colegioNombre}>
                      <td>{colegio.colegioNombre}</td>
                      {categoriasPlantilla.map(cat => (
                        <td key={cat.id}>
                          {colegio[cat.nombre]?.toFixed(2) ?? '0.00'} pts
                        </td>
                      ))}
                      <td className="total-cell">{totalGeneral.toFixed(2)} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}