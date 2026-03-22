import { PlusCircle, PlayCircle, Zap, FlaskConical, Microscope } from 'lucide-react';

function LandingPage({ onCreateQuiz, onTakeQuiz, onEnterLab }) {
  return (
    <div className="landing-page">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="landing-content">
        {/* Logo / Title */}
        <div className="landing-logo">
          <div className="logo-icon-wrapper">
            <FlaskConical size={40} strokeWidth={1.5} />
          </div>
          <div className="logo-text">
            <h1>Physics Lab</h1>
            <span>Virtual Simulator</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="landing-hero">
          <h2 className="hero-title">
            Interactive Physics
            <span className="hero-accent"> Experiments</span>
          </h2>
          <p className="hero-subtitle">
            Explore Ohm's Law, Wheatstone Bridge, Hooke's Law, and Viscosity through immersive virtual lab experiments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="landing-actions">
          <button
            className="landing-btn landing-btn--primary"
            onClick={onCreateQuiz}
            id="create-quiz-btn"
          >
            <div className="btn-icon-wrapper btn-icon--primary">
              <PlusCircle size={28} strokeWidth={1.8} />
            </div>
            <div className="btn-text">
              <span className="btn-title">إنشاء اختبار</span>
              <span className="btn-subtitle">Create a new quiz session</span>
            </div>
            <Zap size={16} className="btn-arrow" />
          </button>

          <button
            className="landing-btn landing-btn--secondary"
            onClick={onTakeQuiz}
            id="take-quiz-btn"
          >
            <div className="btn-icon-wrapper btn-icon--secondary">
              <PlayCircle size={28} strokeWidth={1.8} />
            </div>
            <div className="btn-text">
              <span className="btn-title">أداء اختبار</span>
              <span className="btn-subtitle">Join with session code</span>
            </div>
            <Zap size={16} className="btn-arrow" />
          </button>

          {/* Enter Lab directly */}
          <button
            className="landing-btn landing-btn--lab"
            onClick={onEnterLab}
            id="enter-lab-btn"
          >
            <div className="btn-icon-wrapper btn-icon--lab">
              <Microscope size={28} strokeWidth={1.8} />
            </div>
            <div className="btn-text">
              <span className="btn-title">الدخول للتجارب</span>
              <span className="btn-subtitle">Browse all experiments</span>
            </div>
            <Zap size={16} className="btn-arrow" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="landing-stats">
          <div className="stat-item">
            <span className="stat-number">4</span>
            <span className="stat-label">Experiments</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Interactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
