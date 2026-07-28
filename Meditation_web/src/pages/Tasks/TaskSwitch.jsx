import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { taskS } from './NBack';

const COLOR = '#5856D6';
const TOTAL_TRIALS = 15;

export default function TaskSwitch() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [phase, setPhase] = useState('intro');
    const [number, setNumber] = useState(0);
    const [taskType, setTaskType] = useState('oddEven'); // 'oddEven' | 'range'
    const [trialCount, setTrialCount] = useState(0);
    const [score, setScore] = useState(0);
    const scoreRef = { current: 0 };

    const startGame = () => {
        scoreRef.current = 0;
        setScore(0);
        setTrialCount(0);
        setPhase('playing');
        showNext(0);
    };

    const showNext = (trial) => {
        let n = Math.ceil(Math.random() * 9);
        if (n === 5) n = 4;
        setNumber(n);
        setTaskType(Math.random() > 0.5 ? 'oddEven' : 'range');
    };

    const handlePress = (option) => {
        const correct = taskType === 'oddEven'
            ? (number % 2 !== 0) === option
            : (number > 5) === option;

        let newScore = score;
        if (correct) { newScore = score + 1; setScore(newScore); }

        const next = trialCount + 1;
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
            await api.saveProgress(user.email, 'emotional_regulation', pct, sc, 100, today);
            const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
            existing.push({ moduleType: 'emotional_regulation', percentageScore: pct, taskScore: sc, dailyProgress: 100, completionDate: today });
            localStorage.setItem('savedProgress', JSON.stringify(existing));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <header style={taskS.header}>
                <button style={taskS.backBtn} onClick={() => navigate('/module/emotional_regulation')}><ArrowLeft size={22} color={COLOR} /></button>
                <span style={taskS.title}>Task Switching Challenge</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={taskS.body}>
                {phase === 'intro' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>🔄</span>
                        <h2 style={taskS.h2}>Task Switching</h2>
                        <p style={taskS.desc}>
                            Rule 1 (◼ SQUARE): Is the number Odd or Even?{'\n'}
                            Rule 2 (⬤ CIRCLE): Is the number {'>'} 5 or {'<'} 5?
                        </p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={startGame}>Start Task</button>
                    </div>
                )}

                {phase === 'playing' && (
                    <div style={taskS.playArea}>
                        <p style={taskS.trialLabel}>Trial {trialCount + 1} of {TOTAL_TRIALS}</p>

                        {/* Cue */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            {taskType === 'oddEven' ? (
                                <>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '4px solid #0A84FF', background: 'rgba(10,132,255,0.1)' }} />
                                    <p style={{ color: '#0A84FF', fontWeight: '700' }}>ODD OR EVEN?</p>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '40px', border: '4px solid #FF9500', background: 'rgba(255,149,0,0.1)' }} />
                                    <p style={{ color: '#FF9500', fontWeight: '700' }}>{'>5 OR <5?'}</p>
                                </>
                            )}
                        </div>

                        <div style={taskS.stimulusBox}>{number}</div>

                        <div style={taskS.btnRow}>
                            {taskType === 'oddEven' ? (
                                <>
                                    <button style={{ ...taskS.matchBtn, background: '#0A84FF' }} onClick={() => handlePress(true)}>ODD</button>
                                    <button style={{ ...taskS.noMatchBtn, color: '#0A84FF', border: '2px solid #0A84FF' }} onClick={() => handlePress(false)}>EVEN</button>
                                </>
                            ) : (
                                <>
                                    <button style={{ ...taskS.matchBtn, background: '#FF9500' }} onClick={() => handlePress(true)}>{'>5'}</button>
                                    <button style={{ ...taskS.noMatchBtn, color: '#FF9500', border: '2px solid #FF9500' }} onClick={() => handlePress(false)}>{'<5'}</button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'done' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>✅</span>
                        <h2 style={taskS.h2}>Task Complete!</h2>
                        <p style={{ ...taskS.desc, color: COLOR, fontWeight: '700', fontSize: '20px' }}>Final Score: {calcScore()}%</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={() => navigate('/home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}
