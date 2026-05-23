# 💸 ShiftCash - Gestión Financiera

ShiftCash es una aplicación web moderna diseñada para el control de finanzas personales, construida con **React**, **Vite** y visualizaciones dinámicas con **Recharts**.

## 🚀 Tecnologías utilizadas
* [React.js](https://reactjs.org/) - Librería para la interfaz.
* [Vite](https://vitejs.dev/) - Entorno de desarrollo ultra rápido.
* [Recharts](https://recharts.org/) - Librería de gráficos para estadísticas financieras.

## 🛠️ Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina:

### 1. Clonar el repositorio
git clone https://github.com/piri277/ShiftCash


### 2. Instalar dependencias
Asegúrate de tener Node.js instalado. Luego, ejecuta:

npm install

npm install recharts

### 3. Ejecutar en modo desarrollo
npm run dev

Una vez ejecutado, abre http://localhost:5173 en tu navegador para ver la aplicación.


## 🔐 Estado del Proyecto (Acceso Beta)
Actualmente, el backend de autenticación está en desarrollo. Para explorar la aplicación:

Registro: El módulo de creación de cuentas nuevas aún no está operativo.

Login: Ingresa cualquier usuario y contraseña. El sistema te otorgará acceso automáticamente mediante credenciales predeterminadas de prueba.


Script base de datos

-- =====================================================================
-- 1. LIMPIEZA DE TABLAS EXISTENTES (Para evitar conflictos en despliegue limpio)
-- =====================================================================
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.budget CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================================
-- 2. CREACIÓN DE TABLAS
-- =====================================================================

-- Tabla de Usuarios
CREATE TABLE public.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(150),
    currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE public.category (
    category_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(user_id) ON DELETE CASCADE,
    name_cat VARCHAR(25) NOT NULL,
    icon VARCHAR(150),
    type VARCHAR(10), -- 'expense' o 'income'
    is_default SMALLINT DEFAULT 0
);

-- Tabla de Presupuesto (Estructura Nueva y Unificada)
CREATE TABLE public.budget (
    budget_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES public.category(category_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'daily', 'weekly', 'monthly', 'unique'
    month SMALLINT NULL,
    year SMALLINT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    is_permanent BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla de Transacciones
CREATE TABLE public.transactions (
    trans_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES public.category(category_id) ON DELETE SET NULL,
    type VARCHAR(15) NOT NULL, -- 'expense' o 'income'
    amount NUMERIC(15,2) NOT NULL,
    description VARCHAR(250),
    trans_date DATE DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    frequency VARCHAR(15)
);

-- =====================================================================
-- 3. OPTIMIZACIÓN (Índices para llaves foráneas y consultas frecuentes)
-- =====================================================================
-- Nota: Las llaves primarias ya crean índices automáticamente en PostgreSQL.
CREATE INDEX ix_category_user_id ON public.category (user_id);
CREATE INDEX ix_budget_user_id ON public.budget (user_id);
CREATE INDEX ix_transactions_user_id ON public.transactions (user_id);
CREATE INDEX ix_transactions_trans_date ON public.transactions (trans_date);

-- =====================================================================
-- 4. INSERCIÓN DE CATEGORÍAS POR DEFECTO
-- =====================================================================

-- GASTOS (Expense)
INSERT INTO public.category (name_cat, icon, type, is_default) VALUES 
('Alimentación', '🍴', 'expense', 1),
('Transporte', '🚗', 'expense', 1),
('Entretenimiento', '🎵', 'expense', 1),
('Salud', '❤️', 'expense', 1),
('Educación', '📚', 'expense', 1),
('Servicios', '💡', 'expense', 1),
('Otros', '🔄', 'expense', 1);

-- INGRESOS (Income)
INSERT INTO public.category (name_cat, icon, type, is_default) VALUES 
('Salario', '💼', 'income', 1),
('Freelance', '💻', 'income', 1);

-- =====================================================================
-- 5. REINICIO DE SECUENCIAS (ID's)
-- =====================================================================
SELECT setval('public.users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM public.users), 1), false);
SELECT setval('public.category_category_id_seq', COALESCE((SELECT MAX(category_id) FROM public.category), 1), false);
SELECT setval('public.budget_budget_id_seq', COALESCE((SELECT MAX(budget_id) FROM public.budget), 1), false);
SELECT setval('public.transactions_trans_id_seq', COALESCE((SELECT MAX(trans_id) FROM public.transactions), 1), false);
