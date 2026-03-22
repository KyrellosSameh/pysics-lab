import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Activity, CheckCircle2, XCircle, TriangleRight } from 'lucide-react';

const STANDARD_RESISTORS = [10, 22, 33, 47, 56, 68, 100, 150, 220, 330, 470, 560, 680, 1000];

export default function WheatstoneBridge() {
    const [knownR, setKnownR] = useState(100);
    const [rx, setRx] = useState(150); // Unknown resistor
    const [jockeyL, setJockeyL] = useState(50); // Position in cm (0 to 100)
    const [voltage] = useState(12);

    // Evaluation states
    const [studentAnswer, setStudentAnswer] = useState('');
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const [tKnown, setTKnown] = useState(1);
    const [wireTotalR, setWireTotalR] = useState(10);
    const [tNoise, setTNoise] = useState(1);

    const generateNewRx = useCallback(() => {
        const randomValue = Math.floor(Math.random() * 90 + 10) * 10; // 100 to 1000 in steps of 10
        setRx(randomValue);
        
        // Reset evaluation
        setStudentAnswer('');
        setIsEvaluated(false);
        setIsCorrect(null);
        
        // Regenerate precision variations
        setTKnown(1 + (Math.random() * 0.02 - 0.01));
        setWireTotalR(10 + (Math.random() * 0.5 - 0.25));
        setTNoise(1 + (Math.random() * 0.02 - 0.01));
    }, []);

    // Initialize on mount
    useEffect(() => {
        generateNewRx();
    }, [generateNewRx]);

    const actualKnownR = knownR * tKnown;
    // For vUpper, Left=V, Right=0. Left is Rx, Right is KnownR.
    const vUpper = voltage * actualKnownR / (rx + actualKnownR);
    
    const actualWireL1 = wireTotalR * (jockeyL / 100);
    const actualWireL2 = wireTotalR * ((100 - jockeyL) / 100);
    const vLower = voltage * actualWireL2 / (actualWireL1 + actualWireL2);

    const galvanometerV = (vUpper - vLower);
    
    // Noise to jitter the reading slightly
    const displayV = galvanometerV + (Math.random() * 0.002 - 0.001) * tNoise;
    const isBalanced = Math.abs(displayV) < 0.05;

    // Calculation limit: +/- 12V rotation scaled to +/- 45deg
    const needleRotation = Math.max(-45, Math.min(45, (galvanometerV / 2) * 45));

    const handleEvaluate = (e) => {
        e.preventDefault();
        const parsedAnswer = parseFloat(studentAnswer);
        if (isNaN(parsedAnswer)) return;

        // Determine if they were roughly balanced somewhere logic 
        // Rx = R * L / (100 - L)
        const studentCalcIdeal = knownR * (jockeyL / (100 - jockeyL || 1));
        
        // We will accept if they just calculated their current slider state OR the true rx
        const isMatchCalc = Math.abs(parsedAnswer - studentCalcIdeal) / studentCalcIdeal < 0.05;
        const isMatchReal = Math.abs(parsedAnswer - rx) / rx < 0.05;

        // If it's not well-balanced, matching 'calc' shouldn't be 'correct', 
        // so we check if the bridge is somewhat balanced OR if they got the real answer.
        const isAnswerCorrect = (isMatchCalc && isBalanced) || isMatchReal;

        setIsCorrect(isAnswerCorrect);
        setIsEvaluated(true);
    };

    return (
        <div className="glass-panel p-6 w-full max-w-5xl animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>Meter Bridge (Wheatstone)</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Balance the bridge by sliding the jockey, then calculate the unknown resistance R<sub>x</sub>.</p>
                </div>
                <div style={{ padding: '12px 24px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Outfit' }}>R<sub style={{fontSize: '0.8rem'}}>x</sub> = R × (L / (100 - L))</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '16px' }}>

                {/* Left Side: Circuit and Meter Bridge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Circuit Schematic Area */}
                    <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        
                        {/* Schema Visualizer */}
                        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid #3b82f6', textAlign: 'center', width: '120px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '8px' }}>Unknown R<sub>x</sub></div>
                                <div style={{ fontWeight: 'bold' }}>Left Gap</div>
                            </div>
                            
                            {/* Galvanometer */}
                            <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden', borderBottom: '2px solid var(--border-color)', margin: '0 20px' }}>
                                {/* Dial background */}
                                <div style={{ width: '120px', height: '120px', border: '2px solid var(--text-muted)', borderRadius: '50%', position: 'absolute', top: '0', left: '0' }}></div>
                                {/* Pivot point */}
                                <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', position: 'absolute', bottom: '-6px', left: '54px', zIndex: 10 }}></div>
                                {/* Needle */}
                                <div style={{
                                    width: '3px', height: '54px', background: '#ef4444', position: 'absolute', bottom: '0', left: '58.5px',
                                    transformOrigin: 'bottom center', transform: `rotate(${needleRotation}deg)`, transition: 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)', zIndex: 5
                                }}></div>
                                {/* Scale marks */}
                                <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '10px' }}>0</div>
                                <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '12px', color: isBalanced ? '#10b981' : 'var(--text-muted)', letterSpacing: '1px' }}>
                                    {displayV.toFixed(3)} A
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid #10b981', textAlign: 'center', width: '120px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', marginBottom: '8px' }}>Known R</div>
                                <div style={{ fontWeight: 'bold' }}>{knownR} Ω</div>
                            </div>
                        </div>

                        {/* Meter Bridge Wire */}
                        <div style={{ width: '100%', position: 'relative', padding: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', padding: '0 10px' }}>
                                <span>0 cm</span>
                                <span>100 cm</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="99" step="0.1" 
                                value={jockeyL} 
                                onChange={(e) => setJockeyL(parseFloat(e.target.value))} 
                                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px' }} 
                            />
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                                L = {jockeyL.toFixed(1)} cm
                            </div>
                        </div>
                    </div>

                    {/* Known R Control */}
                    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: '#10b98133', borderRadius: '50%', color: '#10b981' }}>
                                <Activity size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Resistance Box (Known R)</h3>
                        </div>

                        <div className="device-display green" style={{ fontSize: '2.5rem', textAlign: 'right', letterSpacing: '2px', marginBottom: '16px' }}>
                            {knownR} Ω
                        </div>

                        <select 
                            value={knownR}
                            onChange={(e) => setKnownR(parseInt(e.target.value))}
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '1.1rem', cursor: 'pointer', outline: 'none' }}
                        >
                            {STANDARD_RESISTORS.map(r => <option key={r} value={r}>{r} Ω</option>)}
                        </select>
                    </div>

                </div>

                {/* Right Side: Evaluation Block */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', background: '#f59e0b33', borderRadius: '50%', color: '#f59e0b' }}>
                            <TriangleRight size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Unknown Resistor (R<sub>x</sub>)</h3>
                    </div>

                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isEvaluated ? (isCorrect ? '#10b981' : '#ef4444') : '#f59e0b', marginTop: '16px' }}>
                            {isEvaluated ? `${rx} Ω` : '? Ω'}
                        </div>
                        {isEvaluated && (
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                True Value
                            </div>
                        )}
                    </div>

                    {/* Student Input Section */}
                    <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Calculate the Resistance</span>
                            {!isBalanced && !isEvaluated && <span style={{fontSize: '0.8rem', color: '#ef4444', animation: 'pulse 2s infinite'}}>Must balance bridge first!</span>}
                        </h4>
                        
                        <form onSubmit={handleEvaluate} style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="Enter your result..."
                                    value={studentAnswer}
                                    onChange={(e) => setStudentAnswer(e.target.value)}
                                    disabled={isEvaluated || !isBalanced}
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
                                        borderColor: isEvaluated ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--glass-border)',
                                        opacity: (!isBalanced && !isEvaluated) ? 0.5 : 1
                                    }}
                                />
                                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>Ω</span>
                            </div>
                            
                            {!isEvaluated ? (
                                <button
                                    type="submit"
                                    disabled={!studentAnswer.trim() || !isBalanced}
                                    style={{
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0 20px',
                                        fontWeight: 600,
                                        cursor: (studentAnswer.trim() && isBalanced) ? 'pointer' : 'not-allowed',
                                        opacity: (studentAnswer.trim() && isBalanced) ? 1 : 0.6
                                    }}
                                >
                                    Check
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={generateNewRx}
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
                                background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {isCorrect ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
                                <div>
                                    <div style={{ fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444' }}>
                                        {isCorrect ? 'Correct! Excellent job.' : 'Incorrect.'}
                                    </div>
                                    {!isCorrect && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Remember: <strong style={{color: '#fff'}}>R<sub>x</sub> = R × (L / (100 - L))</strong>. Did you use the balance length correctly?
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
