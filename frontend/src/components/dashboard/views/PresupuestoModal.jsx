/* PresupuestoModal.jsx - Modal dinámico para crear/editar presupuestos */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBudgets } from '../../../hooks/useBudgets';

import "../../../styles/presupuestos.css";
import "../../../styles/modal.css";

const PERIODOS_OPTIONS = [
  { value: "daily",   label: "Diariamente"   },
  { value: "weekly",  label: "Semanalmente"  },
  { value: "monthly", label: "Mensualmente"  },
  { value: "unique",  label: "Período Único" },
];

const MESES = [
  { value: 1,  label: "Enero"      },
  { value: 2,  label: "Febrero"    },
  { value: 3,  label: "Marzo"      },
  { value: 4,  label: "Abril"      },
  { value: 5,  label: "Mayo"       },
  { value: 6,  label: "Junio"      },
  { value: 7,  label: "Julio"      },
  { value: 8,  label: "Agosto"     },
  { value: 9,  label: "Septiembre" },
  { value: 10, label: "Octubre"    },
  { value: 11, label: "Noviembre"  },
  { value: 12, label: "Diciembre"  },
];

export default function PresupuestoModal({ presupuesto, onClose, onSuccess, onGuardar }) {
  const { categorias } = useBudgets();
  const hoy = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState(
    presupuesto
      ? {
          category_id: presupuesto.category_id,
          name:        presupuesto.name,
          amount:      presupuesto.amount,
          period_type: presupuesto.period_type,
          month:       presupuesto.month      || new Date().getMonth() + 1,
          year:        presupuesto.year       || new Date().getFullYear(),
          start_date:  presupuesto.start_date || hoy,
          end_date:    presupuesto.end_date   || hoy,
          is_permanent: presupuesto.is_permanent || false,
        }
      : {
          category_id: "",
          name:        "",
          amount:      "",
          period_type: "monthly",
          month:       new Date().getMonth() + 1,
          year:        new Date().getFullYear(),
          start_date:  hoy,
          end_date:    hoy,
          is_permanent: false,
        }
  );

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    
    // Validación para mes: no permitir meses pasados en el año actual
    if (name === "month") {
      const valueNum = parseInt(value);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      // Si el año es el actual y el mes es anterior al mes actual, no permitir
      if (form.year === currentYear && valueNum < currentMonth && !form.is_permanent) {
        setError("No puedes seleccionar un mes en el pasado");
        return;
      }
    }
    
    // Validación para año: no permitir años pasados
    if (name === "year") {
      const valueNum = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (valueNum < currentYear && !form.is_permanent) {
        setError("No puedes seleccionar un año en el pasado");
        return;
      }
    }

    setForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.category_id)    { setError("Selecciona una categoría"); return; }
    if (!form.name.trim())    { setError("El nombre es obligatorio"); return; }
    if (!form.amount || form.amount <= 0) { setError("El monto debe ser mayor a 0"); return; }

    if (form.period_type === "unique") {
      if (!form.start_date || !form.end_date) { setError("Especifica las fechas de inicio y fin"); return; }
      if (new Date(form.start_date) > new Date(form.end_date)) { setError("La fecha de inicio debe ser menor a la fecha de fin"); return; }
    }

    // Si no es permanente, validar que tenga fechas
    if (!form.is_permanent) {
      if (form.period_type === "daily" || form.period_type === "weekly") {
        if (!form.start_date) { setError("Especifica la fecha de inicio"); return; }
      }
    }

    setLoading(true);
    try {
      const payload = {
        category_id: parseInt(form.category_id),
        name:        form.name.trim(),
        amount:      form.amount,
        period_type: form.period_type,
        month:       null,
        year:        null,
        start_date:  null,
        end_date:    null,
        is_permanent: form.is_permanent,
      };

      if (form.period_type === "monthly") {
        payload.month = parseInt(form.month);
        payload.year  = parseInt(form.year);
      } else if ((form.period_type === "daily" || form.period_type === "weekly") && !form.is_permanent) {
        payload.start_date = form.start_date;
      } else if (form.period_type === "unique") {
        payload.start_date = form.start_date;
        payload.end_date   = form.end_date;
      }

      if (presupuesto) {
        await onGuardar(presupuesto.budget_id, payload);
      } else {
        await onGuardar(payload);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message || "Error al guardar el presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setError(""); onClose?.(); };

  return createPortal(
    <div className="presupuestos-modal-overlay" onClick={handleClose}>
      <div className="presupuestos-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="presupuestos-modal-header">
          <h3 className="presupuestos-modal-title">
            {presupuesto ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </h3>
          <button className="presupuestos-modal-close" onClick={handleClose}>✕</button>
        </div>

        {error && <div className="presupuestos-modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* CATEGORÍA */}
          <div className="presupuestos-form-field">
            <label className="presupuestos-form-label">Categoría *</label>
            <select
            name="category_id"
            className="presupuestos-form-select"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias
              .filter(cat => cat.type === 'expense' || cat.type === 'both')
              .map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.icon} {cat.name_cat}
                </option>
              ))
            }
          </select>
          </div>

          {/* NOMBRE */}
          <div className="presupuestos-form-field">
            <label className="presupuestos-form-label">Nombre *</label>
            <input
              type="text"
              name="name"
              className="presupuestos-form-input"
              placeholder="Ej: Presupuesto Alimentación"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* MONTO */}
          <div className="presupuestos-form-field">
            <label className="presupuestos-form-label">Monto *</label>
            <input
              type="number"
              name="amount"
              className="presupuestos-form-input"
              placeholder="Ej: 500000"
              value={form.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* PERÍODO */}
          <div className="presupuestos-form-field">
            <label className="presupuestos-form-label">Período *</label>
            <select
              name="period_type"
              className="presupuestos-form-select"
              value={form.period_type}
              onChange={e => { setForm(p => ({ ...p, period_type: e.target.value })); setError(""); }}
            >
              {PERIODOS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* CHECKBOX: ¿Permanente? */}
          {form.period_type !== "unique" && (
            <div className="presupuestos-form-field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="is_permanent"
                name="is_permanent"
                checked={form.is_permanent}
                onChange={e => { setForm(p => ({ ...p, is_permanent: e.target.checked })); setError(""); }}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="is_permanent" style={{ cursor: "pointer", margin: "0" }}>
                ¿Permanente? (Se repite indefinidamente)
              </label>
            </div>
          )}

          {/* MONTHLY: Mes y Año */}
          {form.period_type === "monthly" && (
            <div className="presupuestos-form-row">
              <div className="presupuestos-form-field">
                <label className="presupuestos-form-label">Mes *</label>
                <select name="month" className="presupuestos-form-select" value={form.month} onChange={handleChange} disabled={form.is_permanent}>
                  {MESES.map(m => {
                    const currentMonth = new Date().getMonth() + 1;
                    const currentYear = new Date().getFullYear();
                    const isDisabled = form.year === currentYear && m.value < currentMonth && !form.is_permanent;
                    return <option key={m.value} value={m.value} disabled={isDisabled}>{m.label}</option>;
                  })}
                </select>
              </div>
              <div className="presupuestos-form-field">
                <label className="presupuestos-form-label">Año *</label>
                <input
                  type="number"
                  name="year"
                  className="presupuestos-form-input"
                  value={form.year}
                  onChange={handleChange}
                  min={new Date().getFullYear()}
                  max="2050"
                  disabled={form.is_permanent}
                  required
                />
              </div>
            </div>
          )}

          {form.is_permanent && form.period_type !== "unique" && (
            <div className="presupuestos-form-field" style={{ marginTop: "10px", padding: "12px", backgroundColor: "#21253a", borderRadius: "10px", border: "1.5px solid #5b6ef5", color: "#ccc" }}>
              <p style={{ margin: "0", fontSize: "0.9rem" }}>
                💡 Se reiniciará cada {form.period_type === "daily" ? "día" : form.period_type === "weekly" ? "semana" : "mes"} sin fecha de fin.
              </p>
            </div>
          )}

          {/* DAILY o WEEKLY: Fecha de inicio */}
          {(form.period_type === "daily" || form.period_type === "weekly") && !form.is_permanent && (
            <div className="presupuestos-form-field">
              <label className="presupuestos-form-label">
                {form.period_type === "daily" ? "Fecha del día *" : "Fecha de inicio de semana *"}
              </label>
              <input
                type="date"
                name="start_date"
                className="presupuestos-form-input"
                value={form.start_date}
                onChange={handleChange}
                min={hoy}
                required
              />
            </div>
          )}

          {/* UNIQUE: Fechas de inicio y fin */}
          {form.period_type === "unique" && (
            <div className="presupuestos-form-row">
              <div className="presupuestos-form-field">
                <label className="presupuestos-form-label">Fecha de inicio *</label>
                <input type="date" name="start_date" className="presupuestos-form-input" value={form.start_date} onChange={handleChange} min={hoy} required />
              </div>
              <div className="presupuestos-form-field">
                <label className="presupuestos-form-label">Fecha de fin *</label>
                <input type="date" name="end_date" className="presupuestos-form-input" value={form.end_date} onChange={handleChange} min={hoy} required />
              </div>
            </div>
          )}

          {/* BOTONES */}
          <div className="presupuestos-modal-actions">
            <button
              type="button"
              className="presupuestos-modal-btn presupuestos-modal-btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="presupuestos-modal-btn presupuestos-modal-btn-submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : presupuesto ? "Actualizar" : "Crear Presupuesto"}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}