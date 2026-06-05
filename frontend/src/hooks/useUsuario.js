// hooks/useUsuario.js
import { useState, useEffect } from "react";
import { getMe } from "../api/profile";

export function useUsuario() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    getMe().then(setUsuario).catch(() => {});

    function onActualizado(e) {
      setUsuario(e.detail);
    }
    window.addEventListener("perfil-actualizado", onActualizado);
    return () => window.removeEventListener("perfil-actualizado", onActualizado);
  }, []);

  return usuario;
}