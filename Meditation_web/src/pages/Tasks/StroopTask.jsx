import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { taskS } from './NBack';

const COLOR = '#5AC8FA';
const TOTAL_TRIALS = 20;
const COLORS = {
    RED: '#FF3B30',
    BLUE: '#0A84FF',
    GREEN: '#30D158',
    YELLOW: '#FFD60A',
};
const COLOR_KEYS = Object.keys(COLORS);

function randomExcept(keys, excludeColor) {
    const opts = keys.filter(k => COLORS[k] !== excludeColor);
    return opts[Math.floor(Math.random() * opts.length)];
}

export default function StroopTask() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [phase, setPhase] = useState('intro');
    const [word, setWord] = useState('');
    const [inkColor, setInkColor] = useState('');
    const [score, setScore] = useState(0);
    const [trialCount, setTrialCount] = useState(0);
    const scoreRef = { current: 0 };

    const startGame = () => {
        scoreRef.current = 0;
        setScore(0);
        setTrialCount(0);
        setPhase('playing');
        showNext(0);
    };

    const showNext = (trial) => {
        const wordKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
        // Randomly congruent or incongruent
        const inkKey = Math.random() > 0.5 ? wordKey : randomExcept(COLOR_KEYS, COLORS[wordKey]);
        setWord(wordKey);
        setInkColor(inkKey);
    };

    const handlePress = (chosenKey, trial) => {
        const correct = chosenKey === inkColor;
        let newScore = score;
        if (correct) { newScore = score + 1; setScore(newScore); }
        const next = trial + 1;
        setTrialCount(next);
        if (next < TOTAL_TRIALS) {
            showNext(next);
        } else {
            setPhase('done');
            saveScore(newScore);
        }
    };

    const calcScore = () => Math.round((score / TOTAL_TRIALS) * 100);

    const saveScore = async (sc) => {
        const pct = Math.round((sc / TOTAL_TRIALS) * 100);
        try {
            const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
            await api.saveProgress(user.email, 'cognitive_flexibility', pct, sc, 100, today);
            const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
            existing.push({ moduleType: 'cognitive_flexibility', percentageScore: pct, taskScore: sc, dailyProgress: 100, completionDate: today });
            localStorage.setItem('savedProgress', JSON.stringify(existing));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <header style={taskS.header}>
                <button style={taskS.backBtn} onClick={() => navigate('/module/cognitive_flexibility')}><ArrowLeft size={22} color={COLOR} /></button>
                <span style={taskS.title}>Stroop Challenge</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={taskS.body}>
                {phase === 'intro' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>🎨</span>
                        <h2 style={taskS.h2}>Stroop Challenge</h2>
                        <p style={taskS.desc}>Pick the button that matches the INK COLOR, not what the word says.</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={startGame}>Start Task</button>
                    </div>
                )}

                {phase === 'playing' && (
                    <div style={taskS.playArea}>
                        <p style={taskS.trialLabel}>Trial {trialCount + 1} of {TOTAL_TRIALS}</p>
                        <div style={{ fontSize: '72px', fontWeight: '900', color: COLORS[inkColor], lineHeight: 1 }}>{word}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                            {COLOR_KEYS.sort().map(key => (
                                <button
                                    key={key}
                                    onClick={() => handlePress(key, trialCount)}
                                    style={{
                                        padding: '16px', borderRadius: '12px',
                                        background: `${COLORS[key]}15`, color: COLORS[key],
                                        border: `2px solid ${COLORS[key]}`, fontWeight: '700', fontSize: '16px', cursor: 'pointer'
                                    }}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {phase === 'done' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>⭐</span>
                        <h2 style={taskS.h2}>Task Complete!</h2>
                        <p style={{ ...taskS.desc, color: COLOR, fontWeight: '700', fontSize: '20px' }}>Final Score: {calcScore()}%</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={() => navigate('/home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}
