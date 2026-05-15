import { useState, useEffect } from "react";
import { getMe, actualizarPerfil, cambiarPassword, actualizarMoneda, eliminarCuenta } from "../../../api/profile";
import "../../../styles/config.css";


const MONEDAS = ["COP", "USD", "EUR", "MXN", "ARS", "BRL"];

export default function VistaConfiguracion() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Secciones
  const [seccion, setSeccion] = useState("perfil");

  // Perfil
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [msgPerfil, setMsgPerfil] = useState(null);

  // Contraseña
  const [passActual, setPassActual]   = useState("");
  const [passNueva, setPassNueva]     = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [msgPass, setMsgPass]         = useState(null);

  // Preferencias
  const [moneda, setMoneda]       = useState("COP");
  const [msgMoneda, setMsgMoneda] = useState(null);

  // Eliminar cuenta
  const [confirmDelete, setConfirmDelete] = useState("");
  const [msgDelete, setMsgDelete]         = useState(null);

  useEffect(() => {
    getMe().then(data => {
      setUsuario(data);
      setUsername(data.username);
      setEmail(data.email);
      setMoneda(data.currency);
    }).finally(() => setLoading(false));
  }, []);

  async function guardarPerfil() {
    setMsgPerfil(null);
    try {
      const updated = await actualizarPerfil({ username, email });
      setUsuario(updated);
      setMsgPerfil({ tipo: "ok", texto: "Perfil actualizado correctamente" });
    } catch (e) {
      const detail = e.response?.data?.detail || "Error al actualizar";
      setMsgPerfil({ tipo: "error", texto: detail });
    }
  }

  async function guardarPassword() {
    setMsgPass(null);
    if (passNueva !== passConfirm) {
      setMsgPass({ tipo: "error", texto: "Las contraseñas no coinciden" });
      return;
    }
    try {
      await cambiarPassword({ current_password: passActual, new_password: passNueva });
      setMsgPass({ tipo: "ok", texto: "Contraseña actualizada correctamente" });
      setPassActual(""); setPassNueva(""); setPassConfirm("");
    } catch (e) {
      const detail = e.response?.data?.detail || "Error al cambiar contraseña";
      setMsgPass({ tipo: "error", texto: detail });
    }
  }

  async function guardarMoneda() {
    setMsgMoneda(null);
    try {
      const updated = await actualizarMoneda(moneda);
      setUsuario(updated);
      setMsgMoneda({ tipo: "ok", texto: "Moneda actualizada correctamente" });
    } catch {
      setMsgMoneda({ tipo: "error", texto: "Error al actualizar moneda" });
    }
  }

  async function handleEliminar() {
    setMsgDelete(null);
    if (confirmDelete !== usuario?.username) {
      setMsgDelete({ tipo: "error", texto: "El nombre de usuario no coincide" });
      return;
    }
    try {
      await eliminarCuenta();
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch {
      setMsgDelete({ tipo: "error", texto: "Error al eliminar la cuenta" });
    }
  }

  if (loading) return <div className="db-empty"><span className="db-empty-icon">⚙️</span><p>Cargando...</p></div>;

  const SECCIONES = [
    { key: "perfil",       label: "Perfil",        icon: "👤" },
    { key: "seguridad",    label: "Seguridad",      icon: "🔒" },
    { key: "preferencias", label: "Preferencias",   icon: "🎨" },
    { key: "cuenta",       label: "Cuenta",         icon: "⚠️" },
  ];

  return (
    <div className="config-layout">
      {/* Sidebar de secciones */}
      <nav className="config-nav">
        {SECCIONES.map(s => (
          <button
            key={s.key}
            className={`config-nav-item ${seccion === s.key ? "activo" : ""}`}
            onClick={() => setSeccion(s.key)}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <div className="config-content">

        {seccion === "perfil" && (
          <div className="config-card">
            <h2 className="config-titulo">Perfil</h2>
            <p className="config-subtitulo">Actualiza tu nombre y correo electrónico</p>

            <label className="config-label">Nombre de usuario</label>
            <input className="config-input" value={username} onChange={e => setUsername(e.target.value)} />

            <label className="config-label">Correo electrónico</label>
            <input className="config-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />

            {msgPerfil && <p className={`config-msg ${msgPerfil.tipo}`}>{msgPerfil.texto}</p>}
            <button className="config-btn" onClick={guardarPerfil}>Guardar cambios</button>
          </div>
        )}

        {seccion === "seguridad" && (
          <div className="config-card">
            <h2 className="config-titulo">Seguridad</h2>
            <p className="config-subtitulo">Cambia tu contraseña</p>

            <label className="config-label">Contraseña actual</label>
            <input className="config-input" type="password" value={passActual} onChange={e => setPassActual(e.target.value)} />

            <label className="config-label">Nueva contraseña</label>
            <input className="config-input" type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} />

            <label className="config-label">Confirmar nueva contraseña</label>
            <input className="config-input" type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} />

            {msgPass && <p className={`config-msg ${msgPass.tipo}`}>{msgPass.texto}</p>}
            <button className="config-btn" onClick={guardarPassword}>Cambiar contraseña</button>
          </div>
        )}

        {seccion === "preferencias" && (
          <div className="config-card">
            <h2 className="config-titulo">Preferencias</h2>
            <p className="config-subtitulo">Configura tu moneda predeterminada</p>

            <label className="config-label">Moneda</label>
            <select className="config-input" value={moneda} onChange={e => setMoneda(e.target.value)}>
              {MONEDAS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {msgMoneda && <p className={`config-msg ${msgMoneda.tipo}`}>{msgMoneda.texto}</p>}
            <button className="config-btn" onClick={guardarMoneda}>Guardar preferencias</button>
          </div>
        )}

        {seccion === "cuenta" && (
          <div className="config-card">
            <h2 className="config-titulo danger">Eliminar cuenta</h2>
            <p className="config-subtitulo">Esta acción es irreversible. Se eliminarán todos tus datos.</p>

            <label className="config-label">
              Escribe <strong>{usuario?.username}</strong> para confirmar
            </label>
            <input className="config-input" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} />

            {msgDelete && <p className={`config-msg ${msgDelete.tipo}`}>{msgDelete.texto}</p>}
            <button className="config-btn danger" onClick={handleEliminar}>Eliminar mi cuenta</button>
          </div>
        )}

      </div>
    </div>
  );
}