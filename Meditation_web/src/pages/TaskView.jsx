import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { X, Trophy, BrainCircuit } from 'lucide-react';

const MODULES = {
    focused_attention: { title: 'Focused Attention', color: '#FF3B30' },
    working_memory: { title: 'Working Memory', color: '#FF9500' },
    present_moment: { title: 'Present Moment', color: '#4CD964' },
    cognitive_flexibility: { title: 'Cognitive Flexibility', color: '#5AC8FA' },
    emotional_regulation: { title: 'Emotional Regulation', color: '#5856D6' }
};

export default function TaskView() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const mod = MODULES[type] || MODULES.focused_attention;

    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('finished');
            handleSaveProgress();
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const handleSaveProgress = async () => {
        setIsSaving(true);
        try {
            // Simulate taking task score and adding daily progress
            const percentScore = Math.floor(Math.random() * 40) + 60; // 60-100 random if not fully implemented
            const today = new Date().toLocaleDateString('en-GB'); // 27/04/2026 format matching Swift typical

            await api.saveProgress(
                user.email,
                type,
                percentScore,
                score,
                100.0,
                today
            );
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = () => {
        if (gameState === 'playing') {
            setScore(s => s + 10);
        }
    };

    return (
        <div style={{ ...styles.container, background: `${mod.color}10` }}>
            <header style={styles.header}>
                <button style={styles.closeBtn} onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
                <span style={styles.title}>{mod.title} Challenge</span>
                <div style={{ width: 40 }} />
            </header>

            <main style={styles.content}>
                {gameState === 'intro' && (
                    <div className="animate-fade-in card" style={styles.card}>
                        <div style={{ ...styles.iconWrapper, background: mod.color }}>
                            <BrainCircuit size={40} color="#fff" />
                        </div>
                        <h2 style={styles.heading}>Ready to focus?</h2>
                        <p style={styles.bodyText}>
                            In this web interface simulation of the iOS task, tap the button repeatedly as fast as you can to score points before time runs out.
                        </p>
                        <button
                            style={{ ...styles.primaryBtn, background: mod.color }}
                            onClick={() => setGameState('playing')}
                        >
                            Start Exercise
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="animate-fade-in" style={styles.playContainer}>
                        <div style={styles.hud}>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>Time</span>
                                <span style={{ ...styles.statValue, color: mod.color }}>00:{timeLeft.toString().padStart(2, '0')}</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>Score</span>
                                <span style={{ ...styles.statValue, color: mod.color }}>{score}</span>
                            </div>
                        </div>

                        <button
                            style={{ ...styles.actionBtn, background: mod.color }}
                            onClick={handleAction}
                        >
                            Tap!
                        </button>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="animate-fade-in card" style={styles.card}>
                        <div style={{ ...styles.iconWrapper, background: 'var(--success)' }}>
                            <Trophy size={40} color="#fff" />
                        </div>
                        <h2 style={styles.heading}>Exercise Complete</h2>
                        <p style={styles.bodyText}>
                            You scored <strong>{score}</strong> points. Your progress has been {isSaving ? 'saving...' : 'saved to your profile.'}
                        </p>
                        <button
                            style={{ ...styles.primaryBtn, background: 'var(--success)' }}
                            onClick={() => navigate('/home')}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Return to Dashboard'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)'
    },
    closeBtn: {
        padding: '8px',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: '12px',
        color: 'var(--text-primary)'
    },
    title: {
        fontSize: '18px',
        fontWeight: '700'
    },
    content: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
    },
    iconWrapper: {
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
    },
    heading: {
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '12px'
    },
    bodyText: {
        fontSize: '15px',
        color: 'var(--text-secondary)',
        marginBottom: '32px',
        lineHeight: 1.5
    },
    primaryBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '700',
        border: 'none'
    },
    playContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px'
    },
    hud: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '60px'
    },
    statBox: {
        background: 'var(--surface)',
        padding: '16px 24px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        flex: 1,
        margin: '0 8px'
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    statValue: {
        fontSize: '32px',
        fontWeight: '800',
        marginTop: '4px'
    },
    actionBtn: {
        width: '200px',
        height: '200px',
        borderRadius: '100px',
        color: '#fff',
        fontSize: '32px',
        fontWeight: '800',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        transition: 'transform 0.1s',
        border: 'none',
        cursor: 'pointer'
    }
};
