import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Activity, Battery, TriangleRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

// Standard E12 series resistor values suitable for lab experiments (Ohms)
const STANDARD_RESISTORS = [10, 22, 33, 47, 56, 68, 100, 150, 220, 330, 470, 560, 680, 1000];

export default function OhmsLaw({ examConfig, onSubmitResult }) {
    const [voltage, setVoltage] = useState(12); // Volts
    const [resistance, setResistance] = useState(100); // True Resistance in Ohms
    const voltageSliderRef = useRef(null);
    
    // Evaluation states
    const [studentAnswer, setStudentAnswer] = useState('');
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    // Static device inaccuracies (+/- 2% for AM, +/- 1% for VM) per run
    const [voltageNoise, setVoltageNoise] = useState(1);
    const [currentNoise, setCurrentNoise] = useState(1);

    // Function to generate a new random problem or load exam
    const generateNewResistor = useCallback(() => {
        if (examConfig) {
            setResistance(examConfig.parameters.ohmResistance);
        } else {
            const randomResistor = STANDARD_RESISTORS[Math.floor(Math.random() * STANDARD_RESISTORS.length)];
            setResistance(randomResistor);
        }
        
        // Reset evaluation
        setStudentAnswer('');
        setIsEvaluated(false);
        setIsCorrect(null);

        // Generate new noises
        setVoltageNoise(1 + (Math.random() * 0.02 - 0.01));
        setCurrentNoise(1 + (Math.random() * 0.04 - 0.02));
    }, []);

    // Initialize on mount
    useEffect(() => {
        generateNewResistor();
    }, [generateNewResistor, examConfig?.code]); // Add code to dep so it doesn't re-run on examComplete change

    useEffect(() => {
        if (examConfig?.examComplete) {
            setIsEvaluated(true);
        }
    }, [examConfig?.examComplete]);

    useEffect(() => {
        const el = voltageSliderRef.current;
        if (!el) return;
        const handler = (e) => {
            e.preventDefault();
            setVoltage(v => Math.min(24, Math.max(0, v + (e.deltaY < 0 ? 0.5 : -0.5))));
        };
        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, []);

    const theoreticalCurrent = voltage / resistance;

    // The panel sliders represent the true intended value, but the meters read noisy values
    const measuredVoltage = voltage * voltageNoise;
    const measuredCurrent = theoreticalCurrent * currentNoise;

    // We avoid division by zero when V is strictly 0 to handle initial practical noise calculations gracefully
    const practicalResistance = measuredVoltage > 0.1 && measuredCurrent > 0 
        ? measuredVoltage / measuredCurrent 
        : resistance;

    const handleEvaluate = (e) => {
        e.preventDefault();
        const parsedAnswer = parseFloat(studentAnswer);
        if (isNaN(parsedAnswer)) return;

        // Allow 5% tolerance around the practical noisy resistance or the true resistance
        const lowerBound = practicalResistance * 0.95;
        const upperBound = practicalResistance * 1.05;
        
        // If student correctly calculates from meters OR accidentally guesses true value
        const isAnswerCorrect = (parsedAnswer >= lowerBound && parsedAnswer <= upperBound) || 
                              (parsedAnswer >= resistance * 0.95 && parsedAnswer <= resistance * 1.05);

        setIsCorrect(isAnswerCorrect);
        setIsEvaluated(true);
        
        if (examConfig && onSubmitResult) {
            onSubmitResult(parsedAnswer, resistance);
        }
    };

    // Format current for display (mA if < 1A)
    const displayCurrent = measuredCurrent < 1
        ? `${(measuredCurrent * 1000).toFixed(1)} mA`
        : `${measuredCurrent.toFixed(2)} A`;

    return (
        <div className="glass-panel p-6 w-full max-w-5xl animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>Ohm's Law Simulator</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Calculate the value of the unknown resistor using Voltmeter and Ammeter readings.</p>
                </div>
                {!examConfig && (
                    <div style={{ padding: '12px 24px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Outfit' }}>R = V / I</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginTop: '16px' }}>

                {/* Instruments Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Voltmeter */}
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: '#3b82f633', borderRadius: '50%', color: '#3b82f6' }}>
                                <Activity size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Voltmeter (V)</h3>
                        </div>

                        <div className="device-display" style={{ fontSize: '2.5rem', textAlign: 'right', letterSpacing: '2px' }}>
                            {measuredVoltage.toFixed(2)} V
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span>Power Supply</span>
                                <span>{voltage} V</span>
                            </div>
                            <input
                                ref={voltageSliderRef}
                                type="range"
                                min="0" max="24" step="0.5"
                                value={voltage}
                                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <span>0V</span>
                                <span>24V</span>
                            </div>
                        </div>
                    </div>

                    {/* Ammeter */}
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: '#10b98133', borderRadius: '50%', color: '#10b981' }}>
                                <Zap size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Ammeter (I)</h3>
                        </div>

                        <div className="device-display green" style={{ fontSize: '2.5rem', textAlign: 'right', letterSpacing: '2px' }}>
                            {displayCurrent}
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Calculated from circuit</p>
                            <div style={{ height: '4px', background: '#10b98133', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: '#10b981',
                                    width: `${Math.min(100, (measuredCurrent / 0.5) * 100)}%`,
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Circuit & Evaluation Panel */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', background: '#f59e0b33', borderRadius: '50%', color: '#f59e0b' }}>
                            <TriangleRight size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Unknown Resistor (R)</h3>
                    </div>

                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                        {/* CSS Resistor visualization */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                            <div style={{ width: '40px', height: '4px', background: '#94a3b8' }}></div>
                            <div style={{
                                width: '120px', height: '40px', background: `linear-gradient(90deg, #d97706, #f59e0b 20%, #b45309 80%, #d97706)`,
                                borderRadius: '8px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)'
                            }}>
                                <div style={{ width: '6px', height: '100%', background: '#bfdbfe' }}></div>
                                <div style={{ width: '6px', height: '100%', background: '#475569' }}></div>
                                <div style={{ width: '6px', height: '100%', background: '#1e293b' }}></div>
                                <div style={{ width: '6px', height: '100%', background: '#fbbf24' }}></div>
                            </div>
                            <div style={{ width: '40px', height: '4px', background: '#94a3b8' }}></div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: isEvaluated ? (examConfig ? '#3b82f6' : (isCorrect ? '#10b981' : '#ef4444')) : '#f59e0b', marginTop: '16px' }}>
                            {isEvaluated ? (examConfig ? '*** Ω' : `${resistance} Ω`) : '? Ω'}
                        </div>
                        {isEvaluated && !examConfig && (
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                True Value
                            </div>
                        )}
                    </div>

                    {/* Student Input Section */}
                    <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.05rem' }}>Calculate the Resistance</h4>
                        
                        <form onSubmit={handleEvaluate} style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="Enter your result..."
                                    value={studentAnswer}
                                    onChange={(e) => setStudentAnswer(e.target.value)}
                                    disabled={isEvaluated}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        paddingRight: '40px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        borderColor: isEvaluated ? (examConfig ? '#3b82f6' : (isCorrect ? '#10b981' : '#ef4444')) : 'var(--glass-border)'
                                    }}
                                />
                                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>Ω</span>
                            </div>
                            
                            {!isEvaluated ? (
                                <button
                                    type="submit"
                                    disabled={!studentAnswer.trim()}
                                    style={{
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0 20px',
                                        fontWeight: 600,
                                        cursor: studentAnswer.trim() ? 'pointer' : 'not-allowed',
                                        opacity: studentAnswer.trim() ? 1 : 0.6
                                    }}
                                >
                                    Check
                                </button>
                            ) : (
                                !examConfig && (
                                    <button
                                        type="button"
                                        onClick={generateNewResistor}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)',
                                            borderRadius: '8px',
                                            padding: '0 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <RefreshCw size={18} /> Retry
                                    </button>
                                )
                            )}
                        </form>

                        {/* Result Feedback */}
                        {isEvaluated && (
                            <div style={{ 
                                marginTop: '16px', 
                                padding: '12px', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: examConfig ? 'rgba(59, 130, 246, 0.1)' : (isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                border: `1px solid ${examConfig ? 'rgba(59, 130, 246, 0.3)' : (isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')}`
                            }}>
                                {examConfig ? <CheckCircle2 size={24} color="#3b82f6" /> : (isCorrect ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />)}
                                <div>
                                    <div style={{ fontWeight: 600, color: examConfig ? '#3b82f6' : (isCorrect ? '#10b981' : '#ef4444') }}>
                                        {examConfig ? 'شكراً لك، لقت تم تسجيل إجابتك بنجاح' : (isCorrect ? 'Correct! Excellent job.' : 'Incorrect.')}
                                    </div>
                                    {(!examConfig && !isCorrect) && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Remember to convert current to Amperes before calculating! (1000 mA = 1 A)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}
