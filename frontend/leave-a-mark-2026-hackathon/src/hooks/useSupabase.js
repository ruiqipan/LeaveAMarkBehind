import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook for Supabase queries with loading and error states
 * @param {Function} queryFn - Async function that performs the query
 * @param {Array} dependencies - Dependencies array for re-running query
 * @returns {object} Query state
 */
export const useSupabaseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  const refetch = useCallback(() => {
    executeQuery();
  }, [executeQuery]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Custom hook for Supabase mutations (insert, update, delete)
 * @returns {object} Mutation function and state
 */
export const useSupabaseMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (mutationFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      console.error('Mutation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
};

/**
 * Custom hook for subscribing to real-time changes
 * @param {string} table - Table name
 * @param {Function} onInsert - Callback for inserts
 * @param {Function} onUpdate - Callback for updates
 * @param {Function} onDelete - Callback for deletes
 * @param {object} filter - Optional filter for subscription
 * @returns {object} Subscription state
 */
export const useSupabaseSubscription = (
  table,
  { onInsert, onUpdate, onDelete } = {},
  filter = null
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    try {
      const channel = supabase.channel(`${table}_changes`);

      if (filter) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload.new);
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload.new, payload.old);
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload.old);
            }
          }
        );
      } else {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload.new);
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload.new, payload.old);
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload.old);
            }
          }
        );
      }

      subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        } else if (status === 'CLOSED') {
          setIsSubscribed(false);
        }
      });
    } catch (err) {
      setError(err);
      console.error('Subscription error:', err);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
        setIsSubscribed(false);
      }
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);

  return {
    isSubscribed,
    error,
  };
};

export default {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseSubscription,
};
