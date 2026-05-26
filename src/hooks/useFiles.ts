import { useState, useEffect } from 'react';
import { DatasetFiles, StatusData } from '../types';

export function useFiles() {
  const [data, setData] = useState<DatasetFiles | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [filesRes, statusRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/status')
        ]);

        if (!filesRes.ok || !statusRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const filesData = await filesRes.json();
        const statusData = await statusRes.json();

        setData(filesData);
        setStatus(statusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, status, loading, error };
}
