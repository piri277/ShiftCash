
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


export function crearFormateadorY(datos) {
  const maximo = Math.max(...datos.map(d =>
    Math.max(d.ingresos ?? 0, d.gastos ?? 0, Math.abs(d.ahorros ?? 0))
  ));

  return (valor) => {
    if (maximo >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
    if (maximo >= 100_000)   return `$${(valor / 1_000).toFixed(0)}K`;
    if (maximo >= 10_000)    return `$${(valor / 1_000).toFixed(1)}K`;
    if (maximo >= 1_000)     return `$${(valor / 1_000).toFixed(1)}K`;
    return valor === 0 ? "$0" : formatearPesos(valor);
  };
}