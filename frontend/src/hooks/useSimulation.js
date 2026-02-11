import { useState, useCallback } from 'react';
import { simulate } from '../api/client';

export default function useSimulation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulate(params);
      setData(result);
    } catch (err) {
      setError(err.message || 'シミュレーションに失敗しました');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, run, clear };
}
