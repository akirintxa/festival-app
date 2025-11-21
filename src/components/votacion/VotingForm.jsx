// src/components/votacion/VotingForm.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './VotingForm.css';

export default function VotingForm({ festival, school, onVoteSaved, onClose }) {
  const { currentUser } = useAuth();
  const [formTemplate, setFormTemplate] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);

  const isReadOnly = festival.estatus !== 'activo';
  const evaluationId = `${festival.id}_${school.id}_${currentUser.uid}`;

  useEffect(() => {
    const loadForm = async () => {
      if (!festival || !currentUser) return;
      setLoading(true);

      try {
        const voteDocRef = doc(db, 'evaluaciones', evaluationId);
        const voteSnap = await getDoc(voteDocRef);
        let loadedScores = {};
        if (voteSnap.exists()) {
          const voteData = voteSnap.data();
          loadedScores = voteData.puntuaciones || {};
          setComments(voteData.comentarios || '');
        }

        const judgeData = festival.juecesAsignadosData.find(j => j.juezId === currentUser.uid);
        if (!judgeData) {
          console.error("Juez no encontrado"); setLoading(false); return;
        }
        const assignedSubcatIds = judgeData.subcategoriasAsignadasIds || [];

        const templateId = festival.plantillaId || "v1"; // Fallback para compatibilidad
        const templateSnap = await getDoc(doc(db, "plantillaEvaluacion", templateId));
        if (!templateSnap.exists()) {
          console.error("Plantilla no encontrada"); setLoading(false); return;
        }
        const masterTemplate = templateSnap.data();

        const filteredTemplate = masterTemplate.categorias.map(cat => {
          const relevantSubcats = cat.subcategorias.filter(subcat =>
            assignedSubcatIds.includes(subcat.id)
          );
          return { ...cat, subcategorias: relevantSubcats };
        }).filter(cat => cat.subcategorias.length > 0);

        setFormTemplate(filteredTemplate);

        const relevantCriteria = filteredTemplate.flatMap(c => c.subcategorias).flatMap(sc => sc.criterios).map(crit => crit.id);
        const cleanScores = {};
        for (const critId of relevantCriteria) {
          // Si el score guardado es null, se queda como null (vacío)
          if (loadedScores[critId] !== undefined) {
            cleanScores[critId] = loadedScores[critId];
          }
        }
        setScores(cleanScores);

      } catch (error) {
        console.error("Error cargando el formulario:", error);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [festival, school, currentUser, evaluationId]);

  // --- CAMBIO 1: Manejar el input vacío ---
  const handleScoreChange = (criterionId, score, maxScore) => {
    // 'score' es el valor de texto del input
    if (score === '') {
      // Si el usuario borra el número, guardamos 'null'
      setScores(prev => ({
        ...prev,
        [criterionId]: null,
      }));
      return;
    }

    let numScore = Number(score);
    if (numScore > maxScore) numScore = maxScore;
    if (numScore < 0) numScore = 0;

    setScores(prev => ({
      ...prev,
      [criterionId]: numScore,
    }));
  };
  // --- FIN CAMBIO 1 ---

  const calculateSubcategoryTotal = (subcategory) => {
    return subcategory.criterios.reduce((total, criterion) => {
      // (scores[criterion.id] || 0) funciona bien con 0, null, y undefined
      return total + (scores[criterion.id] || 0);
    }, 0);
  };

  const handleSaveVote = async () => {
    try {
      const totalScore = Object.values(scores).reduce((acc, score) => acc + (Number(score) || 0), 0);
      const allCriteria = formTemplate.flatMap(cat => cat.subcategorias.flatMap(sub => sub.criterios));

      // --- CAMBIO 2: Chequear por 'null' o 'undefined' ---
      // Un criterio está "completo" solo si NO es null Y NO es undefined
      const isComplete = allCriteria.every(criterion =>
        scores[criterion.id] != null // (esto chequea ambos, null y undefined)
      );
      // --- FIN CAMBIO 2 ---

      const voteDocRef = doc(db, 'evaluaciones', evaluationId);
      const evaluationData = {
        festivalId: festival.id,
        schoolId: school.id,
        schoolName: school.nombre,
        juezId: currentUser.uid,
        puntuaciones: scores,
        comentarios: comments,
        totalScore: totalScore,
        isComplete: isComplete, // Guardamos el estado correcto
        fechaEvaluacion: new Date()
      };

      await setDoc(voteDocRef, evaluationData, { merge: true });
      alert('¡Evaluación guardada con éxito!');
      onVoteSaved(school.id, totalScore, isComplete);
    } catch (error) {
      console.error("Error al guardar la evaluación:", error);
      alert('Error al guardar.');
    }
  };

  if (loading) return <p>Cargando formulario...</p>;
  if (formTemplate.length === 0) return <p>No tienes subcategorías asignadas para este festival.</p>;

  return (
    <div className="voting-form">
      <div className="voting-form-header-mobile">
        <h3>Evaluación</h3>
        <button onClick={onClose} className="close-icon-button">✕</button>
      </div>
      {formTemplate.map(category => (
        <fieldset key={category.id} className="form-category-group" disabled={isReadOnly}>
          <legend>{category.nombre}</legend>
          {category.subcategorias.map(subcat => (
            <div key={subcat.id} className="form-subcategory-group">
              <h4>{subcat.nombre} (Total: {calculateSubcategoryTotal(subcat)} pts)</h4>
              {subcat.criterios.map(criterion => (
                <div key={criterion.id} className="criterion-input">
                  <label htmlFor={criterion.id}>{criterion.nombre}</label>

                  <div className="score-input-group">
                    <input
                      type="number"
                      id={criterion.id}
                      // --- CAMBIO 3: Usar '??' para mostrar '0' pero no 'null' ---
                      value={scores[criterion.id] ?? ''}
                      max={criterion.puntajeMaximo}
                      min="0"
                      onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.puntajeMaximo)}
                      readOnly={isReadOnly}
                    />
                    <span> / {criterion.puntajeMaximo} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </fieldset>
      ))}

      <fieldset className="form-comments-group" disabled={isReadOnly}>
        <label htmlFor="comments">Comentarios Generales (opcional):</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows="4"
          placeholder="Anotaciones sobre la presentación, vestuario, etc."
          readOnly={isReadOnly}
        />
      </fieldset>

      {!isReadOnly && (
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="close-vote-button"
          >
            Cerrar
          </button>

          <button onClick={handleSaveVote} className="save-vote-button">
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}