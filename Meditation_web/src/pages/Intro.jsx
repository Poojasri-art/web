import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
    {
        title: "Welcome to CogniSync",
        desc: "Your personal cognitive enhancement journey begins here.",
        image: "🧠"
    },
    {
        title: "Daily Exercises",
        desc: "Engage in quick, scientifically backed exercises to sharpen your mind.",
        image: "⚡"
    },
    {
        title: "Track Your Growth",
        desc: "View your progress with detailed analytics and insights.",
        image: "📈"
    }
];

export default function Intro() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(s => s + 1);
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content} className="animate-fade-in fade-delay-1">
                <div style={styles.imagePlaceholder}>
                    <span style={{ fontSize: '80px' }}>{SLIDES[currentSlide].image}</span>
                </div>

                <div style={styles.dotsContainer}>
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.dot,
                                background: i === currentSlide ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                                width: i === currentSlide ? '24px' : '8px'
                            }}
                        />
                    ))}
                </div>

                <h2 style={styles.title}>{SLIDES[currentSlide].title}</h2>
                <p style={styles.desc}>{SLIDES[currentSlide].desc}</p>

                <button style={styles.btn} onClick={nextSlide}>
                    {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        background: 'var(--background)'
    },
    content: {
        maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
    },
    imagePlaceholder: {
        width: '240px', height: '240px', borderRadius: '40px', background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '40px', boxShadow: 'var(--shadow-md)'
    },
    dotsContainer: {
        display: 'flex', gap: '8px', marginBottom: '32px'
    },
    dot: {
        height: '8px', borderRadius: '4px', transition: 'all 0.3s ease'
    },
    title: {
        fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)'
    },
    desc: {
        fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.5
    },
    btn: {
        background: 'var(--primary-gradient)', color: '#fff', width: '100%', padding: '16px',
        borderRadius: '16px', fontSize: '18px', fontWeight: '700', border: 'none', boxShadow: 'var(--shadow-md)'
    }
};
