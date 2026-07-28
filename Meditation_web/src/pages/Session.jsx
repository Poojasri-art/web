import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

function formatTime(t) {
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function Session() {
    const navigate = useNavigate();
    const location = useLocation();
    const { audioURL = '', audioTitle = 'Session', audioDesc = '', sessionIndex = 0 } = location.state || {};

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const progress = duration > 0 ? currentTime / duration : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTime = () => setCurrentTime(audio.currentTime);
        const onLoaded = () => setDuration(audio.duration);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onLoaded);
        return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onLoaded); };
    }, []);

    const toggle = () => {
        const a = audioRef.current;
        isPlaying ? a.pause() : a.play();
        setIsPlaying(!isPlaying);
    };

    const skip = (secs) => {
        const a = audioRef.current;
        a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + secs));
    };

    const seek = (e) => {
        const a = audioRef.current;
        const val = parseFloat(e.target.value);
        a.currentTime = val;
        setCurrentTime(val);
    };

    return (
        <div style={s.container}>
            <audio ref={audioRef} src={audioURL} />

            <div style={s.header}>
                <button style={s.closeBtn} onClick={() => navigate(-1)}><X size={22} /></button>
            </div>

            {/* Cover Art */}
            <div style={s.coverArt}>
                <div style={s.coverCircle}>
                    <span style={{ fontSize: '80px' }}>🍃</span>
                </div>
            </div>

            {/* Title & Desc */}
            <div style={s.titleSection}>
                <h2 style={s.title}>{audioTitle}</h2>
                <p style={s.desc}>{audioDesc}</p>
                <p style={s.sessionNumber}>Session {sessionIndex + 1}</p>
            </div>

            {/* Seeker */}
            <div style={s.seekerContainer}>
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={seek}
                    style={s.slider}
                />
                <div style={s.timeRow}>
                    <span style={s.timeLabel}>{formatTime(currentTime)}</span>
                    <span style={s.timeLabel}>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div style={s.controls}>
                <button style={s.controlBtn} onClick={() => skip(-10)}><RotateCcw size={28} /></button>
                <button style={s.playBtn} onClick={toggle}>
                    {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} fill="white" />}
                </button>
                <button style={s.controlBtn} onClick={() => skip(10)}><RotateCw size={28} /></button>
            </div>

            {/* Complete button */}
            {progress >= 0.95 && (
                <div style={{ padding: '0 32px 32px' }}>
                    <button style={s.completeBtn} onClick={() => navigate(-1)}>Complete Session</button>
                </div>
            )}
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'linear-gradient(180deg, rgba(124,77,255,0.08) 0%, var(--background) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { width: '100%', padding: '20px 20px 0', display: 'flex' },
    closeBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex' },
    coverArt: { marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    coverCircle: { width: '200px', height: '200px', borderRadius: '100px', background: 'rgba(124,77,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(124,77,255,0.2)' },
    titleSection: { marginTop: '32px', textAlign: 'center', padding: '0 40px' },
    title: { fontSize: '28px', fontWeight: '800', marginBottom: '8px' },
    desc: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 },
    sessionNumber: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' },
    seekerContainer: { width: '100%', padding: '32px 32px 0' },
    slider: { width: '100%', accentColor: 'var(--primary)', height: '4px', cursor: 'pointer' },
    timeRow: { display: 'flex', justifyContent: 'space-between', marginTop: '8px' },
    timeLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
    controls: { display: 'flex', alignItems: 'center', gap: '40px', marginTop: '32px', color: 'var(--primary)' },
    controlBtn: { padding: '12px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' },
    playBtn: { width: '80px', height: '80px', borderRadius: '40px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,77,255,0.4)' },
    completeBtn: { width: '100%', padding: '16px', background: 'var(--primary-gradient)', color: '#fff', borderRadius: '16px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }
};
