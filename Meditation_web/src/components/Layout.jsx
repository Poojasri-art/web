import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, LineChart, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/home' },
        { label: 'Progress', icon: LineChart, path: '/saved-progress' },
        { label: 'Settings', icon: UserIcon, path: '/profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/home' && (location.pathname === '/home' || location.pathname.startsWith('/module'))) return true;
        if (path === '/saved-progress' && location.pathname.includes('progress')) return true;
        return location.pathname === path;
    };

    return (
        <div style={s.layoutWrapper}>
            {/* Mobile Top Bar */}
            <div className="mobile-top-bar" style={s.mobileTopBar}>
                <div style={s.brandRow}>
                    <div style={s.logoIcon}>
                        <span style={{ fontSize: '18px' }}>🧠</span>
                    </div>
                    <span style={s.brandName}>CogniSync</span>
                </div>
                <button style={s.menuBtn} onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu size={24} color="var(--text-primary)" />
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div style={s.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}>
                    <div style={s.mobileSidebar} onClick={(e) => e.stopPropagation()}>
                        <div style={s.mobileSidebarHeader}>
                            <span style={s.brandName}>Menu</span>
                            <button style={s.menuBtn} onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} color="var(--text-primary)" />
                            </button>
                        </div>
                        <NavContent items={navItems} isActive={isActive} navigate={navigate} handleLogout={handleLogout} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="desktop-sidebar" style={s.desktopSidebar}>
                <div style={s.desktopHeader}>
                    <div style={s.logoIcon}>
                        <span style={{ fontSize: '24px' }}>🧠</span>
                    </div>
                    <span style={s.brandName}>CogniSync</span>
                </div>
                <div style={{ flex: 1, padding: '24px 16px' }}>
                    <NavContent items={navItems} isActive={isActive} navigate={navigate} handleLogout={handleLogout} />
                </div>
                <div style={s.userCard}>
                    <div style={s.userAvatar}>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={s.userName}>{user?.username || 'User'}</div>
                        <div style={s.userEmail}>{user?.email || 'user@example.com'}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main style={s.mainContent}>
                {/* We center inner content up to 1200px manually in pages, so this wrapper just takes full space */}
                <div style={s.pageScrollWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavContent({ items, isActive, navigate, handleLogout }) {
    return (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
            <div style={{ flex: 1 }}>
                {items.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={active ? { ...s.navItem, ...s.navItemActive } : s.navItem}
                            className="pressable"
                        >
                            <item.icon size={20} color={active ? 'var(--primary)' : 'var(--text-secondary)'} />
                            <span style={active ? { ...s.navLabel, color: 'var(--primary)', fontWeight: '700' } : s.navLabel}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <button onClick={handleLogout} style={{ ...s.navItem, marginTop: 'auto', color: 'var(--error)' }} className="pressable">
                <LogOut size={20} color="var(--error)" />
                <span style={{ ...s.navLabel, color: 'var(--error)' }}>Sign Out</span>
            </button>
        </nav>
    );
}

const s = {
    layoutWrapper: {
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--background)',
    },

    // Mobile UI
    mobileTopBar: {
        display: 'flex',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '60px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 40,
    },
    menuBtn: { padding: '8px', display: 'flex', background: 'var(--surface-2)', borderRadius: '8px' },
    mobileOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex' },
    mobileSidebar: { width: '280px', background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' },
    mobileSidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border)' },

    // Desktop UI
    desktopSidebar: {
        width: '280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
    },
    desktopHeader: {
        padding: '32px 24px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoIcon: {
        width: '40px', height: '40px',
        background: 'var(--primary-glow)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    brandName: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },

    navItem: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderRadius: '14px',
        background: 'transparent',
        transition: 'background 0.2s, transform 0.1s',
    },
    navItemActive: { background: 'var(--primary-glow)' },
    navLabel: { fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' },

    userCard: {
        padding: '24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userAvatar: {
        width: '40px', height: '40px',
        borderRadius: '20px',
        background: 'var(--secondary-gradient)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '18px', flexShrink: 0
    },
    userName: { fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    userEmail: { fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, // important for truncate/grid inside flex
    },
    pageScrollWrapper: {
        flex: 1,
        overflowY: 'auto'
    }
};
