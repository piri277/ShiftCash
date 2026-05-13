import { useState, useEffect } from 'react';
import { getCategorias } from '../api/transactions';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .finally(() => setLoadingCats(false));
  }, []);

  return { categorias, loadingCats };
}