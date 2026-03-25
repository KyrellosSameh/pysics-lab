import { useState } from 'react';
import { 
  ArrowLeft, FileText, Activity, Atom, Scale, TestTube, 
  Settings, CheckCircle2, Copy 
} from 'lucide-react';

function CreateExamPage({ onBack }) {
  const [experiment, setExperiment] = useState('ohm');
  
  // Specific inputs
  const [ohmResistance, setOhmResistance] = useState(50);
  const [wheatstoneUnknown, setWheatstoneUnknown] = useState(45);
  const [hookeSpringConstant, setHookeSpringConstant] = useState(50);
  const [viscosityLiquid, setViscosityLiquid] = useState('Glycerin');
  const [viscosityBalls, setViscosityBalls] = useState([2, 3, 4, 5, 6]);
  
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCode('');
    
    // Simulate generation delay
    setTimeout(() => {
      setLoading(false);
      // Generate a random 6-digit numeric code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // Save the exam configuration to localStorage
      const examConfig = {
        experiment,
        parameters: {
          ohmResistance,
          wheatstoneUnknown,
          hookeSpringConstant,
          viscosityLiquid,
          viscosityBalls
        },
        code
      };
      
      localStorage.setItem(`physics_exam_${code}`, JSON.stringify(examConfig));
      console.log('Exam Configuration Saved:', examConfig);
    }, 800);
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderExperimentInputs = () => {
    switch (experiment) {
      case 'ohm':
        return (
          <div className="auth-field" style={{ animation: 'fadeIn 0.3s ease' }}>
            <label htmlFor="ohmRes">قيمة المقاومة المجهولة (أوم)</label>
            <div className="auth-input-wrapper">
              <Activity size={18} className="auth-input-icon" />
              <input
                id="ohmRes"
                type="number"
                min="1"
                max="500"
                value={ohmResistance}
                onChange={(e) => setOhmResistance(Number(e.target.value))}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
               حدد قيمة المقاومة التي يجب على الطالب حسابها (1 - 500 أوم)
            </p>
          </div>
        );
      case 'wheatstone':
        return (
          <div className="auth-field" style={{ animation: 'fadeIn 0.3s ease' }}>
            <label htmlFor="wheatRes">المقاومة المجهولة Rx (أوم)</label>
            <div className="auth-input-wrapper">
              <Atom size={18} className="auth-input-icon" />
              <input
                id="wheatRes"
                type="number"
                min="1"
                max="500"
                value={wheatstoneUnknown}
                onChange={(e) => setWheatstoneUnknown(Number(e.target.value))}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              حدد قيمة المقاومة المجهولة لتجربة قنطرة ويتستون
            </p>
          </div>
        );
      case 'hooke':
        return (
          <div className="auth-field" style={{ animation: 'fadeIn 0.3s ease' }}>
            <label htmlFor="springConst">ثابت الزنبرك k (نيوتن/متر)</label>
            <div className="auth-input-wrapper">
              <Scale size={18} className="auth-input-icon" />
              <input
                id="springConst"
                type="number"
                min="10"
                max="200"
                value={hookeSpringConstant}
                onChange={(e) => setHookeSpringConstant(Number(e.target.value))}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              حدد قيمة ثابت الزنبرك للتجربة (10 - 200 N/m)
            </p>
          </div>
        );
      case 'viscosity':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="auth-field">
              <label htmlFor="liquidType">نوع السائل</label>
              <div className="auth-input-wrapper">
                <TestTube size={18} className="auth-input-icon" />
                <select
                  id="liquidType"
                  value={viscosityLiquid}
                  onChange={(e) => setViscosityLiquid(e.target.value)}
                >
                  <option value="Glycerin">جلسرين (Glycerin)</option>
                  <option value="Castor Oil">زيت خروع (Castor Oil)</option>
                  <option value="Motor Oil">زيت محرك (Motor Oil)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[0, 1, 2, 3, 4].map((index) => (
                <div className="auth-field" key={`ball-${index}`} style={{ margin: 0 }}>
                  <label htmlFor={`ball${index}`} style={{ fontSize: '0.75rem' }}>كرة {index + 1} (ملم)</label>
                  <div className="auth-input-wrapper" style={{ padding: '8px' }}>
                    <input
                      id={`ball${index}`}
                      type="number"
                      min="1"
                      max="20"
                      step="0.1"
                      value={viscosityBalls[index]}
                      onChange={(e) => {
                        const newBalls = [...viscosityBalls];
                        newBalls[index] = Number(e.target.value);
                        setViscosityBalls(newBalls);
                      }}
                      style={{ paddingLeft: '4px', textAlign: 'center' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-4px' }}>
              حدد السائل المستخدم والأقطار المتاحة للكرات المعدنية الخمسة
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        {/* Back Button */}
        <button className="auth-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>العودة</span>
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrapper auth-icon--instructor" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <h2 className="auth-title">إنشاء اختبار جديد</h2>
          <p className="auth-subtitle">قم بتحديد التجربة والمتغيرات الخاصة بها لتوليد كود الاختبار</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleGenerate}>
          
          {/* Experiment Selection */}
          <div className="auth-field">
            <label htmlFor="experiment">اختر التجربة</label>
            <div className="auth-input-wrapper" style={{ padding: 0 }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {experiment === 'ohm' && <Activity size={18} />}
                {experiment === 'wheatstone' && <Atom size={18} />}
                {experiment === 'hooke' && <Scale size={18} />}
                {experiment === 'viscosity' && <TestTube size={18} />}
              </div>
              <select
                id="experiment"
                value={experiment}
                onChange={(e) => {
                  setExperiment(e.target.value);
                  setGeneratedCode(''); // reset code on change
                }}
              >
                <option value="ohm">قانون أوم (Ohm's Law)</option>
                <option value="wheatstone">قنطرة ويتستون (Wheatstone Bridge)</option>
                <option value="hooke">قانون هوك (Hooke's Law)</option>
                <option value="viscosity">تجربة اللزوجة (Viscosity)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Inputs Based on Experiment */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '16px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '20px'
          }}>
            {renderExperimentInputs()}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{ marginBottom: '16px' }}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <FileText size={18} />
                <span>توليد كود الاختبار</span>
              </>
            )}
          </button>

          {/* Generated Code Display */}
          {generatedCode && (
            <div style={{ 
              animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              <p style={{ color: '#10b981', margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} />
                تم توليد كود الاختبار بنجاح
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '12px',
                background: 'rgba(0,0,0,0.2)',
                padding: '12px 20px',
                borderRadius: '8px',
                width: 'fit-content',
                margin: '0 auto'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '4px', color: '#fff', fontFamily: 'monospace' }}>
                  {generatedCode}
                </span>
                <button 
                  type="button" 
                  onClick={handleCopy}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: copied ? '#10b981' : 'var(--text-muted)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  title="نسخ الكود"
                >
                  {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', marginBottom: 0 }}>
                أعط هذا الكود للطلاب للدخول إلى الاختبار الخاص بك
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateExamPage;
