import { useState, useEffect, useCallback } from 'react';
import { getCategorias } from '../api/categories';

export function useCategoriasCRUD() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const cargarCategorias = useCallback(async (isMounted) => {
    try {
      const data = await getCategorias();
      if (isMounted) {
        setCategorias(data);
        setError(null);
      }
    } catch {
      if (isMounted) setError('No se pudieron cargar las categorías');
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const inicializar = async () => {
      if (refresh > 0) setLoading(true);
      await cargarCategorias(activo);
    };

    inicializar();

    return () => { activo = false; };
  }, [refresh, cargarCategorias]);

  const recargar = () => setRefresh(p => p + 1);

  const predeterminadas = categorias.filter(c => c.is_default === 1);
  const personalizadas = categorias.filter(c => c.is_default === 0);

  return { predeterminadas, personalizadas, loading, error, recargar };
}