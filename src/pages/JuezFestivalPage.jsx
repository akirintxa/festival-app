// src/pages/JuezFestivalPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import VotingForm from '../components/votacion/VotingForm';
import './JuezFestivalPage.css';

export default function JuezFestivalPage() {
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [judgeVotes, setJudgeVotes] = useState({});
  
  const { festivalId } = useParams();
  const { currentUser, userProfile } = useAuth();
  
  const schoolItemRefs = useRef({});

  useEffect(() => {
    const fetchFestivalAndVotes = async () => {
      if (!festivalId || !currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'festivales', festivalId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFestival({ id: docSnap.id, ...docSnap.data() });
        }

        const votesQuery = query(
          collection(db, 'evaluaciones'),
          where('festivalId', '==', festivalId),
          where('juezId', '==', currentUser.uid)
        );
        const votesSnap = await getDocs(votesQuery);
        const votesMap = {};
        votesSnap.docs.forEach(doc => {
          const data = doc.data();
          // CAMBIO: Guardamos el objeto completo, no solo el puntaje
          votesMap[data.schoolId] = {
            score: data.totalScore,
            isComplete: data.isComplete || false // Si no existe, asume incompleto
          };
        });
        setJudgeVotes(votesMap);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivalAndVotes();
  }, [festivalId, currentUser]);

  const handleSchoolToggle = (schoolId) => {
    const isOpening = activeSchoolId !== schoolId;
    const currentScroll = window.scrollY;

    setActiveSchoolId(isOpening ? schoolId : null);

    if (isOpening) {
      setTimeout(() => {
        const element = schoolItemRefs.current[schoolId];
        if (element) {
          const pageHeader = document.querySelector('.juez-festival-header');
          const headerOffset = pageHeader ? pageHeader.offsetHeight : 60;
          
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset - 10; 

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScroll, behavior: 'auto' });
      });
    }
  };


  const handleVoteSaved = (savedSchoolId, newTotal, isComplete) => {
    setJudgeVotes(prev => ({
      ...prev,
      // CAMBIO: Guardamos el objeto completo
      [savedSchoolId]: {
        score: newTotal,
        isComplete: isComplete
      }
    }));
    // CAMBIO: Cerramos el acordeón automáticamente
    setActiveSchoolId(null);
  };

  if (loading) return <div className="juez-festival-container"><h2>Cargando...</h2></div>;
  if (!festival) return <div className="juez-festival-container"><h2>Festival no encontrado.</h2></div>;

  return (
    <div className="juez-festival-container">
      <div className="juez-header juez-festival-header">
        <div className="header-info">
          <h1>{festival.nombre}</h1>
          <span className="judge-name-display">Juez: {userProfile?.nombre}</span>
          
          <span className={`festival-status status-${festival.estatus}`}>
            {festival.estatus.charAt(0).toUpperCase() + festival.estatus.slice(1)}
          </span>
        </div>
        <Link to="/" className="back-button">← Volver</Link>
      </div>
      
      {festival.estatus !== 'proximo' ? (
        <div className="schools-accordion">
          <h2>Colegios a Evaluar</h2>
          {(festival.colegios && festival.colegios.length > 0) ? (
            festival.colegios.map((school, index) => {
              
              // --- INICIO CAMBIO: Obtener datos de votación ---
              const currentVoteData = judgeVotes[school.id];
              const currentScore = currentVoteData?.score;
              const isEvaluationComplete = currentVoteData?.isComplete;
              // --- FIN CAMBIO ---

              return (
                <div 
                  key={school.id} 
                  className="school-accordion-item"
                  ref={(el) => (schoolItemRefs.current[school.id] = el)}
                >
                  <button
                    className="school-accordion-header"
                    onClick={() => handleSchoolToggle(school.id)}
                  >
                    <span className="school-name-header">
                      {index + 1}. {school.nombre}
                    </span>
                    <div className="school-header-actions">
                      
                      {/* --- INICIO CAMBIO: Aplicar clase CSS --- */}
                      {currentScore !== undefined && (
                        <span className={`school-score-badge ${!isEvaluationComplete ? 'incomplete-score' : ''}`}>
                          {currentScore} pts
                        </span>
                      )}
                      {/* --- FIN CAMBIO --- */}
                      
                      <span>
                        {activeSchoolId === school.id
                          ? 'Cerrar △'
                          : (festival.estatus === 'activo' ? 'Evaluar ▽' : 'Ver ▽')}
                      </span>
                    </div>
                  </button>
                  {activeSchoolId === school.id && (
                    <div className="school-accordion-content">
                      <VotingForm
                        festival={festival}
                        school={school}
                        onVoteSaved={handleVoteSaved}
                        onClose={() => handleSchoolToggle(school.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>Aún no hay colegios inscritos en este festival.</p>
          )}
        </div>
      ) : (
        <div className="voting-closed">
          <h2>Votación no disponible</h2>
          <p>La votación para este festival aún no ha comenzado.</p>
        </div>
      )}
    </div>
  );
}