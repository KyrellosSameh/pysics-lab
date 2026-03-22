import { useState } from 'react';
import { ArrowLeft, GraduationCap, Eye, EyeOff, LogIn, Lock, User } from 'lucide-react';

function LoginPage({ onBack, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // Simulate auth – replace with real logic
    setTimeout(() => {
      setLoading(false);
      if (onLogin) onLogin({ username });
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="auth-card glass-panel">
        {/* Back Button */}
        <button className="auth-back-btn" onClick={onBack} id="login-back-btn">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrapper auth-icon--instructor">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>
          <h2 className="auth-title">Instructor Login</h2>
          <p className="auth-subtitle">تسجيل دخول المدرس لإنشاء اختبار جديد</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <LogIn size={18} />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
