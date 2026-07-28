import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { Clock, Flame, Zap, Bell, Shield, LogOut, ChevronRight, Sun, User as UserIcon, Palette, ArrowLeft, Pencil, RotateCcw } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, setTheme, mood, setMood } = useTheme();
    const [stats, setStats] = useState({ minsTrained: 0, streakDays: 0, efficiency: 0 });
    const [showNotif, setShowNotif] = useState(false);
    const [profileImg, setProfileImg] = useState(null);

    useEffect(() => {
        // Calculate stats from localStorage saved progress (same logic as Swift)
        const records = JSON.parse(localStorage.getItem('savedProgress') || '[]');
        const minsTrained = records.length * 15;
        const efficiency = records.length === 0 ? 0 :
            Math.round(records.reduce((acc, r) => acc + (r.percentageScore + r.taskScore) / 2, 0) / records.length);
        setStats({ minsTrained, efficiency, streakDays: 0 }); // streak calc simplified
    }, []);

    useEffect(() => {
        if (user?.email) {
            api.getProfile(user.email).then(res => {
                if (res.profile_image) {
                    let imgSrc = res.profile_image;
                    if (!imgSrc.startsWith('data:image')) {
                        imgSrc = `data:image/jpeg;base64,${imgSrc}`;
                    }
                    setProfileImg(imgSrc);
                }
            }).catch(e => console.error("Could not fetch profile", e));
        }
    }, [user]);

    const menuItems = [
        { title: 'Update Profile Info', icon: Pencil, color: '#5AC8FA', route: '/update-info' },
        { title: 'Reset Progress', icon: RotateCcw, color: '#FF9500', route: '/reset-account' },
        { title: 'Notifications', icon: Bell, color: '#4CD964', action: () => setShowNotif(true) },
        { title: 'Privacy', icon: Shield, color: '#8e8e93', route: '/privacy' },
    ];

    const statItems = [
        { title: 'Mins Trained', value: stats.minsTrained, icon: Clock, color: '#5AC8FA' },
        { title: 'Streak', value: `${stats.streakDays} Days`, icon: Flame, color: '#FF9500' },
        { title: 'Efficiency', value: `${stats.efficiency}%`, icon: Zap, color: 'var(--primary)' },
    ];

    return (
        <div style={s.container}>
            {showNotif && (
                <div style={s.alertOverlay}>
                    <div style={s.alert}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>🌸 Mindful Reminder</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Pause. Breathe. Reset.<br />A few mindful minutes can transform your entire day.</p>
                        <button style={s.alertBtn} onClick={() => setShowNotif(false)}>OK</button>
                    </div>
                </div>
            )}

            <header style={s.header}>
                <button style={s.backBtn} onClick={() => navigate('/home')}><ArrowLeft size={22} /></button>
                <span style={s.headerTitle}>Profile</span>
                <div style={{ width: 38 }} />
            </header>

            <div style={s.content}>
                {/* Profile Header */}
                <div style={s.profileHeader}>
                    <div style={s.avatar}>
                        {profileImg ? (
                            <img src={profileImg} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '40px', objectFit: 'cover' }} />
                        ) : (
                            <span style={s.avatarText}>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                        )}
                    </div>
                    <h2 style={s.email}>{user?.email || 'user@example.com'}</h2>
                    <p style={s.goal}>Goal: Mindful Clarity</p>
                </div>

                {/* Stats Grid */}
                <div style={s.statsGrid}>
                    {statItems.map((item, i) => (
                        <div key={i} style={s.statCard}>
                            <item.icon size={22} color={item.color} />
                            <span style={{ ...s.statVal, color: item.color }}>{item.value}</span>
                            <span style={s.statLabel}>{item.title}</span>
                        </div>
                    ))}
                </div>

                {/* Settings */}
                <h3 style={s.sectionHeader}>Settings</h3>
                <div style={s.listGroup}>
                    <div style={s.settingsRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ ...s.listIcon, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                                <Sun size={20} />
                            </div>
                            <span style={s.listLabel}>App Theme</span>
                        </div>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            style={s.themeSelect}
                        >
                            <option value="system">System Default</option>
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                        </select>
                    </div>



                    <div style={s.settingsRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ ...s.listIcon, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                                <Palette size={20} />
                            </div>
                            <span style={s.listLabel}>App Mood (Color)</span>
                        </div>
                        <select
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            style={s.themeSelect}
                        >
                            <option value="focus">Deep Focus (Purple)</option>
                            <option value="calm">Calm (Teal)</option>
                            <option value="energized">Energized (Orange)</option>
                            <option value="balanced">Balanced (Green)</option>
                        </select>
                    </div>
                </div>

                {/* Menu */}
                <div style={s.menu}>
                    {menuItems.map((item, i) => (
                        <div key={i} style={s.menuRow} onClick={() => item.action ? item.action() : navigate(item.route)}>
                            <div style={{ ...s.menuIcon, background: `${item.color}15`, color: item.color }}>
                                <item.icon size={18} />
                            </div>
                            <span style={s.menuTitle}>{item.title}</span>
                            <ChevronRight size={18} color="var(--text-secondary)" />
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
                    <LogOut size={18} color="var(--error)" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: 'var(--background)' },
    header: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex' },
    headerTitle: { fontSize: '18px', fontWeight: '700' },
    content: { maxWidth: '680px', margin: '0 auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '20px' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', paddingBottom: '8px' },
    avatar: { width: '80px', height: '80px', borderRadius: '40px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 8px 24px rgba(124,77,255,0.3)' },
    avatarText: { color: '#fff', fontSize: '32px', fontWeight: '800' },
    email: { fontSize: '17px', fontWeight: '700', marginBottom: '4px' },
    goal: { fontSize: '13px', color: 'var(--text-secondary)' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
    statCard: { background: 'var(--surface)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statVal: { fontSize: '18px', fontWeight: '800' },
    statLabel: { fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' },
    sectionHeader: { fontSize: '18px', fontWeight: '800', marginBottom: '4px', paddingLeft: '4px' },
    listGroup: { background: 'var(--surface)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    settingsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' },
    listIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    listLabel: { fontSize: '15px', fontWeight: '600' },
    themeSelect: { padding: '8px 12px', borderRadius: '10px', background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
    menu: { background: 'var(--surface)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    menuRow: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', gap: '14px' },
    menuIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    menuTitle: { flex: 1, fontSize: '15px', fontWeight: '600' },
    logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,59,48,0.1)', color: 'var(--error)', padding: '16px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '4px' },
    alertOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    alert: { background: 'var(--surface)', borderRadius: '24px', padding: '28px', maxWidth: '320px', width: '90%', textAlign: 'center' },
    alertBtn: { marginTop: '20px', background: 'var(--primary-gradient)', color: '#fff', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', border: 'none', fontSize: '15px', cursor: 'pointer' }
};
