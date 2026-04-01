'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useVault = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/vault');
            setEntries(response.data.data.entries);
            setError(null);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addEntry = async (entry: any) => {
        try {
            // Preparing for Phase 2: 'entry' may already contain { password, iv }
            const response = await api.post('/vault', entry);
            setEntries((prev) => [response.data.data.entry, ...prev]);
            return true;
        } catch (err: any) {
            setError(err);
            return false;
        }
    };


    const deleteEntry = async (id: string) => {
        try {
            await api.delete(`/vault/${id}`);
            setEntries((prev) => prev.filter((e) => e._id !== id));
            return true;
        } catch (err: any) {
            setError(err);
            return false;
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    return { entries, loading, error, addEntry, deleteEntry, refresh: fetchEntries };
};
