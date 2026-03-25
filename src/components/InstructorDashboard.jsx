import { useState, useEffect } from 'react';
import { LogOut, PlusCircle, Users, Activity, GraduationCap, ClipboardList, TrendingUp } from 'lucide-react';

function InstructorDashboard({ onBack, onCreateExam, onViewResults, username }) {
  const [stats, setStats] = useState({ totalExams: 0, totalStudents: 0 });

  useEffect(() => {
    // Generate some fake stats based on physics_results if exists
    const results = JSON.parse(localStorage.getItem('physics_results') || '[]');
    setStats({
      totalExams: new Set(results.map(r => r.examCode)).size || 0,
      totalStudents: results.length || 0
    });
  }, []);

  const handleLogout = () => {
    window.location.hash = ''; // Clear hash
    onBack();
  };

  return (
    <div className="app-container" style={{ background: '#090d19', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav style={{
        padding: '20px 40px', background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, color: '#f8fafc', letterSpacing: '-0.5px' }}>بوابة إدارة المختبر</h1>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Instructor Portal v2.0</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#e2e8f0' }}>{username || 'د. محمد'}</span>
            <span style={{ fontSize: '0.8rem', color: '#818cf8' }}>أستاذ المادة</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#f87171', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        
        {/* Welcome & Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: '24px', marginBottom: '40px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '20px', padding: '30px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '10px' }}>مرحباً بك مجدداً</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px' }}>
                يمكنك من خلال لوحة التحكم متابعة أداء طلابك وإعداد تجارب معملية جديدة بسهولة وأمان.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Stat 1 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px' }}>
              <ClipboardList size={32} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>اختبارات مفتوحة</p>
              <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{stats.totalExams}</h3>
            </div>
          </div>
          
          {/* Stat 2 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
              <Users size={32} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>إجمالي الطلاب المُختبرين</p>
              <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{stats.totalStudents}</h3>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>التفاعل اليومي</p>
              <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>نشط</h3>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
          {/* Create Exam */}
          <div 
            onClick={onCreateExam}
            style={{
              padding: '40px', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.2)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'; }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(99, 102, 241, 0.1)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(30px)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', color: '#818cf8', boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.1)' }}>
                <PlusCircle size={40} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '12px' }}>إنشاء اختبار جديد</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  توليد كود جلسة مؤمن وتحديد المعاملات الفيزيائية لبدء امتحان للطلاب.
                </p>
              </div>
            </div>
          </div>

          {/* View Results */}
          <div 
            onClick={onViewResults}
            style={{
              padding: '40px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(16, 185, 129, 0.05)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(30px)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '16px', color: '#34d399', boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.1)' }}>
                <Activity size={40} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '12px' }}>سجل النتائج والتقييم</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  مراجعة درجات الطلاب، التحقق من الإجابات المعملية، ورصد التقييمات النهائية.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;
