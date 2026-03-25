import { useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Hash, ArrowRight } from 'lucide-react';

const CODE_LENGTH = 6;

function SessionCodePage({ onBack, onJoin }) {
  const [step, setStep] = useState('code'); // 'code' or 'info'
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  const handleChange = (idx, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[idx] = digit;
    setCode(newCode);
    if (digit && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const newCode = Array(CODE_LENGTH).fill('');
    [...pasted].forEach((ch, i) => { newCode[i] = ch; });
    setCode(newCode);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      setError('Please enter the full 6-digit session code.');
      return;
    }
    
    // Validate against localStorage
    const savedConfigStr = localStorage.getItem(`physics_exam_${fullCode}`);
    if (!savedConfigStr) {
      setError('كود الجلسة غير صالح أو غير موجود (Invalid Session Code).');
      return;
    }

    const savedConfig = JSON.parse(savedConfigStr);
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('info'); // Move to next step instead of joining immediately
    }, 1000);
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      setError('يرجى إدخال الاسم والرقم الأكاديمي المكون من أرقام فقط.');
      return;
    }
    
    // Validate ID is somewhat numeric-like if needed, but simple trim check is okay.
    const fullCode = code.join('');
    const savedConfig = JSON.parse(localStorage.getItem(`physics_exam_${fullCode}`));
    
    // Add student details
    savedConfig.studentName = studentName.trim();
    savedConfig.studentId = studentId.trim();
    savedConfig.startTime = Date.now(); // 30 minutes start now

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onJoin) onJoin(savedConfig);
    }, 800);
  };

  const isFull = code.every((d) => d !== '');

  return (
    <div className="auth-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="auth-card glass-panel">
        {/* Back Button */}
        <button className="auth-back-btn" onClick={onBack} id="session-back-btn">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrapper auth-icon--student">
            <BookOpen size={32} strokeWidth={1.5} />
          </div>
          <h2 className="auth-title">Join Quiz</h2>
          <p className="auth-subtitle">أدخل كود الجلسة للانضمام إلى الاختبار</p>
        </div>

        {step === 'code' ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="session-code-label">
              <Hash size={16} />
              <span>Session Code</span>
            </div>

            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  id={`code-digit-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`code-digit-input ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className={`auth-submit-btn ${!isFull ? 'auth-submit-btn--disabled' : ''}`}
              disabled={loading || !isFull}
              id="session-submit-btn"
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <span>تأكيد الكود</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleInfoSubmit} style={{ marginTop: '20px' }}>
            <div className="auth-field" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '8px', fontSize: '0.9rem' }}>الاسم الرباعي</label>
              <input
                type="text"
                placeholder="أدخل اسمك كاملاً"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                  color: '#fff', outline: 'none', transition: 'border-color 0.2s'
                }}
                autoFocus
              />
            </div>

            <div className="auth-field" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '8px', fontSize: '0.9rem' }}>الرقم الأكاديمي (ID)</label>
              <input
                type="text"
                placeholder="أدخل رقمك الأكاديمي"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                  color: '#fff', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !studentName.trim() || !studentId.trim()}
              id="student-info-submit"
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <span>بدء الاختبار (30 دقيقة)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="auth-hint">
          اطلب كود الجلسة من الدكتور أو المشرف المسؤول عن الاختبار
        </p>
      </div>
    </div>
  );
}

export default SessionCodePage;
