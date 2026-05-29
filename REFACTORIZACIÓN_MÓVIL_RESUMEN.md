# 🎯 Refactorización Móvil de la Vista "Resumen" — Documento Definitivo

## Introducción
Este documento describe la transformación completa de la vista "Resumen" (VistaResumen.jsx) del dashboard Shiftcash para optimizarla como una experiencia móvil-first totalmente responsiva. La refactorización preserva la identidad visual oscura de la aplicación mientras implementa una arquitectura de navegación inferior inspirada en Instagram.

---

## 1. ARQUITECTURA DE NAVEGACIÓN — Bottom Navigation Bar

### 1.1 Eliminación del Sidebar Vertical

**Estado Actual:**
- El sidebar vertical (`Sidebar.jsx`) ocupa 260px de ancho (80px cuando está colapsado)
- Contiene 6 items de navegación: Resumen, Historial, Gráficas, Categorías, Presupuestos, Metas
- Incluye brand animado "ShiftCash", selector de perfil con dropdown y botones de logout/configuración
- Utiliza iconos de Lucide React con indicador visual de página activa (barra izquierda)

**Acción Requerida:**
- **Eliminación completa del sidebar** en vistas móviles (breakpoint: máx 768px)
- El sidebar debe ser reemplazado por una bottom navigation bar que se renderice solo en dispositivos móviles
- En desktop (>768px), mantener el sidebar actual sin cambios para preservar la experiencia existente

### 1.2 Bottom Navigation Bar — Especificaciones Detalladas

#### Ubicación y Estructura
```
┌─────────────────────────────────────────────┐  Content Area
│                                             │  (con padding-bottom para no ocultar)
│          Main Content (scrollable)          │
│                                             │
└─────────────────────────────────────────────┘
┌───────────────────────────────────────────────────┐  Bottom Nav Bar
│  🏠    📊    📈    📁    🏆    👤              │  (Fixed, z-index alto)
│ Home  Hist  Stats  Cats  Goals Profile            │
└─────────────────────────────────────────────┘
```

#### Especificaciones Técnicas

| Propiedad | Valor |
|-----------|-------|
| **Posición** | Fixed bottom, 100% ancho de viewport |
| **Alto** | 64px (48px contenido + 8px padding vertical) |
| **Fondo** | `#0f1222` (color del sidebar actual) con `backdrop-filter: blur(20px)` |
| **Borde Superior** | `1px solid rgba(91, 110, 245, 0.14)` (consistent con topbar) |
| **Z-index** | 999 (por debajo del topbar z-index: 100, pero sobre todo contenido) |
| **Shadow** | `0 -4px 16px rgba(0,0,0,0.3)` (sombra superior suave) |

#### Items de Navegación — Los 5 Iconos

| Posición | Etiqueta | Icon Lucide | Color Activo | Descripción |
|----------|----------|-------------|--------------|-------------|
| 1 | Home | `LayoutDashboard` | `#5b6ef5` | Vista Resumen |
| 2 | History | `History` | `#5b6ef5` | Transacciones |
| 3 | Charts | `BarChart3` | `#5b6ef5` | Análisis Visual |
| 4 | Categories | `Layers` | `#5b6ef5` | Gestión de categorías |
| 5 | Goals | `Target` | `#5b6ef5` | Metas de ahorro |
| 6 | Profile | `User` | `#5b6ef5` | Configuración |

#### Espaciado e Iconografía

- **Distribución de iconos:** Espaciados uniformemente con flexbox `justify-content: space-around`
- **Tamaño de iconos:** 24px (Lucide React renderizado con `size={24}`)
- **Padding horizontal entre iconos:** 8px mínimo
- **Color iconos inactivos:** `#8b93bc` (text-muted)
- **Color iconos activos:** `#5b6ef5` (primary color) con `strokeWidth: 2.5`
- **Indicador de página activa:** 
  - Opción 1 (Recomendada): Pequeño punto/piloto debajo del icono (4px diámetro, color `#5b6ef5`)
  - Opción 2: Fondo levemente tintado (`rgba(91, 110, 245, 0.1)`) + icono en color primario
  - Transición suave: `transition: all 0.2s ease`

#### Comportamiento Interactivo

```javascript
// Pseudocódigo del comportamiento
onClick={icon} → {
  setVistaActiva(icon.key)
  // Scroll to top del content area (recomendado)
  contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  // Navegación sin modal (modal permanece encima si está abierto)
}

// Estados visuales
- Hover: Icono brilla levemente (opacity: 0.8, box-shadow sutil)
- Active: Icono en color primario + indicador visible
- Disabled: No aplicable en este caso
```

#### Item Especial: Profile (Perfil)

En móvil, el menú de perfil debe funcionar diferente:
- **Opción A (Recomendada):** Al hacer clic en Profile, se abre un pequeño bottom sheet o popover con opciones: "Configuración", "Cerrar sesión"
- **Opción B:** Navegación directa a una página de perfil completa
- **Recomendación final:** Usar bottom sheet para mantener la UX coherente con Instagram

---

## 2. TOPBAR OPTIMIZADO PARA MÓVIL

### 2.1 Estado Actual (Desktop)
```
[💰 Resumen]     [Mayo 2026]  [＋ Transacción]
```
- Altura: 60px
- Padding: 0 2rem
- Distribuido en 3 columnas: título-icono (izq) | fecha (centro) | botón (derecha)

### 2.2 Transformación Mobile-First

#### Diseño Propuesto para Pantallas ≤768px

```
┌─────────────────────────────────────────┐ 60px height (mantener)
│ 💰 Resumen  [Mayo 2026] [＋ Transacción]│ 
└─────────────────────────────────────────┘
```

**Cambios Específicos:**

| Aspecto | Desktop | Mobile |
|--------|---------|--------|
| **Logo/Icono** | 💰 + "Resumen" (12px) | Solo icono de moneda (16px) o "Res" truncado |
| **Tamaño Fuente Título** | 0.9rem | 0.75rem |
| **Selector Fecha** | Visible normal (Mayo 2026) | Comprimido a "May" o mostrar solo mes, o usar popover |
| **Botón "+ Transacción"** | `padding: 0.5rem 1.1rem` | `padding: 0.4rem 0.9rem` (más compacto) |
| **Tamaño Botón Fuente** | 0.85rem | 0.75rem |
| **Disposición** | Flex row con gap 12px | Flex row con gap 6-8px, items más comprimidos |
| **Padding Topbar** | `0 2rem` | `0 1rem` (reduce padding horizontal) |

#### Layout Flexbox Móvil Propuesto

```css
.db-topbar {
  /* Desktop >= 768px */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 12px;
  
  /* Mobile < 768px */
  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 6px;
    justify-content: flex-start; /* O space-between si se quiere ocupar todo el ancho */
  }
}

.db-topbar-title {
  /* Desktop: 0.9rem | Mobile: truncado o con ellipsis */
  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.db-topbar-date {
  /* Desktop: normal | Mobile: compacto */
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    white-space: nowrap;
  }
}

.btn-primary {
  /* Mobile: más compacto */
  @media (max-width: 768px) {
    padding: 0.4rem 0.9rem;
    font-size: 0.75rem;
    border-radius: 8px; /* Ligeramente menos redondeado */
  }
}
```

#### Nota Importante: Preservar Gradiente Púrpura

- El botón "+ Transacción" debe mantener el gradiente púrpura-azul exacto: `linear-gradient(135deg, #5b6ef5 0%, #9b59f5 100%)`
- La sombra del botón se ajusta según tamaño: en móvil `box-shadow: 0 4px 12px rgba(91,110,245,0.25)` (reducida)
- En hover, mantener el efecto elevado pero con translate más pequeño: `translateY(-1px)` en móvil vs `translateY(-2px)` en desktop

---

## 3. MAIN CONTENT AREA — REDISEÑO RESPONSIVO

### 3.1 Ajuste del Contenedor Principal

**Estado Actual:**
```css
.db-content {
  padding: 1.75rem 2rem;
  flex: 1;
  overflow-y: auto;
}
```

**Transformación Mobile:**
```css
.db-content {
  /* Desktop */
  padding: 1.75rem 2rem;
  
  /* Mobile < 768px */
  @media (max-width: 768px) {
    padding: 1rem 1rem; /* Reduce padding horizontal y vertical */
    padding-bottom: 80px; /* ⚠️ CRÍTICO: espacio para bottom nav bar */
    /* O usar: padding-bottom: calc(64px + 1rem) */
  }
}
```

**Razón:** El bottom navigation bar tiene altura de 64px, y al ser fixed, el contenido debe tener padding-bottom para evitar que se oculte bajo la barra.

---

## 4. GRID DE STAT CARDS — REORDENAMIENTO VERTICAL

### 4.1 Estado Actual (Desktop)

```
┌──────────┬──────────┬──────────┬──────────┐
│ Gastado  │ Ganado   │ Ahorrado │ Transac. │
│  $X,XXX  │  $X,XXX  │  $X,XXX  │    N     │
└──────────┴──────────┴──────────┴──────────┘
Grid: grid-template-columns: repeat(auto-fit, minmax(190px, 1fr))
```

### 4.2 Transformación Mobile

```
┌──────────────────────────────────┐
│ 💸 Gastado                       │
│ $X,XXX                           │
├──────────────────────────────────┤
│ 💰 Ganado                        │
│ $X,XXX                           │
├──────────────────────────────────┤
│ 🏦 Ahorrado                      │
│ $X,XXX                           │
├──────────────────────────────────┤
│ 🔄 Transacciones                 │
│ N                                │
└──────────────────────────────────┘
```

**Cambios CSS:**

```css
.db-stat-grid {
  /* Desktop >= 768px */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.875rem;
  margin-bottom: 1.5rem;
  
  /* Mobile < 768px */
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Una sola columna */
    gap: 0.6rem; /* Reducir espaciado entre tarjetas */
    margin-bottom: 1rem;
  }
}

.db-stat-card {
  /* Desktop */
  padding: 1.25rem 1.35rem;
  
  /* Mobile < 768px */
  @media (max-width: 768px) {
    padding: 1rem 1.1rem; /* Reduce padding */
    border-radius: 12px; /* Ligeramente menos redondeado */
  }
}

.db-stat-icon {
  /* Desktop: 1.3rem | Mobile: 1.1rem */
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
}

.db-stat-label {
  /* Desktop: 0.72rem | Mobile: 0.65rem */
  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.8px;
  }
}

.db-stat-value {
  /* Desktop: 1.6rem | Mobile: 1.35rem */
  @media (max-width: 768px) {
    font-size: 1.35rem;
  }
}
```

**Orden de Tarjetas (sin cambios):**
1. Total Gastado (Rojo: #f87171) — 💸
2. Total Ganado (Verde: #34d399) — 💰
3. Ahorrado (Azul: #5b6ef5) — 🏦
4. Transacciones (Púrpura: #9b59f5) — 🔄

**Colores de Borde Superior (Preservar):**
- Cada tarjeta mantiene su `borderTop: 3px solid {color}`
- Los colores se preservan exactamente como están en el código actual

---

## 5. TARJETA DE PRESUPUESTO — OPTIMIZACIÓN MOBILE

### 5.1 Estado Actual (Desktop)

```
┌────────────────────────────────────────────┐
│ Presupuesto Total  [Dia] [Sem] [Mes]      │
│                                            │
│ 35% — $1,500 / $4,280        3 presupuestos│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────────────────┘
```

### 5.2 Transformación Mobile

```
┌──────────────────────────────────┐
│ Presupuesto Total                │
│ [Dia] [Sem] [Mes]               │
│                                  │
│ 35% — $1,500 / $4,280           │
│ 3 presupuestos                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────┘
```

**Cambios:**

```css
/* Encabezado flexible */
.db-card {
  /* Mobile < 768px */
  @media (max-width: 768px) {
    padding: 1rem; /* Reduce padding */
    margin-bottom: 1rem;
  }
}

/* Header del presupuesto (título + chips de período) */
[style*="display: flex; justifyContent: space-between"] {
  @media (max-width: 768px) {
    flex-direction: column; /* Apila el título y los chips */
    gap: 0.8rem;
    align-items: flex-start;
  }
}

/* Chips de período */
[style*="display: flex; gap: 6"] {
  @media (max-width: 768px) {
    width: 100%; /* Ocupa todo el ancho */
    justify-content: flex-start; /* Alinea a la izquierda */
    flex-wrap: wrap; /* Permite saltos de línea si es necesario */
  }
}

/* Cada chip de período */
button[style*="padding: 3px 12px"] {
  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 0.7rem;
    border-radius: 6px;
  }
}

/* Budget header (porcentaje - monto) */
.db-budget-header {
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.db-budget-track {
  /* Altura igual en ambos tamaños */
  height: 8px;
  @media (max-width: 768px) {
    margin-top: 0.6rem;
  }
}
```

**Nota Importante:** Los selectores de período ("Diariamente", "Semanalmente", "Mensualmente") deben permanecer funcionales y en la tarjeta, pero su distribución en móvil debe ser más compacta (en fila wrappable o apilada).

---

## 6. TARJETA DE META — ADAPTACIÓN MOBILE

### 6.1 Estado Actual (Desktop)

```
┌──────────────────────────────────────────────────┐
│ Seguimiento de Meta: Ahorrar Vacaciones          │
│                     [Dropdown ▼ Ahorrar Vacaciones] │
│                                                  │
│ 🎯 Pendiente para hoy: $50,000                   │
│ Progreso: 15 de 30 días listos                   │
│ Porcentaje: 50%                                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────┘
```

### 6.2 Transformación Mobile

```
┌──────────────────────────────────┐
│ Seguimiento de Meta              │
│ [Dropdown ▼ Meta Activa]        │
│                                  │
│ 🎯 Pendiente para hoy: $50,000  │
│ Progreso: 15 de 30 días        │
│                                  │
│ 50%                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────┘
```

**Cambios:**

```css
/* Encabezado de meta (título + dropdown) */
[style*="display: flex; justifyContent: space-between; alignItems: center"] {
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    
    h3 {
      font-size: 0.85rem;
      width: 100%;
      margin: 0;
    }
  }
}

/* Custom select / dropdown */
.custom-select-wrapper {
  @media (max-width: 768px) {
    width: 100%; /* Ocupa todo el ancho */
    min-width: unset;
  }
}

/* Trigger del dropdown */
.db-meta-selector {
  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.8rem;
  }
}

/* Contenedor de estado de progreso */
.db-budget-header {
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.6rem;
    
    > div:first-child {
      flex-direction: column;
      gap: 0.4rem;
      width: 100%;
    }
    
    > div:last-child {
      align-self: flex-end;
      font-size: 1rem;
    }
  }
}

/* Barra de progreso */
.db-budget-track {
  @media (max-width: 768px) {
    height: 6px; /* Ligeramente más delgada */
  }
}
```

**Nota:** El gradiente y animación de la barra de progreso (`db-budget-fill`) se mantiene exactamente igual: `linear-gradient(135deg, #5b6ef5 0%, #9b59f5 100%)` con transición suave.

---

## 7. GRÁFICA CAROUSEL — OPTIMIZACIÓN MOBILE

### 7.1 Estado Actual (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ Tendencia (o Ingresos vs Gastos)  [Dia] [Sem] [Mes] │
│ [← →] (indicadores puntos)                          │
│                                                     │
│ [Gráfica Recharts — Height: 240px]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Transformación Mobile

```
┌──────────────────────────────────┐
│ Tendencia                        │
│ [Dia] [Sem] [Mes]               │
│ [← →] ● ○                       │
│                                  │
│ [Gráfica — Height: 160px]       │
│                                  │
└──────────────────────────────────┘
```

**Cambios:**

```css
/* Card contenedor */
.db-card {
  @media (max-width: 768px) {
    padding: 0.9rem;
  }
}

/* Header con título + opciones */
[style*="display: flex; alignItems: center; justifyContent: space-between"] {
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    
    > div:first-child {
      width: 100%;
      
      h3 {
        font-size: 0.85rem;
        margin: 0;
      }
      
      span {
        font-size: 0.7rem;
      }
    }
  }
}

/* Chips de período (Dia, Sem, Mes, Único) */
[style*="display: flex; gap: 6"] {
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 4px;
    
    button {
      padding: 3px 8px;
      font-size: 0.65rem;
      border-radius: 4px;
    }
  }
}

/* Botones de navegación (flechas) */
[style*="display: flex; gap: 4"] {
  @media (max-width: 768px) {
    > button {
      width: 24px;
      height: 24px;
      font-size: 0.75rem;
    }
  }
}

/* Indicadores de puntos */
[style*="display: flex; gap: 4"] {
  @media (max-width: 768px) {
    /* Reducir tamaño de los puntos */
    > div {
      width: auto;
      
      &.active {
        width: 12px;
      }
      
      &:not(.active) {
        width: 4px;
      }
    }
  }
}

/* ⚠️ IMPORTANTE: Height de Gráfica */
ResponsiveContainer height={240} {
  @media (max-width: 768px) {
    /* En React/Recharts, se necesita condicional */
    /* const chartHeight = isMobile ? 160 : 240; */
    height: 160px;
  }
}

/* Márgenes de la gráfica */
margin={{ top: 4, right: 8, bottom: 0, left: 0 }} {
  @media (max-width: 768px) {
    /* En React, ajustar margin dinámicamente */
    /* margin={{ top: 2, right: 4, bottom: 0, left: 0 }} */
  }
}

/* Tooltip de la gráfica */
<Tooltip contentStyle={TOOLTIP_STYLE} ... /> {
  @media (max-width: 768px) {
    /* Reducer tamaño de fuente del tooltip */
    /* fontSize: 0.75rem (dentro del TOOLTIP_STYLE condicional) */
  }
}

/* Legend */
<Legend wrapperStyle={{ fontSize: "0.8rem" }} /> {
  @media (max-width: 768px) {
    /* wrapperStyle={{ fontSize: "0.7rem" }} */
  }
}
```

**Reducción de Height:** La gráfica debe reducirse de 240px (desktop) a 160px (móvil) para no ocupar demasiado espacio vertical en pantallas pequeñas.

---

## 8. ALERT DE PRESUPUESTO SUPERADO

### 8.1 Estado Actual

```
┌────────────────────────────────────────┐
│ ⚠️  ¡Has superado tu presupuesto!      │
│     Gastaste $5,000 de $4,280.        │
└────────────────────────────────────────┘
```

### 8.2 Mobile

```
┌──────────────────────────────┐
│ ⚠️  ¡Presupuesto superado!   │
│    Gastaste $5K de $4,2K    │
└──────────────────────────────┘
```

**Cambios:**

```css
.db-alert {
  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
    margin-bottom: 1rem;
    
    span:first-child {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
  }
}
```

**Nota:** Los montos pueden truncarse o formatearse de forma más compacta en móvil (p.ej., "$5K" en lugar de "$5,000"), pero esto debe ser opcional.

---

## 9. AJUSTES GLOBALES DE CSS — MOBILE BREAKPOINTS

### 9.1 Tipografía Mobile

```css
/* Escalas globales */
@media (max-width: 768px) {
  .db-view-title {
    font-size: 1.15rem; /* Reducido de 1.4rem */
    margin-bottom: 1rem;
  }
  
  .db-card-title {
    font-size: 0.8rem; /* Reducido de 0.9rem */
  }
  
  /* Reduce todas las fuentes en 10-15% para móvil */
}
```

### 9.2 Espaciado Mobile

```css
/* Reduce margins y paddings generales */
@media (max-width: 768px) {
  .db-content {
    padding: 1rem;
    padding-bottom: 80px; /* Para bottom nav */
  }
  
  h2, h3, p, span {
    margin-bottom: adjust; /* 20% menos */
  }
}
```

### 9.3 Transiciones Suaves

```css
/* Las transiciones deben ser rápidas en móvil */
@media (max-width: 768px) {
  * {
    transition-duration: 0.15s; /* Reducido de 0.2-0.3s */
  }
}
```

---

## 10. IMPLEMENTACIÓN TÉCNICA — ARCHIVOS A MODIFICAR

### 10.1 Archivos Clave a Actualizar

```
frontend/src/
├── components/dashboard/
│   ├── Dashboard.jsx                 ← Ajustar renderizado condicional
│   ├── layout/
│   │   ├── Sidebar.jsx              ← Añadir @media queries (hide móvil)
│   │   ├── Topbar.jsx               ← Optimizar para móvil
│   │   └── BottomNavBar.jsx          ← NUEVO: Bottom navigation
│   └── views/
│       └── VistaResumen.jsx          ← Ajustar estilos inline para móvil
└── styles/
    ├── dashboard.css                 ← Añadir @media queries masivas
    └── mobile.css                    ← NUEVO: Estilos móvil específicos (opcional)
```

### 10.2 Cambios en Dashboard.jsx

```javascript
// Pseudocódigo
export default function Dashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="db-app">
      {/* Sidebar: hidden en móvil */}
      {!isMobile && <Sidebar ... />}
      
      <div className="db-main">
        <Topbar ... /> {/* Optimizado con CSS media queries */}
        <main className="db-content">
          {VISTAS[vistaActiva]}
        </main>
      </div>
      
      {/* Bottom Nav: solo en móvil */}
      {isMobile && <BottomNavBar ... />}
      
      {/* Modal siempre visible */}
      {modalAbierto && <ModalTransaccion ... />}
    </div>
  );
}
```

### 10.3 Nuevo Componente: BottomNavBar.jsx

```javascript
// Estructura mínima
export default function BottomNavBar({ vistaActiva, onCambiarVista }) {
  const menuItems = [
    { key: "resumen",    etiqueta: "Dashboard", icon: LayoutDashboard },
    { key: "historial",  etiqueta: "History",   icon: History },
    { key: "graficas",   etiqueta: "Charts",    icon: BarChart3 },
    { key: "categorias", etiqueta: "Categories", icon: Layers },
    { key: "metas",      etiqueta: "Goals",     icon: Target },
    { key: "perfil",     etiqueta: "Profile",   icon: User },
  ];

  return (
    <nav className="db-bottom-nav">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = vistaActiva === item.key;
        
        return (
          <button
            key={item.key}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onCambiarVista(item.key)}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="nav-label">{item.etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

### 10.4 Estilos CSS para BottomNavBar

```css
.db-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #0f1222;
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(91, 110, 245, 0.14);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  z-index: 999;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  color: #8b93bc;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 80px;
}

.bottom-nav-item:hover {
  color: #5b6ef5;
  background: rgba(91, 110, 245, 0.1);
}

.bottom-nav-item.active {
  color: #5b6ef5;
  background: rgba(91, 110, 245, 0.1);
}

/* Indicador visual (pequeño punto) */
.bottom-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #5b6ef5;
  border-radius: 50%;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1;
}
```

---

## 11. PRESERVACIÓN DE IDENTIDAD VISUAL

### 11.1 Paleta de Colores (Sin Cambios)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#5b6ef5` | Bottom nav activo, botones primarios |
| `--accent` | `#9b59f5` | Gradientes, acentos |
| `--success` | `#34d399` | Tarjeta "Ganado" |
| `--danger` | `#f87171` | Tarjeta "Gastado" |
| `--dark` | `#080b14` | Fondo principal |
| `--surface` | `#111422` | Tarjetas |
| `--gradient-accent` | `linear-gradient(135deg, #5b6ef5 0%, #9b59f5 100%)` | Botón primario |

### 11.2 Tipografía (Sin Cambios en Familias)

- **Títulos:** `'Sora'` sans-serif, fontWeight: 600-800
- **Cuerpo:** `'DM Sans'` sans-serif, fontWeight: 400-500
- **Monos:** `'Inter'` sans-serif (para logo)

**Solo se ajustan tamaños, no familias.**

### 11.3 Iconografía

- **Proveedor:** Lucide React (mantener)
- **Tamaño Desktop:** 20px
- **Tamaño Mobile:** 24px (en bottom nav)
- **Stroke Width:** 1.8px (inactivo) → 2.5px (activo)

### 11.4 Bordes y Sombras

- **Border Radius:**
  - Cards: 20px (desktop) → 12px (móvil)
  - Buttons: 14px (desktop) → 8px (móvil)
  - Small elements: 10px → 8px

- **Sombras:** Mantener `--shadow-card` pero reducir opacidad en móvil en 10%

---

## 12. GESTIÓN DE MENU DE PERFIL EN MÓVIL

### 12.1 Opción Recomendada: Bottom Sheet

Cuando el usuario toca el icono de "Profile" en la bottom nav:

```
┌─────────────────────────────────┐
│     Main Content              │ (translucent overlay)
├─────────────────────────────────┤
│ ▲                              │ (drag handle)
│ Perfil                          │
│ ─────────────────────────────   │
│ usuario@email.com              │
│                                │
│ ⚙️  Configuración              │
│ 🚪 Cerrar sesión              │
│                                │
└─────────────────────────────────┘ (Bottom Sheet)
```

### 12.2 Alternativa: Dropdown Popover

Si se prefiere mantener consistencia con desktop:

```
┌─────────────────────────────────┐
│ Main Content                  │
│                                │
│ [Popover en esquina inferior] │
│ ┌─────────────────────────────┐
│ │ usuario@email.com           │
│ │ ─────────────────────────   │
│ │ ⚙️ Configuración             │
│ │ 🚪 Cerrar sesión            │
│ └─────────────────────────────┘
└─────────────────────────────────┘
```

**Recomendación:** Usar Bottom Sheet para una mejor experiencia mobile-native.

---

## 13. TESTING Y VALIDACIÓN

### 13.1 Breakpoints a Validar

| Device | Breakpoint | Test |
|--------|-----------|------|
| Mobile (iPhone 12) | 390px | Bottom nav visible, sidebar hidden |
| Mobile (iPhone SE) | 375px | Textos no truncados, botón accesible |
| Tablet (iPad) | 768px | Transición sidebar ↔ bottom nav |
| Desktop | 1024px+ | Sidebar normal, content full width |

### 13.2 Validaciones Funcionales

- [ ] Bottom nav items navegan correctamente
- [ ] Icono activo se destaca visualmente
- [ ] Content no se oculta bajo bottom nav
- [ ] Topbar se adapta sin perder funcionalidad
- [ ] Botón "+ Transacción" abre modal desde móvil
- [ ] Gráficas se renderean con altura correcta (160px móvil)
- [ ] Selectores de período funcionan en móvil
- [ ] Dropdown de metas abre correctamente

### 13.3 Validaciones Visuales

- [ ] Colores exactos de gradientes se preservan
- [ ] Espaciado es consistente
- [ ] Fuentes legibles en todos los tamaños
- [ ] Hover states funcionan en touch (o usar active states)
- [ ] Transiciones son suaves sin lag

---

## 14. GUÍA DE IMPLEMENTACIÓN PASO A PASO

### Fase 1: Preparación (1-2 horas)

1. Crear rama `feature/mobile-resumen-refactor`
2. Crear archivo `BottomNavBar.jsx`
3. Crear archivo `mobile.css` con media queries base
4. Actualizar `Dashboard.jsx` con renderizado condicional

### Fase 2: Sidebar a Bottom Nav (2-3 horas)

1. Ocultar sidebar en móvil (display: none)
2. Renderizar BottomNavBar en móvil
3. Asegurar navegación funciona idénticamente
4. Testar en diferentes dispositivos

### Fase 3: Layout Responsivo (2-3 horas)

1. Ajustar `.db-content` con padding-bottom
2. Actualizar grid de stat cards a columna
3. Reducir tamaños de tipografía y espaciado
4. Testear scroll y overflow

### Fase 4: Componentes Específicos (2-3 horas)

1. Optimizar Topbar
2. Adaptar tarjetas de presupuesto y meta
3. Reducir altura de gráficas
4. Ajustar button sizes

### Fase 5: Pulido y Testing (1-2 horas)

1. Validar en real devices (o DevTools)
2. Corregir bugs de layout
3. Optimizar performance
4. Documentar cambios

**Tiempo total estimado:** 8-13 horas

---

## 15. NOTAS DE DESARROLLO

### 15.1 Hook de Media Query Útil

```javascript
// useMediaQuery.js
import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Uso
const isMobile = useMediaQuery('(max-width: 768px)');
```

### 15.2 Alternativa: Usar CSS Grid/Flexbox Inteligente

```css
/* Sin usar media queries explícitas en algunos casos */
.db-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
  gap: 0.875rem;
}

/* En móvil, minmax(100%, 190px) hace que sea 100% automáticamente */
```

### 15.3 Performance: Lazy Load de Components

Si la gráfica es pesada, considerar:

```javascript
const GraficaCarousel = lazy(() => import('./GraficaCarousel'));

<Suspense fallback={<div>Cargando gráfica...</div>}>
  <GraficaCarousel ... />
</Suspense>
```

---

## 16. CONCLUSIÓN Y RESUMEN

La refactorización móvil de VistaResumen transforma la experiencia desktop-first en una aplicación verdaderamente mobile-first mientras:

✅ **Preserva la identidad visual oscura:** Colores, gradientes, y tipografía exactos
✅ **Mantiene funcionalidad completa:** Todos los features operativos en móvil
✅ **Implementa navegación intuitiva:** Bottom nav estilo Instagram
✅ **Optimiza UX mobile:** Espaciado, tamaños, y gestos ajustados
✅ **Asegura compatibilidad backward:** Desktop experience sin cambios

**El resultado es una aplicación verdaderamente responsive que se siente nativa en ambas plataformas.**

---

**Documento preparado por:** GitHub Copilot
**Fecha:** Mayo 2026
**Versión:** 1.0 (Definitiva)
