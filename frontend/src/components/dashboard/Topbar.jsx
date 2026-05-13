import { MES_ACTIVO } from "../../constants";

// ─────────────────────────────────────────────────────────────────────────────
// Topbar — Header superior, recibe el item activo por props
// ─────────────────────────────────────────────────────────────────────────────

export default function Topbar({ itemActivo, onNuevaTransaccion }) {
  return (
    <header className="db-topbar">
      <span className="db-topbar-title">
        {itemActivo?.icono} {itemActivo?.etiqueta}
      </span>
      <div className="db-topbar-right">
        <span className="db-topbar-date">{MES_ACTIVO}</span>
        <button className="btn-primary" onClick={onNuevaTransaccion}>
          ＋ Transacción
        </button>
      </div>
    </header>
  );
}