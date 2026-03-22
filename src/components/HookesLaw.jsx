import React, { useState, useEffect, useCallback } from 'react';
import { Scale, ArrowDown, RefreshCw, TriangleRight, CheckCircle2, XCircle } from 'lucide-react';

export default function HookesLaw() {
    const [attachedMasses, setAttachedMasses] = useState([]); // array of { id, grams }
    const [dragOverHook, setDragOverHook] = useState(false);

    // Unknown spring evaluation state
    const [springConstant, setSpringConstant] = useState(20);
    const [noiseMultiplier, setNoiseMultiplier] = useState(1);
    const [studentAnswer, setStudentAnswer] = useState('');
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const generateNewSpring = useCallback(() => {
        // Values typically between 10 and 50 
        const newK = Math.floor(Math.random() * 41) + 10;
        setSpringConstant(newK);
        setNoiseMultiplier(1 + (Math.random() * 0.06 - 0.03)); // +/- 3% error

        // Reset
        setAttachedMasses([]);
        setStudentAnswer('');
        setIsEvaluated(false);
        setIsCorrect(null);
    }, []);

    // Initialize on mount
    useEffect(() => {
        generateNewSpring();
    }, [generateNewSpring]);

    // Available mass types in the lab tray
    const MASS_TYPES = [
        { grams: 10, color: '#f87171', label: '10 g' },
        { grams: 20, color: '#fb923c', label: '20 g' },
        { grams: 50, color: '#facc15', label: '50 g' },
        { grams: 100, color: '#4ade80', label: '100 g' },
        { grams: 200, color: '#60a5fa', label: '200 g' },
    ];

    const mass = attachedMasses.reduce((sum, m) => sum + m.grams / 1000, 0); // kg
    const [currentVisualDisplacement, setCurrentVisualDisplacement] = useState(0);

    const physicsRef = React.useRef({ y: 0, v: 0, lastTime: 0 });
    const reqRef = React.useRef();

    const g = 9.8; // m/s^2

    // Target Physics
    const theoreticalForce = mass * g; // Newtons
    const theoreticalDisplacement = theoreticalForce / springConstant; // meters
    const force = theoreticalForce;
    const targetDisplacement = theoreticalDisplacement * noiseMultiplier;

    // Live displacement for UI
    const liveDisplacement = currentVisualDisplacement / 1000;
    const readingNoiseCm = (Math.sin(currentVisualDisplacement * 0.07) * 0.05);

    const visualTargetDisplacement = targetDisplacement * 1000; // pixels
    const baseSpringLength = 80;

    // Physics Animation Loop
    useEffect(() => {
        const loop = (timestamp) => {
            if (!physicsRef.current.lastTime) physicsRef.current.lastTime = timestamp;
            const dt = Math.min((timestamp - physicsRef.current.lastTime) / 1000, 0.05);
            physicsRef.current.lastTime = timestamp;

            const state = physicsRef.current;
            const k = springConstant;
            const damping = 0.6;
            const m = mass || 0.1;

            const springForce = -k * (state.y - visualTargetDisplacement);
            const dampingForce = -damping * state.v;
            const acceleration = (springForce + dampingForce) / m;

            state.v += acceleration * dt;
            state.y += state.v * dt;

            setCurrentVisualDisplacement(state.y);

            if (Math.abs(state.v) > 0.5 || Math.abs(state.y - visualTargetDisplacement) > 0.5) {
                reqRef.current = requestAnimationFrame(loop);
            }
        };

        physicsRef.current.lastTime = 0;
        reqRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(reqRef.current);
    }, [mass, springConstant, visualTargetDisplacement]);

    const totalSpringLength = baseSpringLength + currentVisualDisplacement;

    const numCoils = 15;
    const coilHeight = totalSpringLength / numCoils;
    const coilWidth = 30;

    let springPath = `M 0,0 L 0,10 `;
    for (let i = 0; i < numCoils; i++) {
        const yControl1 = 10 + (i * coilHeight) + (coilHeight / 3);
        const yControl2 = 10 + (i * coilHeight) + (2 * coilHeight / 3);
        const yEnd = 10 + ((i + 1) * coilHeight);

        if (i % 2 === 0) {
            springPath += `C ${coilWidth},${yControl1} ${coilWidth},${yControl2} 0,${yEnd} `;
        } else {
            springPath += `C -${coilWidth},${yControl1} -${coilWidth},${yControl2} 0,${yEnd} `;
        }
    }
    springPath += `L 0,${totalSpringLength + 20}`;

    const handleEvaluate = (e) => {
        e.preventDefault();
        const parsedAnswer = parseFloat(studentAnswer);
        if (isNaN(parsedAnswer)) return;

        // The student should calculate it as F / x
        // x is the measured visual target displacement roughly
        const effectiveK = force / (visualTargetDisplacement / 1000 || 0.0001); // Avoid div by 0

        // If they get within 5% of either real K or the noise-included K, it's correct.
        const isMatchCalc = Math.abs(parsedAnswer - effectiveK) / effectiveK < 0.05;
        const isMatchReal = Math.abs(parsedAnswer - springConstant) / springConstant < 0.05;

        setIsCorrect(isMatchCalc || isMatchReal);
        setIsEvaluated(true);
    };

    return (
        <div className="glass-panel p-6 w-full max-w-7xl animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>Hooke's Law</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Investigate the elasticity and calculate the unknown spring constant.</p>
                </div>
                <div style={{ padding: '12px 24px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Outfit' }}>k = F / x</span>
                </div>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 2fr) minmax(320px, 1fr)', gap: '32px', marginTop: '16px' }}>

                {/* Simulation Area */}
                <div className="glass-panel" style={{ position: 'relative', height: '700px', display: 'flex', justifyContent: 'center', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>

                    {/* Top Support */}
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '20px', background: 'linear-gradient(to bottom, #475569, #334155)', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)', zIndex: 10 }}>
                        <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#94a3b8', borderRadius: '50%' }}></div>
                    </div>

                    {/* Ruler */}
                    <div style={{ position: 'absolute', left: 'calc(50% - 140px)', top: '20px', width: '80px', height: '660px', background: 'linear-gradient(to right, #2d1f00, #3d2a00)', border: '1px solid #a16207', borderRadius: '4px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                        {Array.from({ length: 51 }, (_, cm) => {
                            const val = cm / 100;
                            const isLarge = cm % 10 === 0;
                            const isMed = cm % 5 === 0 && !isLarge;
                            return (
                                <div key={cm} style={{ position: 'absolute', top: `${(val * 1000) + baseSpringLength + 10}px`, right: 0, width: isLarge ? '30px' : isMed ? '20px' : '10px', height: isLarge ? '2px' : '1px', background: isLarge ? '#fbbf24' : isMed ? 'rgba(251,191,36,0.6)' : 'rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center' }}>
                                    {isLarge && <span style={{ position: 'absolute', right: '34px', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{cm} cm</span>}
                                    {isMed && <span style={{ position: 'absolute', right: '24px', fontSize: '0.6rem', color: 'rgba(251,191,36,0.7)', whiteSpace: 'nowrap' }}>{cm}</span>}
                                </div>
                            );
                        })}
                        {liveDisplacement > 0.005 && (
                            <div style={{ position: 'absolute', top: `${(liveDisplacement * 1000) + baseSpringLength + 10}px`, right: '-4px', width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', border: '1px solid white', transform: 'translateY(-50%)', zIndex: 20, boxShadow: '0 0 6px #f59e0b' }} />
                        )}
                        <div style={{ position: 'absolute', top: `${baseSpringLength + 10}px`, left: '0', width: '300px', height: '1px', borderTop: '1px dashed rgba(59, 130, 246, 0.7)', zIndex: 1 }}>
                            <span style={{ position: 'absolute', left: '60px', top: '-18px', color: 'var(--primary)', fontSize: '0.75rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>x = 0</span>
                        </div>
                    </div>

                    {/* Spring Matrix */}
                    <div style={{ position: 'absolute', top: '20px', left: '60%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                        <svg width="100" height={totalSpringLength + 20} style={{ overflow: 'visible' }}>
                            <path d={springPath} fill="none" stroke="#cbd5e1" strokeWidth={4 + (springConstant / 10)} strokeLinecap="round" strokeLinejoin="round" />
                            <path d={springPath} fill="none" stroke="#ffffff" strokeWidth={(4 + (springConstant / 10)) / 3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }} />
                        </svg>

                        {mass > 0 && (
                            <div style={{
                                width: `${50 + (mass * 30)}px`, height: `${50 + (mass * 30)}px`, background: 'radial-gradient(circle at 35% 35%, #a1a1aa, #3f3f46)',
                                borderRadius: '50%', boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.25)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', marginTop: '-5px'
                            }}>
                                {mass.toFixed(2)} kg
                            </div>
                        )}

                        {liveDisplacement > 0.003 && (
                            <div style={{ position: 'absolute', left: '-70px', top: `${baseSpringLength + 10}px`, height: `${Math.max(0, currentVisualDisplacement)}px`, display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'relative', height: '100%', width: '2px', background: '#f59e0b' }}>
                                    <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '2px', background: '#f59e0b' }}></div>
                                    <div style={{ position: 'absolute', bottom: 0, left: '-4px', width: '10px', height: '2px', background: '#f59e0b' }}></div>
                                    <ArrowDown size={14} color="#f59e0b" style={{ position: 'absolute', top: '50%', left: '-6px', transform: 'translateY(-50%)' }} />
                                    <span style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: '#f59e0b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                        x = {Math.max(0, (liveDisplacement * 100) + readingNoiseCm).toFixed(1)} cm
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Side: Modules */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Mass Tray */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Scale size={18} color="var(--primary)" /> Mass Tray
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>Drag a mass and drop it on the spring hook</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                            {MASS_TYPES.map((mt) => (
                                <div
                                    key={mt.grams} draggable onDragStart={(e) => e.dataTransfer.setData('grams', mt.grams)}
                                    style={{
                                        width: `${32 + mt.grams * 0.18}px`, height: `${28 + mt.grams * 0.12}px`,
                                        background: `radial-gradient(circle at 35% 30%, ${mt.color}cc, ${mt.color}66)`, border: `2px solid ${mt.color}`, borderRadius: '6px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'grab', fontSize: '0.65rem',
                                        fontWeight: 'bold', color: 'white', userSelect: 'none', boxShadow: `0 4px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)`, transition: 'transform 0.1s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                                >
                                    {mt.label}
                                </div>
                            ))}
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOverHook(true); }}
                            onDragLeave={() => setDragOverHook(false)}
                            onDrop={(e) => {
                                e.preventDefault(); setDragOverHook(false);
                                const grams = parseInt(e.dataTransfer.getData('grams'));
                                const total = attachedMasses.reduce((s, m) => s + m.grams, 0) + grams;
                                if (total <= 500) setAttachedMasses(prev => [...prev, { id: Date.now(), grams }]);
                            }}
                            style={{
                                border: `2px dashed ${dragOverHook ? '#60a5fa' : 'rgba(255,255,255,0.2)'}`, borderRadius: '10px', padding: '12px', minHeight: '60px',
                                background: dragOverHook ? 'rgba(96,165,250,0.1)' : 'transparent', transition: 'all 0.2s', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {attachedMasses.length === 0 ? (
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>↓ Drop masses here to hang</span>
                            ) : (
                                attachedMasses.map((m) => {
                                    const mt = MASS_TYPES.find(t => t.grams === m.grams);
                                    return (
                                        <div
                                            key={m.id} onClick={() => setAttachedMasses(prev => prev.filter(x => x.id !== m.id))} title="Click to remove"
                                            style={{ padding: '3px 10px', background: `${mt?.color}33`, border: `1px solid ${mt?.color}`, borderRadius: '20px', color: mt?.color, fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            {m.grams}g ✕
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {attachedMasses.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total: <strong style={{ color: 'white' }}>{(mass * 1000).toFixed(0)} g</strong></span>
                                <button onClick={() => setAttachedMasses([])} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem' }}>Clear all</button>
                            </div>
                        )}
                    </div>

                    {/* Live Data */}
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <h3 style={{ marginBottom: '14px', fontSize: '1rem', color: '#10b981' }}>Live Reading</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Weight (F = m×g):</span>
                                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{force.toFixed(3)} N</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Displacement (x):</span>
                                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{(liveDisplacement * 100).toFixed(1)} cm</span>
                            </div>
                        </div>
                    </div>

                    {/* Evaluation Block */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '8px', background: '#f59e0b33', borderRadius: '50%', color: '#f59e0b' }}>
                                <TriangleRight size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Unknown Spring (k)</h3>
                        </div>

                        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isEvaluated ? (isCorrect ? '#10b981' : '#ef4444') : '#f59e0b' }}>
                                {isEvaluated ? `${springConstant} N/m` : '? N/m'}
                            </div>
                            {isEvaluated && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Target Value
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Calculate k</span>
                            </h4>

                            <form onSubmit={handleEvaluate} style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="number" step="0.1" min="0" placeholder="Result..."
                                        value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)}
                                        disabled={isEvaluated || mass === 0}
                                        style={{
                                            width: '100%', padding: '12px 16px', paddingRight: '46px', background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '1rem',
                                            outline: 'none', transition: 'all 0.2s', borderColor: isEvaluated ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--glass-border)',
                                            opacity: (mass === 0 && !isEvaluated) ? 0.5 : 1
                                        }}
                                    />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/m</span>
                                </div>

                                {!isEvaluated ? (
                                    <button
                                        type="submit" disabled={!studentAnswer.trim() || mass === 0}
                                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 600, cursor: (studentAnswer.trim() && mass > 0) ? 'pointer' : 'not-allowed', opacity: (studentAnswer.trim() && mass > 0) ? 1 : 0.6 }}
                                    > Check </button>
                                ) : (
                                    <button
                                        type="button" onClick={generateNewSpring}
                                        style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    > <RefreshCw size={16} /> Retry </button>
                                )}
                            </form>

                            {isEvaluated && (
                                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                                    {isCorrect ? <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0 }} /> : <XCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />}
                                    <div>
                                        <div style={{ fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444' }}>
                                            {isCorrect ? 'Correct! Excellent job.' : 'Incorrect.'}
                                        </div>
                                        {!isCorrect && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                Make sure your distance (x) is in meters, and you calculate k = F / x.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
