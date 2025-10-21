// src/components/festivals/ManagePenalties.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import './ManagePenalties.css';

// Recibe la nueva prop onPenaltiesChanged
export default function ManagePenalties({ festival, colegios, onPenaltiesChanged }) {
  const [loading, setLoading] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [aplicadas, setAplicadas] = useState([]);

  const [selectedColegioId, setSelectedColegioId] = useState('');
  const [selectedPlantillaId, setSelectedPlantillaId] = useState('');

  // Carga ambas listas (la biblioteca y las ya aplicadas)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        // 1. Cargar la biblioteca de plantillas
        const plantillasSnap = await getDocs(collection(db, "plantillasPenalizacion"));
        setPlantillas(plantillasSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // 2. Cargar las penalizaciones ya aplicadas a ESTE festival
        const aplicadasQuery = query(collection(db, "penalizacionesAplicadas"), where("festivalId", "==", festival.id));
        const aplicadasSnap = await getDocs(aplicadasQuery);
        setAplicadas(aplicadasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
        console.error("Error cargando datos de penalizaciones:", error);
    } finally {
        setLoading(false);
    }
  }, [festival.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Ahora depende de fetchData, que a su vez depende de festival.id

  const formatDeducciones = (deducciones) => {
    if (!deducciones) return 'N/A';
    return deducciones.map(d => `${d.puntos} pts a ${d.categoriaNombre}`).join(', ');
  };

  const handleAplicarPenalizacion = async () => {
    if (!selectedColegioId || !selectedPlantillaId) {
      alert("Por favor, selecciona un colegio y una penalización.");
      return;
    }
    setLoading(true);
    
    const colegio = colegios.find(c => c.id === selectedColegioId);
    const plantilla = plantillas.find(p => p.id === selectedPlantillaId);

    try {
      await addDoc(collection(db, "penalizacionesAplicadas"), {
        festivalId: festival.id,
        colegioId: colegio.id,
        colegioNombre: colegio.nombre,
        nombrePenalizacion: plantilla.nombre,
        deducciones: plantilla.deducciones // Copia el array con {categoriaId, categoriaNombre, puntos}
      });
      
      setSelectedColegioId('');
      setSelectedPlantillaId('');
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
      <p>Aplica deducciones a los colegios. Esto afectará el puntaje final.</p>

      <div className="penalty-content">
        <div className="penalty-apply">
          <h4>Aplicar Penalización</h4>
          <div className="form-group">
            <label>Selecciona el Colegio:</label>
            <select value={selectedColegioId} onChange={(e) => setSelectedColegioId(e.target.value)} disabled={loading}>
              <option value="">-- Colegio --</option>
              {colegios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Selecciona la Penalización:</label>
            <select value={selectedPlantillaId} onChange={(e) => setSelectedPlantillaId(e.target.value)} disabled={loading}>
              <option value="">-- Penalización --</option>
              {plantillas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({formatDeducciones(p.deducciones)})</option>
              ))}
            </select>
          </div>
          <button onClick={handleAplicarPenalizacion} disabled={loading} className="apply-penalty-button">
            {loading ? "Aplicando..." : "Aplicar"}
          </button>
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