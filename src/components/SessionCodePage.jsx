import { useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Hash, ArrowRight } from 'lucide-react';

const CODE_LENGTH = 6;

function SessionCodePage({ onBack, onJoin }) {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
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
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onJoin) onJoin(fullCode);
    }, 1200);
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

        {/* Code Form */}
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
                <span>انضم للاختبار</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-hint">
          اطلب كود الجلسة من الدكتور أو المشرف المسؤول عن الاختبار
        </p>
      </div>
    </div>
  );
}

export default SessionCodePage;
