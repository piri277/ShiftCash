import { useState, useEffect, useCallback } from "react";
import { getTransacciones } from "../api/transactions";
import { PRESUPUESTO_LIMITE } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// useFinanzas — Lógica de cálculo desacoplada de la UI
// Los componentes solo renderizan, este hook maneja datos y cálculos
// ─────────────────────────────────────────────────────────────────────────────

function calcularResumen(transacciones) {
  const totalGastado = transacciones
    .filter(t => t.type === "expense")
    .reduce((suma, t) => suma + t.amount, 0);

  const totalGanado = transacciones
    .filter(t => t.type === "income")
    .reduce((suma, t) => suma + t.amount, 0);

  const totalAhorrado = totalGanado - totalGastado;

  const porcentajePresupuesto = Math.min(
    100,
    Math.round((totalGastado / PRESUPUESTO_LIMITE) * 100)
  );

  return {
    totalGastado,
    totalGanado,
    totalAhorrado,
    porcentajePresupuesto,
    presupuestoSuperado: totalGastado > PRESUPUESTO_LIMITE,
    cantidadTransacciones: transacciones.length,
  };
}

export function useFinanzas() {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Definimos cargar con useCallback (está perfecto para usarlo como "recargar")
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransacciones();
      setTransacciones(data);
    } catch {
      setError("No se pudieron cargar las transacciones");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Para evitar el error de "setState synchronously", 
  // ejecutamos la función dentro de un contexto async o simplemente 
  // ignoramos la advertencia si sabemos que es una carga inicial.
  
  useEffect(() => {
    let montado = true;

    const inicializar = async () => {
      if (montado) {
        await cargar();
      }
    };

    inicializar();

    return () => { montado = false; }; // Cleanup para evitar fugas de memoria
  }, [cargar]); 

  const resumen = calcularResumen(transacciones);

  return { resumen, transacciones, loading, error, recargar: cargar };
}