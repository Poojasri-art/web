import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Play } from 'lucide-react';

// Simulated 21-day timetable data matching the iOS app's structure
const SAMPLE_TIMETABLE = Array.from({ length: 21 }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} Session`,
    description: i % 3 === 0 ? 'Deep Focus' : i % 3 === 1 ? 'Mindful Breathing' : 'Cognitive Flow',
    audioURL: i % 2 === 0
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
}));

export default function TimetableList() {
    const navigate = useNavigate();
    const [timetable] = useState(SAMPLE_TIMETABLE);

    return (
        <div style={s.container}>
            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate('/home')}><ArrowLeft size={22} /></button>
                <span style={s.title}>Your 21-Day Timetable</span>
                <div style={{ width: 38 }} />
            </header>

            {timetable.length === 0 ? (
                <div style={s.empty}>
                    <span style={{ fontSize: '64px' }}>📅</span>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontWeight: '600' }}>No timetable found.</p>
                    <button style={s.startBtn} onClick={() => navigate('/task/nback')}>Start Assessment</button>
                </div>
            ) : (
                <div style={s.content}>
                    <div style={s.grid}>
                        {timetable.map((item, idx) => (
                            <div
                                key={idx}
                                style={s.card}
                                className="hover-lift"
                                onClick={() => navigate('/session', { state: { audioURL: item.audioURL, audioTitle: item.title, audioDesc: item.description, sessionIndex: idx } })}
                            >
                                <div style={s.cardHeader}>
                                    <div style={s.dayBadge}>
                                        <span style={s.dayNum}>{item.day}</span>
                                    </div>
                                    <Play size={20} color="var(--primary)" fill="var(--primary)" />
                                </div>
                                <div style={s.cardBody}>
                                    <span style={s.rowTitle}>{item.title}</span>
                                    <span style={s.rowDesc}>{item.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    title: { fontSize: '20px', fontWeight: '800' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 40px', paddingBottom: '80px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: {
        background: 'var(--surface)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    dayBadge: { width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    dayNum: { fontWeight: '800', fontSize: '16px', color: 'var(--primary)' },
    cardBody: { display: 'flex', flexDirection: 'column', gap: '4px' },
    rowTitle: { fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' },
    rowDesc: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' },
    startBtn: { marginTop: '24px', background: 'var(--primary-gradient)', color: '#fff', padding: '16px 36px', borderRadius: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-md)' },
};
