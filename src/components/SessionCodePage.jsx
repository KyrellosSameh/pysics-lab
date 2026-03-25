import { useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Hash, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CODE_LENGTH = 6;

function SessionCodePage({ onBack, onJoin }) {
  const [step, setStep] = useState('code'); // 'code' or 'info'
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  // Store the exam data fetched from Supabase so we can use it in step 2
  const [examData, setExamData] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      setError('Please enter the full 6-digit session code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Query Supabase for the session code
      const { data, error: fetchError } = await supabase
        .from('exams')
        .select('*')
        .eq('session_code', fullCode)
        .single();

      if (fetchError || !data) {
        setError('كود الجلسة غير صالح أو غير موجود (Invalid Session Code).');
        setLoading(false);
        return;
      }

      // Check if the code has already been used
      if (data.used) {
        setError('هذا الكود تم استخدامه بالفعل من طالب آخر (Code already used).');
        setLoading(false);
        return;
      }

      // Store the exam data for step 2
      setExamData(data);
      setStep('info');
    } catch (err) {
      console.error('Error validating code:', err);
      setError('حدث خطأ أثناء التحقق من الكود. تأكد من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      setError('يرجى إدخال الاسم والرقم الأكاديمي.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Verify student is registered
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('student_id')
        .eq('student_id', studentId.trim());

      if (studentError) throw studentError;
      
      if (!studentData || studentData.length === 0) {
        setError('هذا الرقم الأكاديمي غير مسجل في النظام. المرجو التأكد من الرقم.');
        setLoading(false);
        return;
      }

      // 2. Prevent taking the same experiment twice
      const { data: previousResults, error: resultsError } = await supabase
        .from('results')
        .select('id')
        .eq('student_id', studentId.trim())
        .eq('experiment', examData.experiment_name);

      if (resultsError) throw resultsError;

      if (previousResults && previousResults.length > 0) {
        setError('لقد قمت بإجراء هذا الاختبار (التجربة) من قبل ولا يُسمح لك بإعادته.');
        setLoading(false);
        return;
      }

      // Mark the exam as used in Supabase
      const { error: updateError } = await supabase
        .from('exams')
        .update({ used: true })
        .eq('session_code', examData.session_code);

      if (updateError) {
        throw updateError;
      }

      // Build the exam config from Supabase data
      const examConfig = {
        experiment: examData.experiment_name,
        parameters: examData.parameters,
        code: examData.session_code,
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        instructorId: examData.instructor_id,
        startTime: Date.now(), // 30 minutes start now
      };

      if (onJoin) onJoin(examConfig);
    } catch (err) {
      console.error('Error joining exam:', err);
      setError('حدث خطأ أثناء الانضمام للاختبار. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
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
