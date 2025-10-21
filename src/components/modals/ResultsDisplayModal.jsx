// src/components/modals/ResultsDisplayModal.jsx
import React from 'react';
import RankingDisplay from '../festivals/RankingDisplay';
import './Modal.css'; // 👈 Importamos el nuevo CSS de modales

export default function ResultsDisplayModal({ results, onClose }) {
  if (!results) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Usamos 'large' para que este modal sea más ancho */}
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Resultados Generales</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="results-display-modal-content">
            <RankingDisplay title="Ganadores Generales" scores={results.general} />
            <div className="subcategory-rankings-modal">
              {results.subcategorias.map(subcat => (
                <RankingDisplay key={subcat.titulo} title={subcat.titulo} scores={subcat.scores} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}