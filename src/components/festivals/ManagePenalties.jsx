// src/components/festivals/ManagePenalties.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import './ManagePenalties.css';

export default function ManagePenalties({ festival, colegios, onPenaltiesChanged }) {
  const [loading, setLoading] = useState(false);
  const [plantillaPenalties, setPlantillaPenalties] = useState([]); // Penalizaciones definidas en la plantilla
  const [aplicadas, setAplicadas] = useState([]);

  const [selectedColegioId, setSelectedColegioId] = useState('');
  const [selectedPenaltyIndex, setSelectedPenaltyIndex] = useState('');

  // Carga las penalizaciones aplicadas y las definiciones de la plantilla
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar la plantilla asociada al festival para obtener sus reglas de penalización
      if (festival.plantillaId) {
        const plantillaSnap = await getDoc(doc(db, "plantillaEvaluacion", festival.plantillaId));
        if (plantillaSnap.exists()) {
          const data = plantillaSnap.data();
          setPlantillaPenalties(data.penalizaciones || []);
        }
      }

      // 2. Cargar las penalizaciones ya aplicadas a ESTE festival
      const aplicadasQuery = query(collection(db, "penalizacionesAplicadas"), where("festivalId", "==", festival.id));
      const aplicadasSnap = await getDocs(aplicadasQuery);
      setAplicadas(aplicadasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error cargando datos de penalizaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [festival.id, festival.plantillaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDeducciones = (deducciones) => {
    if (!deducciones) return 'N/A';
    return deducciones.map(d => `${d.puntos} pts a ${d.categoriaNombre}`).join(', ');
  };

  const handleAplicarPenalizacion = async () => {
    if (!selectedColegioId || selectedPenaltyIndex === '') {
      alert("Por favor, selecciona un colegio y una penalización.");
      return;
    }
    setLoading(true);

    const colegio = colegios.find(c => c.id === selectedColegioId);
    const penaltyRule = plantillaPenalties[selectedPenaltyIndex];

    try {
      await addDoc(collection(db, "penalizacionesAplicadas"), {
        festivalId: festival.id,
        colegioId: colegio.id,
        colegioNombre: colegio.nombre,
        nombrePenalizacion: penaltyRule.nombre,
        deducciones: penaltyRule.deducciones // Copia el array con {categoriaId, categoriaNombre, puntos}
      });

      setSelectedColegioId('');
      setSelectedPenaltyIndex('');
      await fetchData(); // Espera a que se recarguen las penalizaciones
      onPenaltiesChanged(); // Llama a la función del padre para avisar del cambio
    } catch (error) {
      console.error("Error al aplicar penalización: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuitarPenalizacion = async (penalizacionId) => {
    if (window.confirm("¿Seguro que quieres quitar esta penalización?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "penalizacionesAplicadas", penalizacionId));
        await fetchData(); // Espera a que se recarguen las penalizaciones
        onPenaltiesChanged(); // Llama a la función del padre para avisar del cambio
      } catch (error) {
        console.error("Error al quitar penalización: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="manage-penalties-container">
      <h3>Gestión de Penalizaciones</h3>
      <p>Aplica deducciones a los colegios basadas en las reglas de la plantilla <strong>{festival.plantillaNombre}</strong>.</p>

      <div className="penalty-content">
        <div className="penalty-apply">
          <h4>Aplicar Penalización</h4>

          {plantillaPenalties.length === 0 ? (
            <div className="alert alert-warning">
              Esta plantilla no tiene reglas de penalización definidas. Ve a "Gestionar Plantillas" para añadirlas.
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Selecciona el Colegio:</label>
                <select value={selectedColegioId} onChange={(e) => setSelectedColegioId(e.target.value)} disabled={loading}>
                  <option value="">-- Colegio --</option>
                  {colegios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Selecciona la Penalización:</label>
                <select value={selectedPenaltyIndex} onChange={(e) => setSelectedPenaltyIndex(e.target.value)} disabled={loading}>
                  <option value="">-- Penalización --</option>
                  {plantillaPenalties.map((p, index) => (
                    <option key={index} value={index}>{p.nombre} ({formatDeducciones(p.deducciones)})</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAplicarPenalizacion} disabled={loading} className="apply-penalty-button">
                {loading ? "Aplicando..." : "Aplicar"}
              </button>
            </>
          )}
        </div>

        <div className="penalty-log">
          <h4>Penalizaciones Aplicadas</h4>
          {loading ? <p>Cargando...</p> : (
            aplicadas.length === 0 ? (
              <p>Aún no se han aplicado penalizaciones.</p>
            ) : (
              <ul className="penalty-list">
                {aplicadas.map(p => (
                  <li key={p.id}>
                    <span><strong>{p.colegioNombre}</strong>: {p.nombrePenalizacion}</span>
                    <button onClick={() => handleQuitarPenalizacion(p.id)} disabled={loading} className="delete-button-small">Quitar</button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}