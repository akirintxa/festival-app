// src/components/festivals/ResultsPanel.jsx
import React, { useState, useEffect } from 'react';
import RankingDisplay from './RankingDisplay';
import VoteAuditModal from '../modals/VoteAuditModal';
import JudgeVoteDetailModal from '../modals/JudgeVoteDetailModal';
import ResultsDisplayModal from '../modals/ResultsDisplayModal';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// --- 👇 1. IMPORTAR LIBRERÍAS PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// --- FIN IMPORTACIONES PDF ---

export default function ResultsPanel({ festival, plantilla, recalcTrigger }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false); // Loading para calcular resultados
  const [missingVotes, setMissingVotes] = useState([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [allVotes, setAllVotes] = useState([]);
  const [allPenalties, setAllPenalties] = useState([]);

  // --- 👇 2. NUEVO ESTADO PARA GENERACIÓN DE PDF ---
  const [pdfLoading, setPdfLoading] = useState(false);
  // --- FIN NUEVO ESTADO ---

  useEffect(() => {
    // Carga inicial de votos y penalizaciones
    const fetchData = async () => {
      const votesQuery = query(collection(db, "evaluaciones"), where("festivalId", "==", festival.id));
      const votesSnap = await getDocs(votesQuery);
      setAllVotes(votesSnap.docs.map(d => d.data()));
      const penaltiesQuery = query(collection(db, "penalizacionesAplicadas"), where("festivalId", "==", festival.id));
      const penaltiesSnap = await getDocs(penaltiesQuery);
      setAllPenalties(penaltiesSnap.docs.map(d => d.data()));
    };
    if(festival.id) {
      fetchData();
    }
  }, [festival.id]);

  // Función para calcular resultados (sin cambios en la lógica interna)
  const handleGenerateResults = async () => {
    setLoading(true);
    setResults(null);
    setMissingVotes([]);
    try {
      const { colegios } = festival;
      // ... (Auditoría de votos) ...
      // ... (Optimización de votos) ...
      const votesBySchoolAndCriterion = new Map();
      allVotes.forEach(vote => {
        if (!votesBySchoolAndCriterion.has(vote.schoolId)) {
            votesBySchoolAndCriterion.set(vote.schoolId, new Map());
        }
        const schoolMap = votesBySchoolAndCriterion.get(vote.schoolId);
        Object.entries(vote.puntuaciones).forEach(([critId, score]) => {
            if (!schoolMap.has(critId)) schoolMap.set(critId, []);
            schoolMap.get(critId).push(Number(score));
        });
      });

      // ... (Cálculo de puntajes) ...
      const finalScoresGenerales = [];
      const puntajesAbsolutosPorSubcategoria = [];
      const puntajesNetosPorCategoria = [];
      const puntajesPonderadosPorCategoria = [];

      for (const colegio of colegios) {
        let puntajeGeneralDelColegio = 0;
        let colegioNetoCat = { colegioNombre: colegio.nombre };
        let colegioPonderadoCat = { colegioNombre: colegio.nombre };
        const penaltiesForSchool = allPenalties.filter(p => p.colegioId === colegio.id);

        for (const categoria of plantilla.categorias) {
          let puntajeAbsolutoCategoria = 0;
          for (const subcategoria of categoria.subcategorias) {
            let puntajeAbsolutoSubcategoria = 0;
            for (const criterio of subcategoria.criterios) {
              const votosParaEsteCriterio = votesBySchoolAndCriterion.get(colegio.id)?.get(criterio.id) || [];
              let promedioCriterio = 0;
              if (votosParaEsteCriterio.length > 0) {
                promedioCriterio = votosParaEsteCriterio.reduce((a, b) => a + b, 0) / votosParaEsteCriterio.length;
              }
              puntajeAbsolutoSubcategoria += promedioCriterio;
            }
            puntajesAbsolutosPorSubcategoria.push({ nombre: colegio.nombre, puntaje: puntajeAbsolutoSubcategoria, subcategoria: subcategoria.nombre });
            if (categoria.nombre === 'Música') {
              puntajeAbsolutoCategoria += puntajeAbsolutoSubcategoria;
            } else {
              puntajeAbsolutoCategoria += puntajeAbsolutoSubcategoria * (subcategoria.peso / 100);
            }
          }
          let deduccionTotalCategoria = 0;
          penaltiesForSchool.forEach(penalty => {
            penalty.deducciones.forEach(deduccion => {
              if (deduccion.categoriaId === categoria.id) {
                deduccionTotalCategoria += deduccion.puntos;
              }
            });
          });
          const puntajeNetoConPenalizacion = puntajeAbsolutoCategoria + deduccionTotalCategoria;
          colegioNetoCat[categoria.nombre] = puntajeNetoConPenalizacion;
          const puntajePonderadoCategoria = puntajeNetoConPenalizacion * (categoria.peso / 100);
          puntajeGeneralDelColegio += puntajePonderadoCategoria;
          colegioPonderadoCat[categoria.nombre] = puntajePonderadoCategoria;
        }
        finalScoresGenerales.push({ nombre: colegio.nombre, puntaje: puntajeGeneralDelColegio });
        puntajesNetosPorCategoria.push(colegioNetoCat);
        puntajesPonderadosPorCategoria.push(colegioPonderadoCat);
      }
      const rankingsSubcategorias = [];
      const subcatNombres = [...new Set(puntajesAbsolutosPorSubcategoria.map(p => p.subcategoria))];
      for (const nombreSub of subcatNombres) {
        const scores = puntajesAbsolutosPorSubcategoria.filter(p => p.subcategoria === nombreSub);
        rankingsSubcategorias.push({ titulo: nombreSub, scores: scores });
      }

      setResults({
        general: finalScoresGenerales,
        subcategorias: rankingsSubcategorias,
        netoCategorias: puntajesNetosPorCategoria,
        ponderadoCategorias: puntajesPonderadosPorCategoria,
        categoriasPlantilla: plantilla.categorias,
        allPenalties: allPenalties // Asegúrate de incluir las penalizaciones
      });
      setIsResultsModalOpen(true);
    } catch (error) {
      console.error("Error al generar resultados:", error);
      alert("Error al generar resultados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para recargar datos de penalizaciones (sin cambios)
  useEffect(() => {
    if (recalcTrigger > 0) {
      console.log("Detectado cambio en penalizaciones, recargando datos en segundo plano...");
      const reloadPenalties = async () => {
          const penaltiesQuery = query(collection(db, "penalizacionesAplicadas"), where("festivalId", "==", festival.id));
          const penaltiesSnap = await getDocs(penaltiesQuery);
          setAllPenalties(penaltiesSnap.docs.map(d => d.data()));
          if (results) {
            setResults(null); // Borra resultados viejos
            alert("Penalización aplicada. Los datos se han refrescado. \nPresiona 'Resultados Generales' para recalcular.");
          }
      }
      reloadPenalties();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalcTrigger]);

  // --- 👇 3. FUNCIONES PARA GENERAR PDFs ---

  const handleDownloadGeneralPDF = () => {
    if (!results) return;
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Resultados Generales - ${festival.nombre}`, 14, 20);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Fecha: ${new Date(festival.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}`, 14, 28);
      let startY = 40;
      doc.setFontSize(14);
      doc.text("Ganadores Generales (Top 3)", 14, startY);
      startY += 6;
      const generalHead = [['Pos.', 'Colegio', 'Puntaje Final']];
      const generalBody = results.general
        .sort((a, b) => b.puntaje - a.puntaje)
        .slice(0, 3)
        .map((item, index) => [`${index + 1}º`, item.nombre, item.puntaje.toFixed(2) + ' pts']);
      autoTable(doc, { startY: startY, head: generalHead, body: generalBody, theme: 'grid', headStyles: { fillColor: [0, 122, 255] }});
      startY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Ganadores por Subcategoría (Top 3)", 14, startY);
      startY += 10;
      results.subcategorias.forEach((subcat) => {
        if (startY > 260) { doc.addPage(); startY = 20; }
        doc.setFontSize(12);
        doc.text(subcat.titulo, 14, startY);
        startY += 6;
        const subcatHead = [['Pos.', 'Colegio', 'Puntaje Absoluto']];
        const subcatBody = subcat.scores
          .sort((a, b) => b.puntaje - a.puntaje)
          .slice(0, 3)
          .map((item, i) => [`${i + 1}º`, item.nombre, item.puntaje.toFixed(2) + ' pts']);
        autoTable(doc, { startY: startY, head: subcatHead, body: subcatBody, theme: 'striped', headStyles: { fillColor: [88, 86, 214] }, margin: { left: 14, right: 14 }});
        startY = doc.lastAutoTable.finalY + 10;
      });
      doc.save(`Resultados_Generales_${festival.nombre}.pdf`);
    } catch (error) { console.error("Error generando PDF general:", error); alert("Hubo un error al generar el PDF."); }
    finally { setPdfLoading(false); }
  };

  const handleDownloadMatrixPDF = () => {
    if (!results) return;
    setPdfLoading(true);
    try {
        const doc = new jsPDF('landscape'); // Orientación horizontal para tablas anchas
        doc.setFontSize(16);
        doc.text(`Matriz de Puntos - ${festival.nombre}`, 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date(festival.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}`, 14, 22);

        let startY = 30;

        // Tabla 1: Netos
        doc.setFontSize(12);
        doc.text("Puntajes Netos por Categoría (incluye penalizaciones)", 14, startY);
        startY += 6;
        const netoHead = [['Colegio', ...results.categoriasPlantilla.map(cat => `${cat.nombre} (Neto)`)]];
        const netoBody = results.netoCategorias.map(colegio => [
            colegio.colegioNombre,
            ...results.categoriasPlantilla.map(cat => {
                const score = colegio[cat.nombre]?.toFixed(2) ?? '0.00';
                // Encuentra penalización (simplificado, asume que allPenalties está en results)
                let penaltyVal = 0;
                results.allPenalties?.forEach(p => {
                    if (p.colegioNombre === colegio.colegioNombre) {
                        p.deducciones.forEach(d => {
                            if (d.categoriaId === cat.id) penaltyVal += d.puntos;
                        });
                    }
                });
                return penaltyVal !== 0 ? `${score} (${penaltyVal})` : score;
            })
        ]);
        autoTable(doc, { startY: startY, head: netoHead, body: netoBody, theme: 'grid', headStyles: { fillColor: [255, 149, 0] } }); // Naranja
        startY = doc.lastAutoTable.finalY + 10;

        // Tabla 2: Ponderados
        if (startY > 180) { doc.addPage(); startY = 20; } // Salto de página si es necesario
        doc.setFontSize(12);
        doc.text("Puntajes Ponderados por Categoría y Total General", 14, startY);
        startY += 6;
        const pondHead = [['Colegio', ...results.categoriasPlantilla.map(cat => `${cat.nombre} (${cat.peso}%)`), 'Total']];
        const pondBody = results.ponderadoCategorias.map(colegio => {
            const total = results.categoriasPlantilla.reduce((sum, cat) => sum + (colegio[cat.nombre] || 0), 0);
            return [
                colegio.colegioNombre,
                ...results.categoriasPlantilla.map(cat => colegio[cat.nombre]?.toFixed(2) ?? '0.00'),
                total.toFixed(2)
            ];
        });
        autoTable(doc, { startY: startY, head: pondHead, body: pondBody, theme: 'grid', headStyles: { fillColor: [0, 122, 255] } }); // Azul

        doc.save(`Matriz_Puntos_${festival.nombre}.pdf`);

    } catch(error) { console.error("Error generando PDF matriz:", error); alert("Hubo un error al generar el PDF."); }
    finally { setPdfLoading(false); }
  };

  const handleDownloadVotesPDF = () => {
    if (allVotes.length === 0) return;
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Detalle de Votos por Juez - ${festival.nombre}`, 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha: ${new Date(festival.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}`, 14, 22);
      
      let startY = 30;

      // Agrupar votos por colegio
      const votesBySchool = allVotes.reduce((acc, vote) => {
        if (!acc[vote.schoolName]) acc[vote.schoolName] = [];
        acc[vote.schoolName].push(vote);
        return acc;
      }, {});

      // Mapa para nombres de criterios
      const criteriaMap = new Map();
      plantilla.categorias.forEach(c => c.subcategorias.forEach(s => s.criterios.forEach(cr => criteriaMap.set(cr.id, cr.nombre))));
      // Mapa para nombres de jueces
      const judgesMap = new Map(festival.juecesAsignadosData.map(j => [j.juezId, j.nombre]));

      Object.entries(votesBySchool).sort((a,b) => a[0].localeCompare(b[0])).forEach(([schoolName, schoolVotes]) => {
          if (startY > 250) { doc.addPage(); startY = 20; } // Salto de página antes de cada colegio si es necesario
          doc.setFontSize(14);
          doc.text(`Colegio: ${schoolName}`, 14, startY);
          startY += 8;

          schoolVotes.sort((a,b)=>(judgesMap.get(a.juezId) || '').localeCompare(judgesMap.get(b.juezId) || '')).forEach(vote => {
              if (startY > 260) { doc.addPage(); startY = 20; } // Salto si un juez no cabe
              doc.setFontSize(12);
              doc.setTextColor(0);
              doc.text(`Juez: ${judgesMap.get(vote.juezId) || 'ID Desconocido'} - Total: ${vote.totalScore} pts`, 14, startY);
              startY += 6;
              
              const voteHead = [['Criterio', 'Puntaje']];
              const voteBody = Object.entries(vote.puntuaciones)
                  .sort((a,b) => (criteriaMap.get(a[0]) || '').localeCompare(criteriaMap.get(b[0]) || ''))
                  .map(([critId, score]) => [
                      criteriaMap.get(critId) || `ID: ${critId}`,
                      `${score ?? 0} pts`
                  ]);

              autoTable(doc, {
                  startY: startY,
                  head: voteHead,
                  body: voteBody,
                  theme: 'plain', // Sin bordes
                  headStyles: { fontStyle: 'bold', fillColor: false, textColor: 0 },
                  columnStyles: { 1: { halign: 'right' } }, // Alinear puntajes a la derecha
                  margin: { left: 14, right: 14 }
              });
              startY = doc.lastAutoTable.finalY + 8; // Espacio entre jueces
          });
          startY += 5; // Espacio extra entre colegios
      });

      doc.save(`Detalle_Votos_${festival.nombre}.pdf`);

    } catch(error) { console.error("Error generando PDF votos:", error); alert("Hubo un error al generar el PDF."); }
    finally { setPdfLoading(false); }
  };

  // --- FIN FUNCIONES PDF ---

  return (
    <div className="results-panel-container">
      <h3>Resultados del Festival</h3>
      <p>Presiona el botón para auditar y calcular los puntajes finales.</p>

      {/* --- 👇 NEW STRUCTURE: Container for Action Groups 👇 --- */}
      <div className="results-actions-container">

        {/* --- Group 1: General Results --- */}
        <div className="action-group">
          <button
            onClick={handleGenerateResults}
            disabled={loading || pdfLoading}
            className="generate-results-button"
          >
            {loading ? "Calculando..." : "Resultados Generales"}
          </button>
          {festival.estatus === 'finalizado' && (
            <button
              onClick={handleDownloadGeneralPDF}
              disabled={pdfLoading || !results}
              className="pdf-download-button" // Using a common class now
            >
              {pdfLoading ? 'Generando...' : 'Descargar PDF'}
            </button>
          )}
        </div>

        {/* --- Group 2: Matrix --- */}
        <div className="action-group">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="audit-button"
            disabled={loading || pdfLoading || !results}
          >
            Matriz de puntos
          </button>
          {festival.estatus === 'finalizado' && (
            <button
              onClick={handleDownloadMatrixPDF}
              disabled={pdfLoading || !results}
              className="pdf-download-button" // Using a common class now
            >
              {pdfLoading ? 'Generando...' : 'Descargar PDF'}
            </button>
          )}
        </div>

        {/* --- Group 3: Votes per Judge --- */}
        <div className="action-group">
          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="audit-button"
            disabled={loading || pdfLoading || allVotes.length === 0}
          >
            Votos por Juez
          </button>
          {festival.estatus === 'finalizado' && (
            <button
              onClick={handleDownloadVotesPDF}
              disabled={pdfLoading || allVotes.length === 0}
              className="pdf-download-button" // Using a common class now
            >
              {pdfLoading ? 'Generando...' : 'Descargar PDF'}
            </button>
          )}
        </div>

      </div>
      {/* --- END NEW STRUCTURE --- */}


      {/* Warning message (no changes) */}
      {missingVotes.length > 0 && (
        <div className="missing-votes-warning">
          <strong>¡Atención!</strong> Faltan evaluaciones: {/* Simplificado */}
          <ul>{/* ... */}</ul>
        </div>
      )}

      {/* Modals (no changes) */}
      {isResultsModalOpen && results && (
        <ResultsDisplayModal results={results} onClose={() => setIsResultsModalOpen(false)} />
      )}
      {isAuditModalOpen && (
        <VoteAuditModal results={results} onClose={() => setIsAuditModalOpen(false)} />
      )}
      {isDetailModalOpen && (
        <JudgeVoteDetailModal festival={festival} plantilla={plantilla} allVotes={allVotes} onClose={() => setIsDetailModalOpen(false)} />
      )}
    </div>
  );
}