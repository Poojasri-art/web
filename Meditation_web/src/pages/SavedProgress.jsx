import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, InboxIcon } from 'lucide-react';

const MODULES = ['focused_attention', 'working_memory', 'present_moment', 'cognitive_flexibility', 'emotional_regulation'];
const MODULE_TITLES = {
    focused_attention: 'Focused Attention',
    working_memory: 'Working Memory',
    present_moment: 'Present Moment',
    cognitive_flexibility: 'Cognitive Flexibility',
    emotional_regulation: 'Emotional Regulation',
};
const MODULE_COLORS = {
    focused_attention: '#FF3B30',
    working_memory: '#FF9500',
    present_moment: '#4CD964',
    cognitive_flexibility: '#5AC8FA',
    emotional_regulation: '#5856D6',
};

export default function SavedProgress() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [attempts, setAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = () => {
        setIsLoading(true);
        // Load from localStorage (same structure as Swift app but stored locally in web)
        const allRecords = JSON.parse(localStorage.getItem('savedProgress') || '[]');
        const dict = {};
        allRecords.forEach(r => {
            if (!dict[r.completionDate]) dict[r.completionDate] = [];
            dict[r.completionDate].push(r);
        });

        const sortedDates = Object.keys(dict).sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
        });

        const parsedAttempts = [];
        sortedDates.forEach(dateStr => {
            const records = dict[dateStr];
            const buckets = [];
            [...records].reverse().forEach(rec => {
                let placed = false;
                for (let i = 0; i < buckets.length; i++) {
                    if (!buckets[i].find(r => r.moduleType === rec.moduleType)) {
                        buckets[i].push(rec); placed = true; break;
                    }
                }
                if (!placed) buckets.push([rec]);
            });
            const fullBuckets = buckets.filter(b => b.length === 5);
            const total = fullBuckets.length;
            for (let idx = total - 1; idx >= 0; idx--) {
                parsedAttempts.push({
                    id: `${dateStr}-${idx}`,
                    displayTitle: total > 1 ? `${dateStr}-${idx + 1}` : dateStr,
                    date: dateStr,
                    records: fullBuckets[idx],
                });
            }
        });

        setAttempts(parsedAttempts);
        setIsLoading(false);
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <button style={s.backBtn} onClick={() => selectedAttempt ? setSelectedAttempt(null) : navigate('/home')}>
                    <ArrowLeft size={22} />
                </button>
                <span style={s.headerTitle}>📊 Tasks Overview</span>
                <div style={{ width: 38 }} />
            </header>

            {selectedAttempt && (
                <div style={s.subheading}>{selectedAttempt.displayTitle}</div>
            )}

            <div style={s.content}>
                {isLoading ? (
                    <div style={s.emptyState}>Loading...</div>
                ) : attempts.length === 0 && !selectedAttempt ? (
                    <div style={s.emptyState}>
                        <span style={{ fontSize: '64px' }}>📭</span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>No progress saved yet.</p>
                    </div>
                ) : selectedAttempt ? (
                    <div style={s.detailView}>
                        {MODULES.map(type => {
                            const record = selectedAttempt.records.find(r => r.moduleType === type);
                            return <ModuleProgressRow key={type} moduleType={type} record={record} />;
                        })}
                    </div>
                ) : (
                    <div style={s.listView}>
                        <p style={s.listHint}>Select a session to view progress:</p>
                        {attempts.map(attempt => (
                            <div key={attempt.id} style={s.attemptRow} onClick={() => setSelectedAttempt(attempt)}>
                                <div style={{ flex: 1 }}>
                                    <div style={s.attemptTitle}>{attempt.displayTitle}</div>
                                    <div style={{ color: attempt.records.length === 5 ? 'var(--success)' : 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                                        {attempt.records.length === 5 ? 'All Tasks Completed' : `Not Completed (${attempt.records.length}/5)`}
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--text-secondary)" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleProgressRow({ moduleType, record }) {
    const color = MODULE_COLORS[moduleType];
    return (
        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}20`, marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px' }}>●</span>
                </div>
                <span style={{ fontWeight: '700', flex: 1 }}>{MODULE_TITLES[moduleType]}</span>
                {record && <CheckCircle2 size={18} color="#5AC8FA" />}
            </div>
            {record ? (
                <>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <StatBox title="Percentage" val={`${Math.round(record.percentageScore)}%`} color={color} />
                        <StatBox title="Daily Progress" val={`${Math.round(record.dailyProgress)}%`} color="#5AC8FA" />
                        <StatBox title="Task Score" val={`${Math.round(record.taskScore)}%`} color="#FF9500" />
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: 10 }, (_, i) => (
                            <div key={i} style={{ flex: 1, height: '8px', borderRadius: '2px', background: i < Math.floor(record.dailyProgress / 10) ? color : 'var(--background)' }} />
                        ))}
                    </div>
                </>
            ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not completed today</p>
            )}
        </div>
    );
}

function StatBox({ title, val, color }) {
    return (
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '15px', color }}>{val}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{title}</div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    headerTitle: { fontSize: '20px', fontWeight: '700' },
    subheading: { padding: '12px 20px', background: 'var(--surface)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid rgba(0,0,0,0.05)' },
    content: { maxWidth: '800px', margin: '0 auto', padding: '32px 40px' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' },
    detailView: { display: 'flex', flexDirection: 'column' },
    listView: { display: 'flex', flexDirection: 'column' },
    listHint: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' },
    attemptRow: { display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--surface)', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    attemptTitle: { fontSize: '16px', fontWeight: '700' },
};
