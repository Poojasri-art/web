import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit } from 'lucide-react';

export default function Splash() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Animation sequence
        const t1 = setTimeout(() => setStep(1), 100);
        const t2 = setTimeout(() => setStep(2), 1500);

        const t3 = setTimeout(() => {
            if (user) navigate('/home');
            else navigate('/login');
        }, 3500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [user, navigate]);

    return (
        <div style={styles.container}>
            {/* Ambient Background Glows */}
            <div style={styles.ambient1}></div>
            <div style={styles.ambient2}></div>

            <div style={{
                ...styles.content,
                opacity: step > 0 ? 1 : 0,
                transform: step > 0 ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'
            }}>

                {/* Glowing Rings */}
                <div style={styles.ringsWrapper}>
                    <div style={{ ...styles.ring, ...styles.ring1, animationPlayState: step > 0 ? 'running' : 'paused' }}></div>
                    <div style={{ ...styles.ring, ...styles.ring2, animationPlayState: step > 0 ? 'running' : 'paused' }}></div>

                    <div style={styles.iconContainer}>
                        <BrainCircuit size={48} color="#ffffff" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 style={{
                    ...styles.title,
                    opacity: step >= 1 ? 1 : 0,
                    transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)'
                }}>
                    CogniSync
                </h1>
                <p style={{
                    ...styles.subtitle,
                    opacity: step >= 2 ? 1 : 0,
                    transform: step >= 2 ? 'translateY(0)' : 'translateY(10px)'
                }}>
                    Unlock Your Mind
                </p>

                <div style={{
                    ...styles.loadingLineTrack,
                    opacity: step >= 2 ? 1 : 0
                }}>
                    <div style={{ ...styles.loadingLineFill, width: step >= 2 ? '100%' : '0%' }}></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slowSpin {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes pulseExpand {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(2); opacity: 0; border-width: 1px; }
                }
            `}} />
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f', // Very deep dark background
        position: 'relative',
        overflow: 'hidden'
    },
    ambient1: {
        position: 'absolute',
        top: '20%', left: '20%',
        width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(124,77,255,0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
        animation: 'slowSpin 20s linear infinite'
    },
    ambient2: {
        position: 'absolute',
        bottom: '10%', right: '10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(0,188,212,0.1) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        transform: 'translate(50%, 50%)',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    ringsWrapper: {
        position: 'relative',
        width: '120px',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px'
    },
    ring: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '2px solid rgba(124,77,255,0.6)',
        boxSizing: 'border-box'
    },
    ring1: { animation: 'pulseExpand 2.5s infinite cubic-bezier(0.16, 1, 0.3, 1)' },
    ring2: { animation: 'pulseExpand 2.5s infinite cubic-bezier(0.16, 1, 0.3, 1) 1.25s' },
    iconContainer: {
        width: '100px', height: '100px',
        background: 'linear-gradient(135deg, rgba(124,77,255,0.2) 0%, rgba(0,188,212,0.2) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(124,77,255,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
        zIndex: 5
    },
    title: {
        color: '#ffffff',
        fontSize: '48px',
        fontWeight: '800',
        letterSpacing: '-1.5px',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '18px',
        marginTop: '8px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontWeight: '600',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s'
    },
    loadingLineTrack: {
        marginTop: '40px',
        width: '160px',
        height: '2px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        transition: 'opacity 0.8s'
    },
    loadingLineFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #7C4DFF, #00BCD4)',
        transition: 'width 2.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }
};
