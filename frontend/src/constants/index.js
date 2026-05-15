
export const PRESUPUESTO_LIMITE = 900_000; // COP

export const MENU_ITEMS = [
  { key: "resumen",       etiqueta: "Resumen",       icono: "📊" },
  { key: "historial",     etiqueta: "Historial",     icono: "📋" },
  { key: "graficas",      etiqueta: "Gráficas",      icono: "📈" },
  { key: 'categorias',    etiqueta: 'Categorías',    icono: '🗂️' },
  { key: "configuracion", etiqueta: "Configuración", icono: "⚙️" }
];

<<<<<<< HEAD
// Obtener la fecha actual
const fechaActual = new Date();

// Formatear: "Mayo 2026"
// 'es-ES' asegura que sea en español, 'long' para el nombre completo del mes
const mesNombre = fechaActual.toLocaleDateString('es-ES', { month: 'long' });
const anio = fechaActual.getFullYear();

// Capitalizar la primera letra (opcional, ya que JS a veces lo da en minúsculas)
const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);

export const MES_ACTIVO = `${mesCapitalizado} ${anio}`;
=======
export const MES_ACTIVO = "Mayo 2026";
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
