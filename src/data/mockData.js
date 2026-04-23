// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Reemplazar con llamadas a la API cuando el backend esté listo
// Cada array/objeto refleja la forma exacta que tendrá la respuesta del servidor
// ─────────────────────────────────────────────────────────────────────────────

export const datosAnuales = [
  { mes: "Ene", gastos: 420000,  ingresos: 1200000, ahorros: 780000  },
  { mes: "Feb", gastos: 510000,  ingresos: 1300000, ahorros: 790000  },
  { mes: "Mar", gastos: 380000,  ingresos: 1250000, ahorros: 870000  },
  { mes: "Abr", gastos: 950000,  ingresos: 3850000, ahorros: 2900000 },
];

export const transacciones = [
  { id: 1, tipo: "gasto",   descripcion: "Mercado Éxito",      categoria: "Alimentación",    monto: 87500   },
  { id: 2, tipo: "ingreso", descripcion: "Salario Abril",       categoria: "Sin categoría",   monto: 3200000 },
  { id: 3, tipo: "gasto",   descripcion: "Uber",                categoria: "Transporte",      monto: 14600   },
  { id: 4, tipo: "gasto",   descripcion: "Netflix",             categoria: "Entretenimiento", monto: 17900   },
  { id: 5, tipo: "ingreso", descripcion: "Freelance diseño",    categoria: "Sin categoría",   monto: 450000  },
  { id: 6, tipo: "gasto",   descripcion: "Farmacia Cruz Verde", categoria: "Salud",           monto: 32000   },
  { id: 7, tipo: "gasto",   descripcion: "Gym Smart Fit",       categoria: "Salud",           monto: 59000   },
];

export const usuarioActual = {
  nombre: "Juan Doe",
  email: "juan@email.com",
  iniciales: "JD",
};