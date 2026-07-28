import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

const MODULES = {
    focused_attention: { title: 'Focused Attention', color: '#FF3B30', emoji: '🎯' },
    working_memory: { title: 'Working Memory', color: '#FF9500', emoji: '🧩' },
    present_moment: { title: 'Present Moment', color: '#4CD964', emoji: '🌿' },
    cognitive_flexibility: { title: 'Cognitive Flexibility', color: '#5AC8FA', emoji: '🔄' },
    emotional_regulation: { title: 'Emotional Regulation', color: '#5856D6', emoji: '💜' },
};

export default function ModuleIntro() {
    const { type } = useParams();
    const navigate = useNavigate();
    const mod = MODULES[type] || MODULES.focused_attention;

    return (
        <div style={{ ...s.container, background: `${mod.color}12` }}>
            <div style={s.closeRow}>
                <button style={s.closeBtn} onClick={() => navigate('/home')}>
                    <X size={24} color="#8e8e93" />
                </button>
            </div>

            <div style={s.body}>
                <div style={{ ...s.iconCircle, background: `${mod.color}30`, boxShadow: `0 10px 30px ${mod.color}40` }}>
                    <span style={{ fontSize: '64px' }}>{mod.emoji}</span>
                </div>

                <h1 style={s.title}>{mod.title}</h1>
                <p style={s.desc}>
                    Welcome to {mod.title}. We'll guide you through techniques to improve your mind and cognitive performance.
                </p>

                <button
                    style={{ ...s.beginBtn, background: mod.color, boxShadow: `0 8px 24px ${mod.color}50` }}
                    onClick={() => navigate(`/module/${type}`)}
                >
                    Begin Module
                </button>
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    closeRow: { padding: '20px' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
    body: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '24px', maxWidth: '420px', margin: '0 auto', width: '100%' },
    iconCircle: { width: '120px', height: '120px', borderRadius: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: '32px', fontWeight: '800' },
    desc: { fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 },
    beginBtn: { width: '100%', padding: '18px', borderRadius: '16px', color: '#fff', fontSize: '17px', fontWeight: '700', border: 'none', cursor: 'pointer' }
};
