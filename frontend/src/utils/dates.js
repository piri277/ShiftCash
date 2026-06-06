/**
 * Habia un error con las fechas donde usaba el UTC
 * Ahora lo haré para que parsee y formatee usando la hora local, para evitar confusiones con zonas horarias
 *
 * @param {string} str  - Fecha en formato "YYYY-MM-DD" (o con hora, se ignora el resto)
 * @returns {Date}      - Date a medianoche en hora local
 */
export function parsearFechaLocal(str) {
  const [y, m, d] = str.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Devuelve "YYYY-MM-DD" de una Date en hora local.
 * Alternativa segura a fecha.toISOString().slice(0,10), que usa UTC.
 *
 * @param {Date} fecha
 * @returns {string}
 */
export function fechaAString(fecha) {
  return fecha.toLocaleDateString('en-CA'); // 'en-CA' produce "YYYY-MM-DD"
}