import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import OhmsLaw from './components/OhmsLaw';
import WheatstoneBridge from './components/WheatstoneBridge';
import HookesLaw from './components/HookesLaw';
import Viscosity from './components/Viscosity';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SessionCodePage from './components/SessionCodePage';
import CreateExamPage from './components/CreateExamPage';
import InstructorDashboard from './components/InstructorDashboard';
import StudentResultsPage from './components/StudentResultsPage';
import { Beaker, Settings, Atom, TestTube, Scale, Activity, LogOut } from 'lucide-react';

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.hash.replace('#', '') || '/');
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('app_activeTab') || 'ohm');
  const [instructorName, setInstructorName] = useState(() => localStorage.getItem('app_instructorName') || '');
  const [instructorId, setInstructorId] = useState(() => localStorage.getItem('app_instructorId') || '');
  const [examConfig, setExamConfig] = useState(() => {
    const saved = localStorage.getItem('app_examConfig');
    return saved ? JSON.parse(saved) : null;
  });

  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hash Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Sync on mount
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  useEffect(() => {
    if (instructorName) {
      localStorage.setItem('app_instructorName', instructorName);
    } else {
      localStorage.removeItem('app_instructorName');
    }
  }, [instructorName]);

  useEffect(() => {
    if (instructorId) {
      localStorage.setItem('app_instructorId', instructorId);
    } else {
      localStorage.removeItem('app_instructorId');
    }
  }, [instructorId]);

  useEffect(() => {
    if (examConfig && !examConfig.examComplete) {
      localStorage.setItem('app_examConfig', JSON.stringify(examConfig));
    } else {
      localStorage.removeItem('app_examConfig');
    }
  }, [examConfig]);

  useEffect(() => {
    const verifyNotSubmitted = async () => {
      if (examConfig && !examConfig.examComplete && examConfig.code) {
        const { data } = await supabase.from('results').select('id')
          .eq('student_id', examConfig.studentId)
          .eq('exam_code', examConfig.code);
        
        if (data && data.length > 0) {
          alert('لقد قمت بإجراء هذا الاختبار مسبقاً.');
          setExamConfig(null);
          navigate('/');
        }
      }
    };
    verifyNotSubmitted();
  }, [examConfig?.code, examConfig?.studentId]);

  useEffect(() => {
    localStorage.setItem('app_activeTab', activeTab);
  }, [activeTab]);

  // Global Timer Logic
  useEffect(() => {
    let timer;
    if (examConfig && examConfig.startTime && !examConfig.examComplete) {
      timer = setInterval(() => {
        const elapsed = Date.now() - examConfig.startTime;
        const remaining = Math.max(0, 30 * 60 * 1000 - elapsed);
        setTimeLeft(remaining);
        
        if (remaining <= 5 * 60 * 1000 && remaining > 0) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
        
        if (remaining === 0) {
          handleExamSubmit('--', 'N/A');
        }
      }, 1000);
    } else {
      setTimeLeft(null);
      setShowWarning(false);
    }
    return () => clearInterval(timer);
  }, [examConfig]);

  const handleExamSubmit = async (studentValue, actualValue) => {
    if (!examConfig || examConfig.examComplete || isSubmitting) return;
    setIsSubmitting(true);
    
    // Save result to Supabase
    const unit = examConfig.experiment === 'ohm' ? 'Ω' :
          examConfig.experiment === 'wheatstone' ? 'Ω' :
          examConfig.experiment === 'hooke' ? 'N/m' : 'Pa·s';
    
    try {
      const { data: existing } = await supabase.from('results').select('id')
        .eq('student_id', examConfig.studentId)
        .eq('exam_code', examConfig.code || 'N/A');
        
      if (existing && existing.length > 0) {
         alert("خطأ: لقد تم إرسال نتيجتك بالفعل مسبقاً.");
         setExamConfig(null);
         navigate('/');
         setIsSubmitting(false);
         return;
      }

      const { error: insertError } = await supabase.from('results').insert([{
        student_name: examConfig.studentName,
        student_id: examConfig.studentId,
        exam_code: examConfig.code || 'N/A',
        experiment: examConfig.experiment,
        student_result: String(studentValue),
        actual_result: String(actualValue),
        unit,
        instructor_grade: '',
        instructor_id: examConfig.instructorId || null
      }]);
      if (insertError) {
        console.error('Supabase insert error:', insertError.message);
        alert('خطأ في حفظ النتيجة: ' + insertError.message);
      }
    } catch (err) {
      console.error('Error saving result to Supabase:', err);
    }
    
    // Lock exam
    const updatedConfig = { ...examConfig, examComplete: true };
    setExamConfig(updatedConfig);
    setIsSubmitting(false);
    
    if (studentValue === '--') {
         alert("انتهى وقت الاختبار. تم إرسال إجابتك تلقائياً.");
    } else {
         alert("تم إرسال إجابتك وإنهاء الاختبار بنجاح.");
    }

    setTimeout(() => {
      setExamConfig(null);
      navigate('/');
    }, 3000);
  };

  const navItems = [
    { id: 'ohm', label: "Ohm's Law", icon: <Activity size={20} /> },
    { id: 'wheatstone', label: 'Wheatstone', icon: <Atom size={20} /> },
    { id: 'hooke', label: "Hooke's Law", icon: <Scale size={20} /> },
    { id: 'viscosity', label: 'Viscosity', icon: <TestTube size={20} /> },
  ];

  // ── Pages Routing ──────────────────────────────────────────────
  if (currentPath === '/') {
    return <LandingPage />;
  }

  // Unified Instructor Entry Route and Protected Views
  if (currentPath.startsWith('/lab/instructor')) {
    // Show login page if unauthenticated
    if (!instructorName || !instructorId) {
      return (
        <LoginPage
          onBack={() => navigate('/')}
          onLogin={(data) => {
            setInstructorName(data.username);
            setInstructorId(data.id);
            navigate('/lab/instructor/dashboard');
          }}
        />
      );
    }

    // Dashboard View (or trailing /lab/instructor when logged in)
    if (currentPath === '/lab/instructor' || currentPath === '/lab/instructor/dashboard') {
      return (
        <InstructorDashboard 
          username={instructorName}
          instructorId={instructorId}
          onBack={() => { setInstructorName(''); setInstructorId(''); navigate('/'); }}
          onCreateExam={() => navigate('/lab/instructor/create')}
          onViewResults={() => navigate('/lab/instructor/results')}
        />
      );
    }

    if (currentPath === '/lab/instructor/create') {
      return (
        <CreateExamPage
          instructorId={instructorId}
          onBack={() => navigate('/lab/instructor/dashboard')}
        />
      );
    }

    if (currentPath === '/lab/instructor/results') {
      return (
        <StudentResultsPage 
          instructorId={instructorId}
          onBack={() => navigate('/lab/instructor/dashboard')}
        />
      );
    }
  }

  if (currentPath === '/lab/student') {
    return (
      <SessionCodePage
        onBack={() => navigate('/')}
        onJoin={(config) => {
          setExamConfig(config);
          setActiveTab(config.experiment); // Force the tab
          navigate('/lab/exam');
        }}
      />
    );
  }

  // ── Page: Lab ──────────────────────────────────────────────────
  if (currentPath === '/lab/exam' && !examConfig) {
    navigate('/lab/student');
    return null;
  }

  // Both '/lab/browse' and '/lab/exam' share the same lab UI
  if (currentPath === '/lab/browse' || currentPath === '/lab/exam') {
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
            {navItems.filter(item => !examConfig || item.id === examConfig.experiment).map(item => {
              return (
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
                    cursor: 'pointer'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => {
                setExamConfig(null);
                navigate('/');
              }}
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
            background: 'var(--glass-bg)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              {navItems.find(n => n.id === activeTab)?.label} Experiment
            </h2>

            {examConfig && examConfig.studentName && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name:</span> <span style={{ fontWeight: 600, marginLeft: '6px' }}>{examConfig.studentName}</span>
                     <span style={{ margin: '0 10px', color: 'var(--border-color)' }}>|</span>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID:</span> <span style={{ fontFamily: 'monospace', marginLeft: '6px' }}>{examConfig.studentId}</span>
                  </div>
                  {!examConfig.examComplete && timeLeft !== null && (
                     <div style={{ 
                        padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '1px',
                        background: showWarning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        color: showWarning ? '#ef4444' : '#3b82f6',
                        border: `1px solid ${showWarning ? '#ef4444' : '#3b82f6'}`,
                        animation: showWarning ? 'pulse 2s infinite' : 'none'
                     }}>
                        {Math.floor(timeLeft / 60000).toString().padStart(2, '0')}:
                        {Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0')}
                     </div>
                  )}
                  {examConfig.examComplete && (
                     <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' }}>
                        Exam Finished
                     </div>
                  )}
               </div>
            )}
          </header>

          <div className="experiment-area">
            {activeTab === 'ohm' && <OhmsLaw examConfig={examConfig} onSubmitResult={handleExamSubmit} />}
            {activeTab === 'wheatstone' && <WheatstoneBridge examConfig={examConfig} onSubmitResult={handleExamSubmit} />}
            {activeTab === 'hooke' && <HookesLaw examConfig={examConfig} onSubmitResult={handleExamSubmit} />}
            {activeTab === 'viscosity' && <Viscosity examConfig={examConfig} onSubmitResult={handleExamSubmit} />}
          </div>
        </main>
      </div>
    );
  }

  // Fallback to landing if path not recognized
  return <LandingPage />;
}

export default App;
