export const MENU_ITEMS = [
  { key: "resumen",       etiqueta: "Resumen",       icono: "📊" },
  { key: "historial",     etiqueta: "Historial",     icono: "📋" },
  { key: "graficas",      etiqueta: "Gráficas",      icono: "📈" },
  { key: 'categorias',    etiqueta: 'Categorías',    icono: '🗂️' },
  { key: 'presupuestos',  etiqueta: 'Presupuestos',  icono: '💸' },
  { key: 'metas',         etiqueta: 'Metas de Ahorro', icono: '🎯' },
  { key: "configuracion", etiqueta: "Configuración", icono: "⚙️" }
];

// Obtener la fecha actual
const fechaActual = new Date();

// Formatear: "Mayo 2026"
// 'es-ES' asegura que sea en español, 'long' para el nombre completo del mes
const mesNombre = fechaActual.toLocaleDateString('es-ES', { month: 'long' });
const anio = fechaActual.getFullYear();

// Capitalizar la primera letra (opcional, ya que JS a veces lo da en minúsculas)
const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);

export const MES_ACTIVO = `${mesCapitalizado} ${anio}`;
