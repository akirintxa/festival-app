// src/components/festivals/RankingDisplay.jsx
import React from 'react';
import './RankingDisplay.css'; // Crearemos este archivo

export default function RankingDisplay({ title, scores }) {
  // Ordenamos de mayor a menor y tomamos los 3 primeros
  const top3 = scores.sort((a, b) => b.puntaje - a.puntaje).slice(0, 3);

  return (
    <div className="ranking-container">
      <h4>{title}</h4>
      <ol className="ranking-list">
        {top3.map((item, index) => (
            <li key={index}>
            {/* 👇 AÑADIMOS ESTE SPAN 👇 */}
            <span className={`ranking-position ranking-${index + 1}`}>
                {index + 1}º
            </span>
            <span className="ranking-name">{item.nombre}</span>
            <span className="ranking-score">{item.puntaje.toFixed(2)} pts</span>
            </li>
        ))}
      </ol>
    </div>
  );
}