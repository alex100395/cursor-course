import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ApiKey } from '../types/apiKey';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  };

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const response = await fetch('/api/validate-key', { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch API keys`);
      }
      const keys = await response.json();
      setApiKeys(keys);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch API keys. Make sure the dev server is running.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createApiKey = useCallback(
    async (name: string, key: string) => {
      try {
        setError(null);
        const headers = await getAuthHeaders();
        const response = await fetch('/api/validate-key', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, key }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to create API key`);
        }

        await fetchApiKeys();
        return true;
      } catch (err) {
        console.error('Error creating API key:', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to create API key. Make sure the dev server is running.';
        setError(errorMessage);
        return false;
      }
    },
    [fetchApiKeys]
  );

  const updateApiKey = useCallback(
    async (id: string, name: string, key: string) => {
      try {
        setError(null);
        const headers = await getAuthHeaders();
        const response = await fetch('/api/validate-key', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id, name, key }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update API key');
        }

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
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/validate-key?id=${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete API key');
        }

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
    // Only fetch API keys if we're in a browser environment
    if (typeof window !== 'undefined') {
      fetchApiKeys();
    }
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

