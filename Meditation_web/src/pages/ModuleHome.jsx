import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ArrowLeft, Play, BrainCircuit, CheckCircle2, Target, Puzzle, Leaf, Repeat, Heart } from 'lucide-react';

const MODULES = {
    focused_attention: { title: 'Focused Attention', color: '#FF3B30', taskRoute: '/task/nback', icon: Target },
    working_memory: { title: 'Working Memory', color: '#FF9500', taskRoute: '/task/sart', icon: Puzzle },
    present_moment: { title: 'Present Moment', color: '#4CD964', taskRoute: '/task/srt', icon: Leaf },
    cognitive_flexibility: { title: 'Cognitive Flexibility', color: '#5AC8FA', taskRoute: '/task/stroop', icon: Repeat },
    emotional_regulation: { title: 'Emotional Regulation', color: '#5856D6', taskRoute: '/task/switch', icon: Heart },
};

const QUESTIONS_BY_MODULE = {
    focused_attention: [
        "I find it hard to stay focused on one task for a long time.",
        "My mind wanders while doing important work.",
        "I get distracted easily by small noises or thoughts.",
        "I struggle to bring my attention back when it drifts.",
        "I lose concentration even during simple activities.",
    ],
    working_memory: [
        "I forget instructions quickly after hearing them.",
        "I struggle to remember things while doing another task.",
        "I lose track of what I was thinking about.",
        "I forget tasks I planned to do during the day.",
        "I find it hard to hold information in my mind briefly.",
    ],
    present_moment: [
        "I think more about the past than the present.",
        "I worry about the future frequently.",
        "I find it hard to enjoy the present moment.",
        "My thoughts pull away from what I am doing now.",
        "I do activities without being fully aware of them.",
    ],
    cognitive_flexibility: [
        "I struggle to adapt when plans suddenly change.",
        "I find it hard to see situations from different perspectives.",
        "I get stuck on one way of thinking.",
        "I feel uncomfortable when things are uncertain.",
        "I find it difficult to shift my attention between tasks.",
    ],
    emotional_regulation: [
        "I react strongly to small problems.",
        "I find it hard to calm down when upset.",
        "My emotions control my behavior sometimes.",
        "I struggle to manage stress effectively.",
        "I feel overwhelmed by emotions frequently.",
    ],
};

export default function ModuleHome() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isPreDone, setIsPreDone] = useState(false);

    const mod = MODULES[type] || MODULES.focused_attention;
    const questions = QUESTIONS_BY_MODULE[type] || QUESTIONS_BY_MODULE.focused_attention;

    useEffect(() => {
        window.scrollTo(0, 0);
        const done = localStorage.getItem(`${type}_pre_done`) === 'true';
        setIsPreDone(done);

        const fetchAudios = async () => {
            try {
                const data = await api.getAudios(type);
                setSessions(data);
            } catch (e) {
                setSessions([
                    { title: 'Guided Relaxation', description: 'A soothing session for beginners.', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { title: 'Deep Focus', description: 'Enhance your concentration.', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                ]);
            }
        };
        fetchAudios();
    }, [type]);

    const handleRating = (qIndex, rating) => {
        setAnswers(prev => ({ ...prev, [qIndex]: rating }));
    };

    const savePreAssessment = async () => {
        if (Object.keys(answers).length < 5) return;
        setIsSaving(true);

        const total = Object.values(answers).reduce((a, b) => a + b, 0);
        const pct = Math.round((total / 30) * 100);

        try {
            const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
            await api.saveProgress(user.email, type, pct, 0, 0, today);
            localStorage.setItem(`${type}_pre_done`, 'true');
            localStorage.setItem(`${type}_last_assessment_score`, pct);
            setIsPreDone(true);
            // Also persist the daily evaluation into local savedProgress so the web
            // can pair core training and daily evaluation by completionDate (like iOS)
            try {
                const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
                existing.push({ moduleType: type, percentageScore: pct, taskScore: 0, dailyProgress: 0, completionDate: today, source: 'daily_evaluation' });
                localStorage.setItem('savedProgress', JSON.stringify(existing));
                // Notify other parts of the app (Home) that savedProgress has changed
                try { window.dispatchEvent(new Event('savedProgressUpdated')); } catch (e) { /* ignore */ }
            } catch (e) { console.error('Could not persist daily evaluation locally', e); }
        } catch (e) { console.error(e); }

        setIsSaving(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const isFormComplete = Object.keys(answers).length === questions.length;

    return (
        <div style={s.container}>
            {/* Header */}
            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate('/home')}>
                    <ArrowLeft size={22} color={mod.color} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={s.title}>{mod.title}</h1>
                    <p style={s.subtitle}>Your cognitive journey</p>
                </div>
                <div style={{ ...s.iconCircle, background: `${mod.color}20`, color: mod.color }}>
                    <mod.icon size={26} strokeWidth={2.5} />
                </div>
            </header>

            <div style={s.content}>
                <div style={s.desktopGridContainer}>
                    {/* Section 1: Enhanced Attention */}
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>1️⃣ Core Training</h2>

                        {/* Cognitive Task Card */}
                        <div
                            style={{ ...s.taskCard, background: `${mod.color}15` }}
                            className="pressable card"
                            onClick={() => navigate(mod.taskRoute, { state: { moduleType: type } })}
                        >
                            <div style={{ ...s.taskIcon, background: mod.color }}>
                                <BrainCircuit size={24} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={s.taskTitle}>Cognitive Challenge</h3>
                                <p style={s.taskSubtitle}>Enhance your {mod.title}</p>
                            </div>
                            <Play size={20} color={mod.color} fill={mod.color} />
                        </div>

                        {/* Audio Sessions */}
                        <h3 style={s.sessionsLabel}>Guided Sessions</h3>
                        {sessions.map((session, i) => (
                            <div
                                key={i}
                                style={s.sessionRow}
                                className="pressable card"
                                onClick={() => navigate('/session', {
                                    state: { audioURL: session.url || '', audioTitle: session.title, audioDesc: session.description, sessionIndex: i }
                                })}
                            >
                                <div style={s.sessionIdx}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={s.sessionTitle}>{session.title}</div>
                                    <div style={s.sessionSubtitle}>{session.description}</div>
                                </div>
                                <Play size={28} color="var(--primary)" fill="var(--primary)" />
                            </div>
                        ))}
                    </section>

                    {/* Section 2: Pre-Assessment */}
                    <section style={s.section}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={s.sectionTitle}>2️⃣ Daily Evaluation</h2>
                            {isPreDone && <CheckCircle2 size={24} color="var(--success)" strokeWidth={2.5} />}
                        </div>

                        {questions.map((q, qi) => (
                            <div key={qi} style={s.questionCard} className="card">
                                <p style={s.questionText}>{qi + 1}. {q}</p>
                                <div style={s.ratingRow}>
                                    {[1, 2, 3, 4, 5, 6].map(r => (
                                        <button
                                            key={r}
                                            className="pressable"
                                            onClick={() => handleRating(qi, r)}
                                            style={{
                                                ...s.ratingBtn,
                                                background: answers[qi] === r ? mod.color : 'var(--surface-2)',
                                                color: answers[qi] === r ? '#fff' : 'var(--text-primary)',
                                                border: answers[qi] === r ? `2px solid ${mod.color}` : '2px solid var(--border)',
                                            }}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <div style={s.ratingLabels}>
                                    <span style={s.ratingHint}>Strongly Disagree</span>
                                    <span style={s.ratingHint}>Strongly Agree</span>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={savePreAssessment}
                            disabled={!isFormComplete || isSaving}
                            className="pressable"
                            style={{
                                ...s.submitBtn,
                                background: isFormComplete ? mod.color : 'var(--surface-2)',
                                color: isFormComplete ? '#fff' : 'var(--text-secondary)',
                            }}
                        >
                            {isSaving ? 'Saving...' : isPreDone ? 'Update Evaluation' : 'Complete Evaluation'}
                        </button>
                    </section>
                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div style={s.toast}>
                    <CheckCircle2 size={18} color="#fff" />
                    <span>Evaluation Updated</span>
                </div>
            )}
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)', paddingBottom: '60px', position: 'relative' },
    header: {
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(var(--surface-rgb), 0.85)',
        boxShadow: 'var(--shadow-xs)'
    },
    backBtn: { padding: '10px', background: 'var(--surface-2)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 },
    title: { fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.3px' },
    subtitle: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' },
    iconCircle: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' },
    desktopGridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '40px',
        alignItems: 'start'
    },
    section: { display: 'flex', flexDirection: 'column', gap: '16px' },
    sectionTitle: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', marginBottom: '8px' },

    taskCard: { display: 'flex', alignItems: 'center', padding: '20px 24px', borderRadius: '20px', gap: '20px' },
    taskIcon: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    taskTitle: { fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' },
    taskSubtitle: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' },

    sessionsLabel: { fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '700', marginTop: '12px' },
    sessionRow: { display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: '20px', gap: '16px' },
    sessionIdx: { width: '36px', height: '36px', borderRadius: '18px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: 'var(--text-secondary)', flexShrink: 0 },
    sessionTitle: { fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' },
    sessionSubtitle: { color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', fontWeight: '500' },

    divider: { border: 'none', borderTop: '2px solid var(--border)', margin: '12px 0' },

    questionCard: { padding: '20px', borderRadius: '20px' },
    questionText: { fontWeight: '600', fontSize: '16px', marginBottom: '16px', lineHeight: 1.5, letterSpacing: '-0.2px' },
    ratingRow: { display: 'flex', gap: '10px', justifyContent: 'space-between' },
    ratingBtn: {
        width: '44px', height: '44px', borderRadius: '14px',
        fontWeight: '800', fontSize: '15px'
    },
    ratingLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' },
    ratingHint: { fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' },

    submitBtn: { padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', border: 'none', marginTop: '12px' },
    toast: { position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '14px 28px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', boxShadow: 'var(--shadow-lg)', zIndex: 100 },
};
