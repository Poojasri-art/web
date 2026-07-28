import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export default function ProgressDashboard() {
    const navigate = useNavigate();
    const records = JSON.parse(localStorage.getItem('savedProgress') || '[]');

    const moduleColors = {
        focused_attention: '#FF3B30',
        working_memory: '#FF9500',
        present_moment: '#4CD964',
        cognitive_flexibility: '#5AC8FA',
        emotional_regulation: '#5856D6',
    };
    const moduleTitles = {
        focused_attention: 'Attention',
        working_memory: 'Memory',
        present_moment: 'Presence',
        cognitive_flexibility: 'Flexibility',
        emotional_regulation: 'Emotion',
    };

    const dailyScores = {};
    records.forEach(r => {
        if (!dailyScores[r.moduleType]) dailyScores[r.moduleType] = {};
        const dateKey = r.completionDate || 'unknown';
        if (!dailyScores[r.moduleType][dateKey]) dailyScores[r.moduleType][dateKey] = [];
        dailyScores[r.moduleType][dateKey].push(r);
    });

    const maxByModule = Object.entries(dailyScores).map(([type, dates]) => {
        const validDayScores = [];
        
        Object.values(dates).forEach(dayRecords => {
            // Find core task (has valid taskScore and 100% dailyProgress state from the app)
            const coreRecord = dayRecords.find(r => typeof r.taskScore === 'number' && r.taskScore > 0 && Number(r.dailyProgress) === 100);
            // Find daily evaluation task
            const dailyRecord = dayRecords.find(r => r.source === 'daily_evaluation');

            // Strictly check that BOTH tasks are completed
            if (coreRecord && dailyRecord) {
                const coreScore = Math.round(coreRecord.percentageScore || 0);
                const dailyScore = Math.round(dailyRecord.percentageScore || 0);
                // Calculate average (combined standard)
                validDayScores.push((coreScore + dailyScore) / 2);
            }
        });

        return {
            type,
            maxScore: validDayScores.length > 0 ? Math.round(Math.max(...validDayScores)) : 0,
        };
    });

    return (
        <div style={s.container}>
            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
                <span style={s.title}>Progress Overview</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={s.content}>
                {maxByModule.length === 0 ? (
                    <div style={s.empty}>
                        <TrendingUp size={64} color="rgba(0,0,0,0.1)" />
                        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Complete some modules to see progress here.</p>
                    </div>
                ) : (
                    <div style={s.graphCard}>
                        <div style={s.bars}>
                            {maxByModule.map(({ type, maxScore }) => (
                                <div key={type} style={s.barWrap}>
                                    <div style={{ ...s.bar, height: `${maxScore * 1.5}px`, background: moduleColors[type] }}>
                                        <span style={s.barLabel}>{maxScore}%</span>
                                    </div>
                                    <span style={s.barTitle}>{moduleTitles[type]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={s.recordsList}>
                    {records.slice(-10).reverse().map((r, i) => (
                        <div key={i} style={s.recordRow}>
                            <div style={{ ...s.dot, background: moduleColors[r.moduleType] || 'var(--primary)' }} />
                            <div style={{ flex: 1 }}>
                                <span style={s.recordModule}>{moduleTitles[r.moduleType] || r.moduleType}</span>
                                <span style={s.recordDate}> · {r.completionDate}</span>
                            </div>
                            <span style={{ color: moduleColors[r.moduleType] || 'var(--primary)', fontWeight: '700', fontSize: '15px' }}>
                                {Math.round(r.percentageScore)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    title: { fontSize: '19px', fontWeight: '800' },
    content: { maxWidth: '600px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' },
    graphCard: { background: 'var(--surface)', borderRadius: '24px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
    bars: { display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px' },
    barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' },
    bar: { width: '32px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '2px', transition: 'height 0.6s ease' },
    barLabel: { fontSize: '10px', fontWeight: '700', color: '#fff' },
    barTitle: { fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' },
    recordsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    recordRow: { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '14px 16px', borderRadius: '14px' },
    dot: { width: '10px', height: '10px', borderRadius: '5px', flexShrink: 0 },
    recordModule: { fontWeight: '600', fontSize: '14px' },
    recordDate: { color: 'var(--text-secondary)', fontSize: '12px' },
};
