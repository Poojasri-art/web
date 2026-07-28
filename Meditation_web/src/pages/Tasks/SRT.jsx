import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { taskS } from './NBack';

const TOTAL_TRIALS = 10;
const COLOR = '#4CD964';

export default function SRT() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const moduleType = location.state?.moduleType || 'present_moment';

    const [phase, setPhase] = useState('intro');
    const [showStimulus, setShowStimulus] = useState(false);
    const [trialCount, setTrialCount] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [circlePos, setCirclePos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const startTimeRef = useRef(null);
    const rtRef = useRef([]);
    const trialRef = useRef(0);

    const startGame = () => {
        trialRef.current = 0;
        rtRef.current = [];
        setTrialCount(0);
        setReactionTimes([]);
        setPhase('playing');
        scheduleNext();
    };

    const scheduleNext = () => {
        setShowStimulus(false);
        const waitMs = (Math.random() * 3 + 2) * 1000;
        setTimeout(() => {
            const randomTop = Math.floor(Math.random() * 60) + 20;
            const randomLeft = Math.floor(Math.random() * 60) + 20;
            setCirclePos({
                top: `${randomTop}%`,
                left: `${randomLeft}%`,
                transform: 'translate(-50%, -50%)'
            });
            setShowStimulus(true);
            startTimeRef.current = Date.now();
        }, waitMs);
    };

    const handlePress = () => {
        if (!startTimeRef.current) return;
        const rt = (Date.now() - startTimeRef.current) / 1000;
        rtRef.current.push(rt);
        setReactionTimes([...rtRef.current]);
        const next = trialRef.current + 1;
        trialRef.current = next;
        setTrialCount(next);
        if (next < TOTAL_TRIALS) {
            scheduleNext();
        } else {
            setPhase('done');
            saveScore();
        }
    };

    const calcAvgRT = () => {
        const times = rtRef.current;
        if (!times.length) return 0;
        return times.reduce((a, b) => a + b, 0) / times.length;
    };

    const saveScore = async () => {
        const avgRT = calcAvgRT();
        const baselineRT = 0.3, maxRT = 1.5;
        const pct = Math.max(0, Math.min(100, ((maxRT - avgRT) / (maxRT - baselineRT)) * 100));
        try {
            const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
            await api.saveProgress(user.email, moduleType, Math.round(pct), avgRT * 100, 100, today);
            const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
            existing.push({ moduleType, percentageScore: pct, taskScore: avgRT * 100, dailyProgress: 100, completionDate: today });
            localStorage.setItem('savedProgress', JSON.stringify(existing));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <header style={taskS.header}>
                <button style={taskS.backBtn} onClick={() => navigate(`/module/${moduleType}`)}><ArrowLeft size={22} color={COLOR} /></button>
                <span style={taskS.title}>SRT Challenge</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={taskS.body}>
                {phase === 'intro' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>⏱️</span>
                        <h2 style={taskS.h2}>SRT Challenge</h2>
                        <p style={taskS.desc}>Watch closely! Tap the green circle as soon as it appears.</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={startGame}>Start Task</button>
                    </div>
                )}

                {phase === 'playing' && (
                    <div style={{ ...taskS.playArea, minHeight: '60vh', position: 'relative', width: '100%' }}>
                        <p style={taskS.trialLabel}>Trial {trialCount + 1} of {TOTAL_TRIALS}</p>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '300px', position: 'relative' }}>
                            {showStimulus ? (
                                <button
                                    onClick={handlePress}
                                    style={{
                                        width: '150px', height: '150px', borderRadius: '75px',
                                        background: COLOR, border: 'none', cursor: 'pointer',
                                        boxShadow: `0 0 40px ${COLOR}60`,
                                        position: 'absolute',
                                        top: circlePos.top,
                                        left: circlePos.left,
                                        transform: circlePos.transform,
                                    }}
                                />
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: '600' }}>Wait for it...</p>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'done' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>💓</span>
                        <h2 style={taskS.h2}>Task Complete!</h2>
                        <p style={{ ...taskS.desc, color: COLOR, fontWeight: '700', fontSize: '20px' }}>
                            Avg Reaction Time: {Math.round(calcAvgRT() * 1000)}ms
                        </p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={() => navigate('/home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}
