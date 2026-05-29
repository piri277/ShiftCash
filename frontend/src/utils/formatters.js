
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


export function formatearEjeY(valor) {
  const v = Number(valor);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return v === 0 ? "$0" : formatearPesos(v);
}

/**
 * Formatea número a K (para metas diarias: 14951 -> "15K")
 * @param {number} valor
 * @returns {string}
 */
export function formatearAK(valor) {
  const v = Number(valor);
  if (v >= 1_000_000) {
    return `$${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 1_000) {
    return `$${Math.round(v / 1_000)}K`;
  }
  return `$${v}`;
}