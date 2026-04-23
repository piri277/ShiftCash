// ─────────────────────────────────────────────────────────────────────────────
// UTILS — Funciones puras, sin efectos secundarios, fáciles de testear
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formatea un número como pesos colombianos.
 * @param {number} numero
 * @returns {string} Ej: "$1.200.000"
 */
export function formatearPesos(numero) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

/**
 * Formatea millones de COP para ejes de gráficas.
 * @param {number} valor
 * @returns {string} Ej: "$1.2M"
 */
export function formatearMillones(valor) {
  return `$${(valor / 1_000_000).toFixed(1)}M`;
}