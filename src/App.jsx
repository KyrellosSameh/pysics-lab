import { useState, useEffect } from 'react';
import './App.css';
import OhmsLaw from './components/OhmsLaw';
import WheatstoneBridge from './components/WheatstoneBridge';
import HookesLaw from './components/HookesLaw';
import Viscosity from './components/Viscosity';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SessionCodePage from './components/SessionCodePage';
import { Beaker, Settings, Atom, TestTube, Scale, Activity, LogOut } from 'lucide-react';

// Pages: 'landing' | 'login' | 'session' | 'lab'
function App() {
  const [page, setPage] = useState(() => localStorage.getItem('app_page') || 'landing');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('app_activeTab') || 'ohm');

  useEffect(() => {
    localStorage.setItem('app_page', page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem('app_activeTab', activeTab);
  }, [activeTab]);

  const navItems = [
    { id: 'ohm', label: "Ohm's Law", icon: <Activity size={20} /> },
    { id: 'wheatstone', label: 'Wheatstone', icon: <Atom size={20} /> },
    { id: 'hooke', label: "Hooke's Law", icon: <Scale size={20} /> },
    { id: 'viscosity', label: 'Viscosity', icon: <TestTube size={20} /> },
  ];

  // ── Page: Landing ──────────────────────────────────────────────
  if (page === 'landing') {
    return (
      <LandingPage
        onCreateQuiz={() => setPage('login')}
        onTakeQuiz={() => setPage('session')}
        onEnterLab={() => setPage('lab')}
      />
    );
  }

  // ── Page: Login ────────────────────────────────────────────────
  if (page === 'login') {
    return (
      <LoginPage
        onBack={() => setPage('landing')}
        onLogin={() => setPage('lab')}
      />
    );
  }

  // ── Page: Session Code ─────────────────────────────────────────
  if (page === 'session') {
    return (
      <SessionCodePage
        onBack={() => setPage('landing')}
        onJoin={() => setPage('lab')}
      />
    );
  }

  // ── Page: Lab ──────────────────────────────────────────────────
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '8px', color: 'white' }}>
            <Beaker size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', lineHeight: '1.2' }}>Physics Lab</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Virtual Simulator</span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignContent: 'center', alignItems: 'center', gap: '12px',
                width: '100%', textAlign: 'left',
                border: 'none',
                background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                boxShadow: activeTab === item.id ? 'var(--glow-shadow)' : 'none',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setPage('landing')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
              background: 'transparent', border: 'none', color: 'var(--text-muted)'
            }}
          >
            <LogOut size={20} />
            <span className="settings-text">Exit Lab</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{
          padding: '24px 32px', borderBottom: '1px solid var(--border-color)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            {navItems.find(n => n.id === activeTab)?.label} Experiment
          </h2>
        </header>

        <div className="experiment-area">
          {activeTab === 'ohm' && <OhmsLaw />}
          {activeTab === 'wheatstone' && <WheatstoneBridge />}
          {activeTab === 'hooke' && <HookesLaw />}
          {activeTab === 'viscosity' && <Viscosity />}
        </div>
      </main>
    </div>
  );
}

export default App;
