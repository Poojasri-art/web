import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const N = 2;
const TOTAL_TRIALS = 15;
const STIMULUS_INTERVAL_MS = 2000;
const COLOR = '#FF3B30';

export default function NBack() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [phase, setPhase] = useState('intro'); // intro | playing | done
    const [sequence, setSequence] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stimulus, setStimulus] = useState(null);
    const [score, setScore] = useState(0);
    const [totalTargets, setTotalTargets] = useState(0);
    const [responseGiven, setResponseGiven] = useState(false);
    const scoreRef = useRef(0);
    const responseRef = useRef(false);
    const seqRef = useRef([]);

    const startGame = useCallback(() => {
        const seq = Array.from({ length: TOTAL_TRIALS }, () => Math.ceil(Math.random() * 9));
        for (let i = N; i < TOTAL_TRIALS; i++) {
            if (Math.random() < 0.25) seq[i] = seq[i - N];
        }
        const targets = seq.slice(N).filter((v, i) => v === seq[i]).length;
        seqRef.current = seq;
        scoreRef.current = 0;
        responseRef.current = false;
        setSequence(seq);
        setTotalTargets(targets);
        setScore(0);
        setCurrentIndex(0);
        setPhase('playing');
        showAt(seq, 0);
    }, []);

    const showAt = (seq, idx) => {
        setStimulus(seq[idx]);
        responseRef.current = false;
        setResponseGiven(false);
        setTimeout(() => {
            if (idx < TOTAL_TRIALS - 1) {
                setCurrentIndex(idx + 1);
                showAt(seq, idx + 1);
            } else {
                setPhase('done');
                saveScore(scoreRef.current, seq);
            }
        }, STIMULUS_INTERVAL_MS);
    };

    const handleMatch = () => {
        if (responseRef.current) return;
        responseRef.current = true;
        setResponseGiven(true);
        const idx = seqRef.current.findIndex((_, i) => i === currentIndex);
        if (currentIndex >= N && seqRef.current[currentIndex] === seqRef.current[currentIndex - N]) {
            scoreRef.current += 1;
            setScore(s => s + 1);
        } else {
            if (scoreRef.current > 0) { scoreRef.current -= 1; setScore(s => s - 1); }
        }
    };

    const calcScore = (sc, targets) => targets > 0 ? Math.round(Math.min(100, (sc / targets) * 100)) : 100;

    const saveScore = async (sc, seq) => {
        const targets = seq.slice(N).filter((v, i) => v === seq[i]).length;
        const pct = calcScore(sc, targets);
        try {
            const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
            await api.saveProgress(user.email, 'focused_attention', pct, sc, 100, today);
            // Also store locally for SavedProgress view
            const existing = JSON.parse(localStorage.getItem('savedProgress') || '[]');
            existing.push({ moduleType: 'focused_attention', percentageScore: pct, taskScore: sc, dailyProgress: 100, completionDate: today });
            localStorage.setItem('savedProgress', JSON.stringify(existing));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <header style={taskS.header}>
                <button style={taskS.backBtn} onClick={() => navigate('/module/focused_attention')}><ArrowLeft size={22} color={COLOR} /></button>
                <span style={taskS.title}>N-Back Challenge (N=2)</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={taskS.body}>
                {phase === 'intro' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>🧠</span>
                        <h2 style={taskS.h2}>N-Back Challenge (N=2)</h2>
                        <p style={taskS.desc}>Press MATCH if the current number matches the one shown 2 steps back.</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={startGame}>Start Task</button>
                    </div>
                )}

                {phase === 'playing' && (
                    <div style={taskS.playArea}>
                        <p style={taskS.trialLabel}>Trial {currentIndex + 1} of {TOTAL_TRIALS}</p>
                        <div style={taskS.stimulusBox}>{stimulus}</div>
                        <div style={taskS.btnRow}>
                            <button style={{ ...taskS.matchBtn, background: COLOR }} onClick={handleMatch} disabled={responseGiven}>MATCH</button>
                            <button style={taskS.noMatchBtn} onClick={() => { if (!responseRef.current) { responseRef.current = true; setResponseGiven(true); } }} disabled={responseGiven}>NO MATCH</button>
                        </div>
                    </div>
                )}

                {phase === 'done' && (
                    <div style={taskS.card}>
                        <span style={{ fontSize: '80px' }}>✅</span>
                        <h2 style={taskS.h2}>Task Complete!</h2>
                        <p style={{ ...taskS.desc, color: COLOR, fontWeight: '700', fontSize: '20px' }}>Your score: {calcScore(score, totalTargets)}%</p>
                        <button style={{ ...taskS.primaryBtn, background: COLOR }} onClick={() => navigate('/home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export const taskS = {
    header: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'var(--surface)' },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    title: { fontSize: '17px', fontWeight: '700' },
    body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', maxWidth: '380px', width: '100%', background: 'var(--surface)', padding: '40px 24px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
    h2: { fontSize: '24px', fontWeight: '800' },
    desc: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px' },
    primaryBtn: { width: '100%', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer' },
    playArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%', maxWidth: '440px' },
    trialLabel: { fontSize: '13px', color: 'var(--text-secondary)' },
    stimulusBox: { fontSize: '100px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 },
    btnRow: { display: 'flex', gap: '16px', width: '100%' },
    matchBtn: { flex: 1, padding: '16px', borderRadius: '12px', color: '#fff', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' },
    noMatchBtn: { flex: 1, padding: '16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px', background: 'var(--background)', border: 'none', cursor: 'pointer' },
};
