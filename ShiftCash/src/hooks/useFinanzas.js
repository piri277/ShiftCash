import { useMemo } from "react";
import { transacciones } from "../data/mockData";
import { PRESUPUESTO_LIMITE } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// useFinanzas — Toda la lógica de cálculo separada de la UI
//
// Ventajas:
//  · Los componentes solo se encargan de renderizar
//  · Fácil de testear de forma unitaria
//  · Cuando llegue el backend, solo cambia este hook (no los componentes)
// ─────────────────────────────────────────────────────────────────────────────

export function useFinanzas() {
  // useMemo evita recalcular en cada render si transacciones no cambia
  const resumen = useMemo(() => {
    const totalGastado = transacciones
      .filter(t => t.tipo === "gasto")
      .reduce((suma, t) => suma + t.monto, 0);

    const totalGanado = transacciones
      .filter(t => t.tipo === "ingreso")
      .reduce((suma, t) => suma + t.monto, 0);

    const totalAhorrado = totalGanado - totalGastado;

    const porcentajePresupuesto = Math.min(
      100,
      Math.round((totalGastado / PRESUPUESTO_LIMITE) * 100)
    );

    const presupuestoSuperado = totalGastado > PRESUPUESTO_LIMITE;

    return {
      totalGastado,
      totalGanado,
      totalAhorrado,
      porcentajePresupuesto,
      presupuestoSuperado,
      cantidadTransacciones: transacciones.length,
    };
  }, [/* aquí irán las dependencias cuando vengan del backend */]);

  return { resumen, transacciones };
}