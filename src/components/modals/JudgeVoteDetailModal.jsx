// src/components/modals/JudgeVoteDetailModal.jsx
import React, { useMemo } from 'react';
import './Modal.css'; // 👈 Importa el CSS general con los nuevos estilos

export default function JudgeVoteDetailModal({ festival, plantilla, allVotes, onClose }) {

  // 1. Crear un mapa para buscar nombres de criterios fácilmente
  const criteriaMap = useMemo(() => {
    const map = new Map();
    if (plantilla && plantilla.categorias) {
      plantilla.categorias.forEach(cat => {
        cat.subcategorias.forEach(subcat => {
          subcat.criterios.forEach(crit => {
            map.set(crit.id, crit.nombre);
          });
        });
      });
    }
    return map;
  }, [plantilla]);

  // 2. Crear un mapa para buscar nombres de jueces
  const judgesMap = useMemo(() => {
    const map = new Map();
    if (festival && festival.juecesAsignadosData) {
      festival.juecesAsignadosData.forEach(juez => {
        map.set(juez.juezId, juez.nombre);
      });
    }
    return map;
  }, [festival]);

  // 3. Agrupar Votos por Colegio (ya que 'allVotes' es una lista plana)
  const votesBySchool = useMemo(() => {
    const grouped = new Map();
    for (const vote of allVotes) {
      if (!grouped.has(vote.schoolName)) {
        grouped.set(vote.schoolName, []);
      }
      grouped.get(vote.schoolName).push(vote);
    }
    // Ordenar por nombre de colegio
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allVotes]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Usamos 'large' para tener más espacio */}
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalle de Votos por Juez</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          
          {votesBySchool.map(([schoolName, votes]) => (
            <div key={schoolName} className="school-vote-group">
              <h3>Colegio: {schoolName}</h3>
              
              {/* Ordenamos los votos de este colegio por nombre de juez */}
              {votes.sort((a, b) => (judgesMap.get(a.juezId) || '').localeCompare(judgesMap.get(b.juezId) || '')).map(vote => (
                
                // ESTA es la estructura de la captura (un bloque por juez)
                <div key={vote.juezId} className="judge-vote-block">
                  
                  <div className="judge-vote-header">
                    <h3>Juez: {judgesMap.get(vote.juezId) || vote.juezId}</h3>
                    <span className="total-score">Total: {vote.totalScore} pts</span>
                  </div>

                  <div className="judge-vote-criteria-list">
                    {/* Ordenamos los criterios por nombre */}
                    {Object.entries(vote.puntuaciones)
                      .sort((a, b) => (criteriaMap.get(a[0]) || '').localeCompare(criteriaMap.get(b[0]) || ''))
                      .map(([criterionId, score]) => (
                        
                        // ESTA es la fila que tenía el error de alineación
                        <div key={criterionId} className="judge-criterion-item">
                          <span className="criterion-name">
                            {criteriaMap.get(criterionId) || 'Criterio Desconocido'}:
                          </span>
                          <span className="criterion-score">{score ?? 0} pts</span>
                        </div>

                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}