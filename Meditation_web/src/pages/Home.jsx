import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { BarChart2, User, Target, Puzzle, Leaf, Repeat, Heart, Calendar } from 'lucide-react';

const MODULES = [
  { id: 'focused_attention', fullTitle: 'Focused Attention', shortTitle: 'Attention', color: '#FF3B30', icon: Target },
  { id: 'working_memory', fullTitle: 'Working Memory', shortTitle: 'Memory', color: '#FF9500', icon: Puzzle },
  { id: 'present_moment', fullTitle: 'Present Moment', shortTitle: 'Presence', color: '#4CD964', icon: Leaf },
  { id: 'cognitive_flexibility', fullTitle: 'Cognitive Flexibility', shortTitle: 'Flex', color: '#5AC8FA', icon: Repeat },
  { id: 'emotional_regulation', fullTitle: 'Emotional Regulation', shortTitle: 'Emotion', color: '#5856D6', icon: Heart },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [moduleScores, setModuleScores] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats(user.email);
        setStats(data);
      } catch (e) { console.error(e); }
    };
    if (user?.email) fetchStats();

    const computeModuleScores = () => {
      const scores = {};
      try {
        const saved = JSON.parse(localStorage.getItem('savedProgress') || '[]');
        const byModule = {};
        saved.forEach(r => {
          if (!byModule[r.moduleType]) byModule[r.moduleType] = {};
          const dateKey = r.completionDate || 'unknown';
          if (!byModule[r.moduleType][dateKey]) byModule[r.moduleType][dateKey] = [];
          byModule[r.moduleType][dateKey].push(r);
        });

        MODULES.forEach(m => {
          const moduleDates = byModule[m.id] || {};
          const dateKeys = Object.keys(moduleDates).sort((a, b) => {
            try { return new Date(b) - new Date(a); } catch (e) { return 0; }
          });

          let finalScoreForModule = null;
          for (const dateKey of dateKeys) {
            const records = moduleDates[dateKey] || [];
            // Strict checks:
            // - coreRecord: produced by a core training task => must have a positive taskScore and dailyProgress === 100
            // - dailyRecord: produced by ModuleHome daily evaluation => must have source === 'daily_evaluation'
            const coreRecord = records.find(r => typeof r.taskScore === 'number' && r.taskScore > 0 && Number(r.dailyProgress) === 100);
            const dailyRecord = records.find(r => r.source === 'daily_evaluation');

            if (coreRecord && dailyRecord) {
              const coreScore = Math.round(coreRecord.percentageScore || 0);
              const dailyScore = Math.round(dailyRecord.percentageScore || 0);
              finalScoreForModule = Math.round((coreScore + dailyScore) / 2);
              break;
            }
          }

          if (finalScoreForModule !== null) scores[m.id] = finalScoreForModule;
        });
      } catch (e) {
        console.error('Error reading savedProgress/localStorage for module scores', e);
      }
      setModuleScores(scores);
    };

    computeModuleScores();
    const handler = () => computeModuleScores();
    window.addEventListener('savedProgressUpdated', handler);
    return () => window.removeEventListener('savedProgressUpdated', handler);
  }, [user]);

  // Daily progress
  const doneMods = MODULES.filter(m => localStorage.getItem(`${m.id}_pre_done`) === 'true').length;
  const totalSteps = MODULES.length * 2;
  const doneSteps = doneMods * 2;
  const progressPct = Math.round((doneSteps / totalSteps) * 100) || 0;

  // SVG Math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dashArray = `${(progressPct / 100) * circumference} ${circumference}`;

  return (
    <div style={s.container}>
      <div style={s.content}>
        {/* Top Dashboard Row */}
        <div style={s.topCardsContainer}>
          {/* Daily Progress Card */}
          <div
            style={s.dailyCard}
            className="animate-fade-in fade-delay-1 pressable"
            onClick={() => navigate('/saved-progress')}
          >
            <div style={s.dailyTextContent}>
              <h3 style={s.cardTitle}>Daily Progress</h3>
              <p style={s.cardSubtitle}>{doneSteps}/{totalSteps} steps completed</p>
              <button style={s.viewProgressBtn} onClick={(e) => { e.stopPropagation(); navigate('/saved-progress'); }}>
                View Saved Progress ›
              </button>
            </div>

            <div style={s.progressSvgContainer}>
              <svg viewBox="0 0 60 60" style={s.progressSvg}>
                <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <circle
                  cx="30" cy="30" r={radius}
                  fill="none" stroke="#fff" strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={dashArray}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div style={s.progressText}>{progressPct}%</div>
            </div>
          </div>

        </div>

        {/* Learning Path */}
        <section className="animate-fade-in fade-delay-2" style={{ marginTop: '32px' }}>
          <h3 style={s.sectionTitle}>Learning Path</h3>
          <div style={s.moduleList}>
            {MODULES.map(mod => (
              <div
                key={mod.id}
                style={s.moduleCard}
                className="pressable card"
                onClick={() => navigate(`/module-intro/${mod.id}`)}
              >
                <div style={{ ...s.moduleIcon, background: `${mod.color}15`, color: mod.color }}>
                  <mod.icon size={26} strokeWidth={2.5} />
                </div>
                <div style={s.moduleTextContent}>
                  <h4 style={s.moduleTitle}>{mod.fullTitle}</h4>
                  <p style={s.moduleSubtitle}>Master your cognitive control</p>
                </div>
                <span style={s.chevron}>›</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Overview Graph */}
        <section className="animate-fade-in fade-delay-3" style={{ marginTop: '40px', marginBottom: '80px' }}>
          <h3 style={s.sectionTitle}>Progress Overview</h3>
          <div style={s.graphCard} className="card">
            <div style={s.graphInner}>
              {MODULES.map(mod => {
                const score = moduleScores[mod.id] || 0;
                // Minimum visual height of 10% just so the bar is somewhat visible
                const heightPct = Math.max(5, score);
                return (
                  <div key={mod.id} style={s.barCol}>
                    <div style={s.barTrack}>
                      {score > 0 ? (
                        <div style={{ ...s.bar, height: `${heightPct}%`, background: mod.color }}>
                          <span style={s.barLabel}>{score}%</span>
                        </div>
                      ) : (
                        <div style={s.barEmpty} />
                      )}
                    </div>
                    <span style={s.barName}>{mod.shortTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    background: 'var(--background)'
  },
  content: {
    padding: '32px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },

  greetingSection: { paddingBottom: '8px' },
  greeting: { fontSize: '32px', fontWeight: '800', lineHeight: 1.1, letterSpacing: '-0.5px', color: 'var(--text-primary)' },
  subGreeting: { fontSize: '16px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' },

  dailyCard: {
    background: 'var(--primary-gradient)',
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
    gap: '16px',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    position: 'relative'
  },
  dailyTextContent: { flex: 1, zIndex: 2 },
  cardTitle: { fontSize: '20px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.3px' },
  cardSubtitle: { fontSize: '14px', opacity: 0.9, marginBottom: '20px', fontWeight: '500' },
  viewProgressBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  },

  progressSvgContainer: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 2
  },
  progressSvg: { width: '100%', height: '100%' },
  progressText: {
    position: 'absolute',
    fontSize: '16px',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Inter, sans-serif'
  },

  topCardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px'
  },

  timetableCard: {
    background: 'var(--secondary-gradient)',
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
    gap: '16px',
    boxShadow: 'var(--shadow-lg)'
  },
  calendarIconWrap: {
    width: '64px', height: '64px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  },

  sectionTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.5px' },

  moduleList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  moduleCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '20px',
    gap: '16px'
  },
  moduleIcon: {
    width: '60px', height: '60px',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  moduleTextContent: { flex: 1 },
  moduleTitle: { fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '4px' },
  moduleSubtitle: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' },
  chevron: { fontSize: '24px', color: 'var(--text-secondary)', opacity: 0.5, fontWeight: '300' },

  graphCard: {
    padding: '24px',
    height: '240px',
  },
  graphInner: {
    display: 'flex',
    height: '100%',
    alignItems: 'flex-end',
    gap: '12px',
    justifyContent: 'space-between'
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    gap: '10px'
  },
  barTrack: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    background: 'var(--surface-2)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  bar: {
    width: '100%',
    minWidth: '24px',
    maxWidth: '40px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: '8px',
    transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  barEmpty: {
    width: '100%',
    minWidth: '24px',
    maxWidth: '40px',
    height: '4px',
    borderRadius: '4px',
    background: 'var(--border)'
  },
  barLabel: { fontSize: '11px', fontWeight: '800', color: '#fff' },
  barName: { fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', width: '100%', fontWeight: '600' },
};
