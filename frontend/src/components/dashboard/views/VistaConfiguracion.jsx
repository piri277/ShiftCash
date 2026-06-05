import { useState, useEffect, useRef } from "react";
import {
  getMe, actualizarPerfil, cambiarPassword, actualizarMoneda,
  eliminarCuenta, subirFotoPerfil, eliminarFotoPerfil
} from "../../../api/profile";
import "../../../styles/config.css";
import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../hooks/useAuth";
import { User, Lock, Palette, AlertTriangle, LogOut, Camera, Trash2 } from "lucide-react";

const MONEDAS = ["COP", "USD", "EUR", "MXN", "ARS", "BRL"];

export default function VistaConfiguracion() {
  const { theme, toggleTheme } = useTheme();
  const { updateUser } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState("perfil");

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [msgPerfil, setMsgPerfil] = useState(null);

  const [fotoPreview, setFotoPreview] = useState(null);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const fileInputRef = useRef(null);

  const [passActual, setPassActual]   = useState("");
  const [passNueva, setPassNueva]     = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [msgPass, setMsgPass]         = useState(null);

  const [moneda, setMoneda]       = useState("COP");
  const [msgMoneda, setMsgMoneda] = useState(null);
  const [notifThreshold, setNotifThreshold] = useState(() =>
    localStorage.getItem("budget_threshold") || "80"
  );

  const [confirmDelete, setConfirmDelete] = useState("");
  const [msgDelete, setMsgDelete]         = useState(null);

  // Carga datos frescos del servidor y sincroniza el contexto
  useEffect(() => {
    getMe().then(data => {
      setUsuario(data);
      setUsername(data.username ?? "");
      setEmail(data.email ?? "");
      setMoneda(data.currency ?? "COP");
      // Cache-bust la foto al cargar para evitar imagen antigua cacheada
      setFotoPreview(data.profile_pic ? `${data.profile_pic}?t=${Date.now()}` : null);
      updateUser(data);
    }).finally(() => setLoading(false));
  }, []);

  // ── Foto ──────────────────────────────────────────────
  async function handleSeleccionarFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Muestra preview local inmediato mientras sube
    const localPreview = URL.createObjectURL(file);
    setFotoPreview(localPreview);
    setLoadingFoto(true);
    setMsgPerfil(null);
    try {
      const updated = await subirFotoPerfil(file);
      // Cache-bust para que el browser no sirva la imagen vieja
      const urlFinal = updated.profile_pic
        ? `${updated.profile_pic}?t=${Date.now()}`
        : null;
      const updatedConUrl = { ...updated, profile_pic: urlFinal };
      setUsuario(updatedConUrl);
      setFotoPreview(urlFinal);
      updateUser(updatedConUrl); // actualiza contexto → sidebar se re-renderiza
      setMsgPerfil({ tipo: "ok", texto: "Foto actualizada correctamente" });
    } catch {
      setMsgPerfil({ tipo: "error", texto: "Error al subir la foto" });
      // Restaura la foto anterior (la que tenía el usuario antes de intentar)
      setFotoPreview(usuario?.profile_pic ?? null);
    } finally {
      setLoadingFoto(false);
      e.target.value = "";
    }
  }

  async function handleEliminarFoto() {
    if (!usuario?.profile_pic) return;
    setLoadingFoto(true);
    setMsgPerfil(null);
    try {
      const updated = await eliminarFotoPerfil();
      const updatedSinFoto = { ...updated, profile_pic: null };
      setUsuario(updatedSinFoto);
      setFotoPreview(null);
      updateUser(updatedSinFoto); // actualiza contexto → sidebar vuelve a iniciales
      setMsgPerfil({ tipo: "ok", texto: "Foto eliminada" });
    } catch {
      setMsgPerfil({ tipo: "error", texto: "Error al eliminar la foto" });
    } finally {
      setLoadingFoto(false);
    }
  }

  // ── Perfil ────────────────────────────────────────────
  async function guardarPerfil() {
    setMsgPerfil(null);
    try {
      const updated = await actualizarPerfil({ username, email });
      // Preserva la URL de foto con cache-bust que ya teníamos en el estado local
      const updatedConFoto = { ...updated, profile_pic: usuario?.profile_pic ?? updated.profile_pic };
      setUsuario(updatedConFoto);
      updateUser(updatedConFoto);
      setMsgPerfil({ tipo: "ok", texto: "Perfil actualizado correctamente" });
    } catch (e) {
      setMsgPerfil({ tipo: "error", texto: e.response?.data?.detail || "Error al actualizar" });
    }
  }

  // ── Contraseña ────────────────────────────────────────
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
      setMsgPass({ tipo: "error", texto: e.response?.data?.detail || "Error al cambiar contraseña" });
    }
  }

  // ── Preferencias ──────────────────────────────────────
  async function guardarMoneda() {
    setMsgMoneda(null);
    try {
      const updated = await actualizarMoneda(moneda);
      localStorage.setItem("budget_threshold", notifThreshold);
      setUsuario(updated);
      updateUser(updated);
      setMsgMoneda({ tipo: "ok", texto: "Preferencias guardadas correctamente" });
    } catch {
      setMsgMoneda({ tipo: "error", texto: "Error al actualizar moneda" });
    }
  }

  // ── Eliminar cuenta ───────────────────────────────────
  async function handleEliminar() {
    setMsgDelete(null);
    if (confirmDelete !== usuario?.username) {
      setMsgDelete({ tipo: "error", texto: "El nombre de usuario no coincide" });
      return;
    }
    try {
      await eliminarCuenta();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch {
      setMsgDelete({ tipo: "error", texto: "Error al eliminar la cuenta" });
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  if (loading) return (
    <div className="db-empty">
      <span className="db-empty-icon">⚙️</span>
      <p>Cargando...</p>
    </div>
  );

  const SECCIONES = [
    { key: "perfil",       label: "Perfil",       icon: User },
    { key: "seguridad",    label: "Seguridad",     icon: Lock },
    { key: "preferencias", label: "Preferencias",  icon: Palette },
    { key: "cuenta",       label: "Cuenta",        icon: AlertTriangle },
    { key: "logout",       label: "Cerrar sesión", icon: LogOut },
  ];

  const iniciales = usuario?.username
    ? usuario.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="config-layout">
      <nav className="config-nav">
        {SECCIONES.map(s => {
          const Icon = s.icon;
          const isLogout = s.key === "logout";
          return (
            <button
              key={s.key}
              className={`config-nav-item ${seccion === s.key ? "activo" : ""} ${isLogout ? "config-nav-item-logout" : ""}`}
              onClick={isLogout ? handleLogout : () => setSeccion(s.key)}
              title={s.label}
            >
              <Icon size={20} strokeWidth={seccion === s.key ? 2.5 : 1.8} />
              <span className="config-nav-label">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="config-content">

        {seccion === "perfil" && (
          <div className="config-card">
            <h2 className="config-titulo">Perfil</h2>
            <p className="config-subtitulo">Actualiza tu foto, nombre y correo electrónico</p>

            <div className="config-avatar-wrapper">
              <div className="config-avatar">
                {fotoPreview
                  ? <img src={fotoPreview} alt="Foto de perfil" className="config-avatar-img" />
                  : <span className="config-avatar-initials">{iniciales}</span>
                }
                {loadingFoto && <div className="config-avatar-overlay"><span>⏳</span></div>}
              </div>

              <div className="config-avatar-actions">
                <button
                  className="config-btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loadingFoto}
                  title="Cambiar foto"
                >
                  <Camera size={16} />
                  <span>{fotoPreview ? "Cambiar foto" : "Subir foto"}</span>
                </button>

                {fotoPreview && (
                  <button
                    className="config-btn-icon danger"
                    onClick={handleEliminarFoto}
                    disabled={loadingFoto}
                    title="Eliminar foto"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar foto</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSeleccionarFoto}
              />
            </div>

            <label className="config-label">Nombre de usuario</label>
            <input
              className="config-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <label className="config-label">Correo electrónico</label>
            <input
              className="config-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            {msgPerfil && (
              <p className={`config-msg ${msgPerfil.tipo}`}>{msgPerfil.texto}</p>
            )}
            <button className="config-btn" onClick={guardarPerfil}>
              Guardar cambios
            </button>
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
            <h3 className="config-titulo">Preferencias</h3>
            <p className="config-subtitulo">Apariencia y moneda predeterminada</p>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div>
                <div className="config-label" style={{ marginBottom:2 }}>
                  {theme === "dark" ? "🌙 Tema oscuro" : "☀️ Tema claro"}
                </div>
                <div style={{ fontSize:"0.78rem", color:"var(--text-faint, #555e82)" }}>
                  {theme === "dark" ? "Cambia al tema claro" : "Cambia al tema oscuro"}
                </div>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Cambiar tema"
                style={{
                  width:48, height:26, borderRadius:99, border:"none",
                  cursor:"pointer", position:"relative",
                  background: theme === "dark" ? "rgba(91,110,245,0.25)" : "rgba(91,110,245,0.55)",
                  transition:"background 0.25s", flexShrink:0,
                }}
              >
                <span style={{
                  position:"absolute", top:4,
                  left: theme === "dark" ? 4 : 22,
                  width:18, height:18, borderRadius:"50%",
                  background: theme === "dark" ? "#8b93bc" : "#fff",
                  transition:"left 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:10,
                }}>
                  {theme === "dark" ? "🌙" : "☀️"}
                </span>
              </button>
            </div>

            <label className="config-label">Moneda</label>
            <select className="config-input" value={moneda} onChange={e => setMoneda(e.target.value)}>
              {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div className="config-range-group">
              <div className="config-range-header">
                <label className="config-label">Umbral de alerta de presupuesto</label>
                <span className="config-range-value">{notifThreshold}%</span>
              </div>
              <input
                type="range" className="config-range"
                min="50" max="100" step="5"
                value={notifThreshold}
                onChange={e => setNotifThreshold(e.target.value)}
              />
              <p className="config-subtitulo" style={{ marginTop:0 }}>
                Se te avisará cuando tus gastos alcancen este porcentaje del presupuesto.
              </p>
            </div>

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