import { useState, useEffect, useCallback } from 'react';
import { apiKeysService } from '../lib/apiKeysService';
import type { ApiKey } from '../types/apiKey';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const keys = await apiKeysService.fetchAll();
      setApiKeys(keys);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createApiKey = useCallback(
    async (name: string, key: string) => {
      try {
        setError(null);
        await apiKeysService.create(name, key);
        await fetchApiKeys();
        return true;
      } catch (err) {
        console.error('Error creating API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to create API key');
        return false;
      }
    },
    [fetchApiKeys]
  );

  const updateApiKey = useCallback(
    async (id: string, name: string, key: string) => {
      try {
        setError(null);
        await apiKeysService.update(id, name, key);
        await fetchApiKeys();
        return true;
      } catch (err) {
        console.error('Error updating API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to update API key');
        return false;
      }
    },
    [fetchApiKeys]
  );

  const deleteApiKey = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await apiKeysService.delete(id);
        await fetchApiKeys();
        return true;
      } catch (err) {
        console.error('Error deleting API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete API key');
        return false;
      }
    },
    [fetchApiKeys]
  );

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return {
    apiKeys,
    isLoading,
    error,
    setError,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
}

