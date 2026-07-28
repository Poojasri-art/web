import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncBackendProgress = async (email) => {
        try {
            const MODULES = ['focused_attention', 'working_memory', 'present_moment', 'cognitive_flexibility', 'emotional_regulation'];
            MODULES.forEach(m => {
                localStorage.removeItem(`${m}_last_assessment_score`);
                localStorage.removeItem(`${m}_last_task_score`);
                localStorage.removeItem(`${m}_pre_done`);
                localStorage.removeItem(`${m}_done`);
            });

            const data = await api.getProgress(email);
            if (data && data.records) {
                // Normalize and optionally clean up problematic date ranges.
                const records = Array.isArray(data.records) ? data.records.slice() : [];

                // Helper to parse completionDate strings like '6/05/26', '06/05/2026', etc.
                const parseDate = (s) => {
                    if (!s || typeof s !== 'string') return null;
                    const norm = s.trim().replace(/[-.]/g, '/');
                    const parts = norm.split('/');
                    if (parts.length < 3) return null;
                    let [d, m, y] = parts.map(p => p.trim());
                    if (y.length === 2) { y = Number(y) < 50 ? '20' + y : '19' + y; }
                    if (d.length === 1) d = '0' + d;
                    if (m.length === 1) m = '0' + m;
                    const iso = `${y}-${m}-${d}`;
                    const dt = new Date(iso);
                    return isNaN(dt.getTime()) ? null : dt;
                };

                // One-time cleanup: remove records from 06/05/2026 to 08/05/2026 (inclusive)
                const start = parseDate('6/05/26');
                const end = parseDate('8/05/26');
                if (start && end) {
                    start.setHours(0,0,0,0);
                    end.setHours(23,59,59,999);
                    const backupKey = 'savedProgress_backup_before_cleanup_2026-05-08';
                    try {
                        const existingLocal = JSON.parse(localStorage.getItem('savedProgress') || '[]');
                        // backup only once
                        if (!localStorage.getItem(backupKey)) localStorage.setItem(backupKey, JSON.stringify(existingLocal));
                    } catch (e) { /* ignore backup errors */ }

                    const filtered = records.filter(r => {
                        const cd = parseDate(r.completionDate);
                        if (!cd) return true; // keep if we can't parse
                        return !(cd >= start && cd <= end);
                    });
                    localStorage.setItem('savedProgress', JSON.stringify(filtered));
                } else {
                    localStorage.setItem('savedProgress', JSON.stringify(records));
                }
            }
        } catch (e) {
            console.error('Failed to sync progress on login', e);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                await syncBackendProgress(parsed.email);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.login(email, password);
            if (res.status === 'success') {
                const userData = { email: res.email, username: res.username || res.email.split('@')[0], user_id: res.user_id };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                await syncBackendProgress(userData.email);
                return true;
            }
            throw new Error(res.message);
        } catch (e) {
            throw e;
        }
    };

    const updateUser = (fields) => {
        setUser(prev => {
            const updated = { ...prev, ...fields };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('savedProgress');

        const MODULES = ['focused_attention', 'working_memory', 'present_moment', 'cognitive_flexibility', 'emotional_regulation'];
        MODULES.forEach(m => {
            localStorage.removeItem(`${m}_last_assessment_score`);
            localStorage.removeItem(`${m}_last_task_score`);
            localStorage.removeItem(`${m}_pre_done`);
            localStorage.removeItem(`${m}_done`);
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
