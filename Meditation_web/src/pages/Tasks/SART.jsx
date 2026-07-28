import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { taskS } from './NBack';

const TARGET_DIGIT = 3;
const TOTAL_TRIALS = 20;
const STIMULUS_MS = 1000;
const COLOR = '#FF9500';

export default function SART() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [phase, setPhase] = useState('intro');
    const [sequence, setSequence] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stimulus, setStimulus] = useState(null);
    const [score, setScore] = useState(0);
    const [responseGiven, setResponseGiven] = useState(false);
    const scoreRef = useRef(0);
    const responseRef = useRef(false);
    const seqRef = useRef([]);
    const stimRef = useRef(null);

    const startGame = () => {
        const seq = Array.from({ length: TOTAL_TRIALS }, () => Math.ceil(Math.random() * 9));
        seqRef.current = seq;
        scoreRef.current = 0;
        setSequence(seq);
        setScore(0);
        setCurrentIndex(0);
        setPhase('playing');
        showAt(seq, 0);
    };

    const showAt = (seq, idx) => {
        stimRef.current = seq[idx];
        responseRef.current = false;
        setStimulus(seq[idx]);
        setResponseGiven(false);
        setTimeout(() => {
            // If it was the target and they correctly did NOT press → reward
            if (!responseRef.current && stimRef.current === TARGET_DIGIT) {
                scoreRef.current += 1;
                setScore(s => s + 1);
            }
            if (idx < TOTAL_TRIALS - 1) {
                const next = idx + 1;
                setCurrentIndex(next);
                showAt(seq, next);
            } else {
                setPhase('done');
                saveScore(scoreRef.current);
            }
        }, STIMULUS_MS);
    };

    const handlePress = () => {
        if (responseRef.current) return;
        responseRef.current = true;
        setResponseGiven(true);
        if (stimulus !== TARGET_DIGIT) {
            scoreRef.current += 1;
            setScore(s => s + 1);
        }
    };

    const calcScore = () => Math.round((scoreRef.current / TOTAL_TRIALS) * 100);

    const saveScore = async (sc) => {
        const pct = Math.round((sc / TOTAL_TRIALS) * 100);
        try {
            const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
            await api.saveProgress(user.email, 'working_memory', pct, sc, 100, today);
            const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
            existing.push({ moduleType: 'working_memory', percentageScore: pct, taskScore: sc, dailyProgress: 100, completionDate: today });
            localStorage.setItem('savedProgress', JSON.stringify(existing));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <header style={taskS.header}>
                <button style={taskS.backBtn} onClick={() => navigate('/module/working_memory')}><ArrowLeft size={22} color={COLOR} /></button>
                <span style={taskS.title}>SART Challenge</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={taskS.body}>
                {phase === 'intro' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>🎯</span>
                        <h2 style={taskS.h2}>SART Challenge</h2>
                        <p style={taskS.desc}>Press the button for every digit EXCEPT for the digit '3'.</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={startGame}>Start Task</button>
                    </div>
                )}

                {phase === 'playing' && (
                    <div style={taskS.playArea}>
                        <p style={taskS.trialLabel}>Trial {currentIndex + 1} of {TOTAL_TRIALS}</p>
                        <div style={taskS.stimulusBox}>{stimulus}</div>
                        <button
                            style={{ ...taskS.matchBtn, background: COLOR, width: '100%', maxWidth: '280px' }}
                            onClick={handlePress}
                            disabled={responseGiven}
                        >
                            PRESS
                        </button>
                    </div>
                )}

                {phase === 'done' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>🏅</span>
                        <h2 style={taskS.h2}>Task Complete!</h2>
                        <p style={{ ...taskS.desc, color: COLOR, fontWeight: '700', fontSize: '20px' }}>Your score: {calcScore()}%</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={() => navigate('/home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}
