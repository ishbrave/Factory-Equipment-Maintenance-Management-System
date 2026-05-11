import { useEffect, useState } from 'react';
import api from '../api/axios';

export const useFetch = (url, { initialData = [], fallbackData = null } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(url);
        if (!canceled) {
          setData(response.data);
        }
      } catch (err) {
        if (!canceled) {
          setError(err);
          if (fallbackData !== null) {
            setData(fallbackData);
          }
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [url]);

  return { data, loading, error };
};
