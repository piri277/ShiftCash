import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

// ─────────────────────────────────────────────────────────────────────────────
// Login — Inputs controlados con useState, validación básica antes de navegar
// Cuando llegue el backend: reemplazar el bloque "TODO" en handleSubmit
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    setError(""); // limpia el error al escribir
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    // TODO: reemplazar con llamada a la API de autenticación
    // Ejemplo futuro:
    //   const res = await authService.login(form.email, form.password);
    //   if (!res.ok) { setError(res.message); return; }
    console.log("Iniciando sesión con:", form.email);
    navigate("/dashboard");
  };

  return (
    <div id="fondo">
      <section className="form-section" id="principal">
        <div className="container text-center" id="tarjeta">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Ingresa tu correo electrónico"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mensaje de error visible solo cuando hay un problema */}
            {error && (
              <p className="text-danger small mb-2">{error}</p>
            )}

            <button type="submit" className="btn" id="btn-iniciar-sesion">
              Iniciar Sesión
            </button>
          </form>

          <div className="container text-center mt-3">
            <p>
              ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}