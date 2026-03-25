import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Save, CheckCircle2 } from 'lucide-react';

function StudentResultsPage({ onBack }) {
  const [results, setResults] = useState([]);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('physics_results');
    if (data) {
      setResults(JSON.parse(data));
    }
  }, []);

  const handleGradeChange = (index, value) => {
    const newResults = [...results];
    newResults[index].instructorGrade = value;
    setResults(newResults);
  };

  const saveGrades = () => {
    localStorage.setItem('physics_results', JSON.stringify(results));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="app-container" style={{ background: 'var(--bg-main)' }}>
      {/* Top Header */}
      <header style={{
        padding: '24px 32px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--glass-bg)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', borderRadius: '8px', padding: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>نتائج الطلاب</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>عرض درجات الامتحانات وتقييمها</p>
          </div>
        </div>

        <button 
          onClick={saveGrades}
          style={{
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
          }}
        >
          {savedMessage ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {savedMessage ? 'تم الحفظ' : 'حفظ التقييمات'}
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
            <Users size={24} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>سجل اختبارات العملي</h3>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              لا توجد أية نتائج للطلاب بعد.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>التجربة</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>اسم الطالب</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>الرقم الأكاديمي (ID)</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>كود الاختبار</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>إجابة الطالب</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>القيمة الفعلية (الصحيحة)</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>الدرجة</th>
                </tr>
              </thead>
              <tbody>
                {results.map((req, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', color: 'var(--primary)' }}>{req.experiment}</td>
                    <td style={{ padding: '16px' }}>{req.studentName}</td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#a78bfa' }}>{req.studentId}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {req.examCode}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: req.studentResult === '--' ? '#ef4444' : '#10b981' }}>
                      {req.studentResult} {req.studentResult !== '--' ? req.unit : ''}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      {req.actualResult} {req.unit}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <input 
                        type="text" 
                        placeholder="0/10"
                        value={req.instructorGrade || ''}
                        onChange={(e) => handleGradeChange(index, e.target.value)}
                        style={{
                          width: '80px', padding: '8px', background: 'rgba(0,0,0,0.3)', 
                          border: '1px solid var(--glass-border)', color: '#fff', 
                          borderRadius: '8px', textAlign: 'center', outline: 'none'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentResultsPage;
