import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap,
  Activity,
  Battery,
  TriangleRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

// Standard E12 series resistor values suitable for lab experiments (Ohms)
const STANDARD_RESISTORS = [
  10, 22, 33, 47, 56, 68, 100, 150, 220, 330, 470, 560, 680, 1000,
];

export default function OhmsLaw({ examConfig, onSubmitResult }) {
  const [voltage, setVoltage] = useState(12); // Volts
  const [resistance, setResistance] = useState(100); // True Resistance in Ohms
  const voltageSliderRef = useRef(null);

  // Evaluation states
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Exam-specific states
  const [examStepResults, setExamStepResults] = useState([]);
  const [studentV, setStudentV] = useState("");
  const [studentI, setStudentI] = useState("");
  
  const [graphPhase, setGraphPhase] = useState(false);
  const [graphV1, setGraphV1] = useState("");
  const [graphI1, setGraphI1] = useState("");
  const [graphV2, setGraphV2] = useState("");
  const [graphI2, setGraphI2] = useState("");
  const [studentSlope, setStudentSlope] = useState("");

  // Static device inaccuracies (+/- 2% for AM, +/- 1% for VM) per run
  const [voltageNoise, setVoltageNoise] = useState(1);
  const [currentNoise, setCurrentNoise] = useState(1);

  // Function to generate a new random problem or load exam
  const generateNewResistor = useCallback(() => {
    if (examConfig) {
      setResistance(examConfig.parameters.ohmResistance);
    } else {
      const randomResistor =
        STANDARD_RESISTORS[
          Math.floor(Math.random() * STANDARD_RESISTORS.length)
        ];
      setResistance(randomResistor);
    }

    // Reset evaluation
    setStudentAnswer("");
    setIsEvaluated(false);
    setIsCorrect(null);
    setExamStepResults([]);
    setStudentV("");
    setStudentI("");
    setGraphPhase(false);
    setGraphV1("");
    setGraphI1("");
    setGraphV2("");
    setGraphI2("");
    setStudentSlope("");

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
      setVoltage((v) =>
        Math.min(24, Math.max(0, v + (e.deltaY < 0 ? 0.5 : -0.5))),
      );
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const theoreticalCurrent = voltage / resistance;

  // The panel sliders represent the true intended value, but the meters read noisy values
  const measuredVoltage = voltage * voltageNoise;
  const measuredCurrent = theoreticalCurrent * currentNoise;

  // We avoid division by zero when V is strictly 0 to handle initial practical noise calculations gracefully
  const practicalResistance =
    measuredVoltage > 0.1 && measuredCurrent > 0
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
    const isAnswerCorrect =
      (parsedAnswer >= lowerBound && parsedAnswer <= upperBound) ||
      (parsedAnswer >= resistance * 0.95 && parsedAnswer <= resistance * 1.05);

    setIsCorrect(isAnswerCorrect);
    setIsEvaluated(true);

    if (examConfig && onSubmitResult) {
      onSubmitResult(parsedAnswer, resistance);
    }
  };

  // Format current for display (mA if < 1A)
  const displayCurrent =
    measuredCurrent < 1
      ? `${(measuredCurrent * 1000).toFixed(1)} mA`
      : `${measuredCurrent.toFixed(2)} A`;

  return (
    <div
      className="glass-panel p-6 w-full max-w-5xl animate-fade-in"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "8px",
              color: "var(--primary)",
            }}
          >
            Ohm's Law Simulator
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Calculate the value of the unknown resistor using Voltmeter and
            Ammeter readings.
          </p>
        </div>
        {!examConfig && (
          <div
            style={{
              padding: "12px 24px",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "12px",
              border: "1px solid var(--primary)",
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                fontFamily: "Outfit",
              }}
            >
              R = V / I
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "24px",
          marginTop: "16px",
        }}
      >
        {/* Instruments Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Voltmeter */}
          <div
            className="glass-panel"
            style={{ padding: "20px", background: "rgba(15, 23, 42, 0.9)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  background: "#3b82f633",
                  borderRadius: "50%",
                  color: "#3b82f6",
                }}
              >
                <Activity size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Voltmeter (V)</h3>
            </div>

            <div
              className="device-display"
              style={{
                fontSize: "2.5rem",
                textAlign: "right",
                letterSpacing: "2px",
              }}
            >
              {measuredVoltage.toFixed(2)} V
            </div>

            <div style={{ marginTop: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                <span>Power Supply</span>
                <span>{voltage} V</span>
              </div>
              <input
                ref={voltageSliderRef}
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: "var(--primary)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                }}
              >
                <span>0V</span>
                <span>24V</span>
              </div>
            </div>
          </div>

          {/* Ammeter */}
          <div
            className="glass-panel"
            style={{ padding: "20px", background: "rgba(15, 23, 42, 0.9)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  background: "#10b98133",
                  borderRadius: "50%",
                  color: "#10b981",
                }}
              >
                <Zap size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Ammeter (I)</h3>
            </div>

            <div
              className="device-display green"
              style={{
                fontSize: "2.5rem",
                textAlign: "right",
                letterSpacing: "2px",
              }}
            >
              {displayCurrent}
            </div>

            <div style={{ marginTop: "24px" }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                Calculated from circuit
              </p>
              <div
                style={{
                  height: "4px",
                  background: "#10b98133",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#10b981",
                    width: `${Math.min(100, (measuredCurrent / 0.5) * 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Circuit & Evaluation Panel */}
        <div
          className="glass-panel"
          style={{ padding: "24px", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "8px",
                background: "#f59e0b33",
                borderRadius: "50%",
                color: "#f59e0b",
              }}
            >
              <TriangleRight size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Unknown Resistor (R)</h3>
          </div>

          <div
            style={{
              padding: "24px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "12px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {/* CSS Resistor visualization */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 0",
              }}
            >
              <div
                style={{ width: "40px", height: "4px", background: "#94a3b8" }}
              ></div>
              <div
                style={{
                  width: "120px",
                  height: "40px",
                  background: `linear-gradient(90deg, #d97706, #f59e0b 20%, #b45309 80%, #d97706)`,
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "100%",
                    background: "#bfdbfe",
                  }}
                ></div>
                <div
                  style={{
                    width: "6px",
                    height: "100%",
                    background: "#475569",
                  }}
                ></div>
                <div
                  style={{
                    width: "6px",
                    height: "100%",
                    background: "#1e293b",
                  }}
                ></div>
                <div
                  style={{
                    width: "6px",
                    height: "100%",
                    background: "#fbbf24",
                  }}
                ></div>
              </div>
              <div
                style={{ width: "40px", height: "4px", background: "#94a3b8" }}
              ></div>
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: isEvaluated
                  ? examConfig
                    ? "#3b82f6"
                    : isCorrect
                      ? "#10b981"
                      : "#ef4444"
                  : "#f59e0b",
                marginTop: "16px",
              }}
            >
              {isEvaluated ? (examConfig ? "*** Ω" : `${resistance} Ω`) : "? Ω"}
            </div>
            {isEvaluated && !examConfig && (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                }}
              >
                True Value
              </div>
            )}
          </div>

          {examConfig && (
            <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
               {examStepResults.length > 0 && <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)" }}>النقاط المسجلة ({examStepResults.length}/4)</h4>}
               {examStepResults.map((res, idx) => (
                  <div key={idx} style={{
                     padding: "8px 12px",
                     background: "rgba(0,0,0,0.2)",
                     borderRadius: "8px",
                     border: "1px solid #10b981",
                     display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                     <span style={{color: "var(--text-muted)", fontSize: "0.85rem"}}>قراءة {idx + 1}:</span>
                     <span style={{fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center"}}>
                        V: {res.v} | I: {res.i}
                     </span>
                     {!isEvaluated && (
                        <button
                           type="button"
                           onClick={() => {
                              const newResults = examStepResults.filter((_, i) => i !== idx);
                              setExamStepResults(newResults);
                              if (newResults.length < 4) setGraphPhase(false);
                           }}
                           style={{
                              background: "rgba(239, 68, 68, 0.2)",
                              border: "none",
                              color: "#ef4444",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "bold"
                           }}
                        >
                           ✕
                        </button>
                     )}
                  </div>
               ))}
            </div>
          )}

          {/* Student Input Section */}
          <div
            style={{
              marginTop: "auto",
              background: "rgba(255,255,255,0.03)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4
              style={{
                marginBottom: "16px",
                color: "var(--text-main)",
                fontSize: "1.05rem",
              }}
            >
              {examConfig && graphPhase ? "حساب الميل من الرسم البياني" : (examConfig ? "تسجيل قراءة جديدة" : "Calculate the Resistance")}
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (examConfig) {
                   if (graphPhase) {
                      const slope = parseFloat(studentSlope);
                      if (isNaN(slope) || !graphV1 || !graphI1 || !graphV2 || !graphI2) return;
                      
                      setIsEvaluated(true);
                      const pointsStr = examStepResults.map((res, i) => `P${i+1}(V:${res.v}, I:${res.i})`).join(" | ");
                      const graphStr = `Graph P1(V:${graphV1}, I:${graphI1}) | Graph P2(V:${graphV2}, I:${graphI2})`;
                      const resultsStr = `${pointsStr} | ${graphStr} | Slope(R): ${slope}Ω`;
                      onSubmitResult(resultsStr, resistance);
                   } else {
                      const v = studentV.trim();
                      const i = studentI.trim();
                      if (!v || !i) return;
                      
                      const newResults = [...examStepResults, { v, i }];
                      setExamStepResults(newResults);
                      
                      setStudentV("");
                      setStudentI("");
                      
                      if (newResults.length === 4) {
                         setGraphPhase(true);
                      }
                   }
                } else {
                   handleEvaluate(e);
                }
              }}
              style={{ display: "flex", gap: "12px", alignItems: "stretch", flexDirection: "column" }}
            >
              {!graphPhase ? (
                <>
                  {examConfig && (
                    <div className="exam-input-group">
                      <input
                        type="text"
                        placeholder="V (الجهد)"
                        value={studentV}
                        onChange={(e) => setStudentV(e.target.value)}
                        disabled={isEvaluated || examStepResults.length >= 4}
                        className="exam-input"
                      />
                      <input
                        type="text"
                        placeholder="I (التيار)"
                        value={studentI}
                        onChange={(e) => setStudentI(e.target.value)}
                        disabled={isEvaluated || examStepResults.length >= 4}
                        className="exam-input"
                      />
                    </div>
                  )}
                  {!examConfig && (
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter your result..."
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        disabled={isEvaluated}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          paddingRight: "40px",
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "1rem",
                          outline: "none",
                          transition: "all 0.2s",
                          borderColor: isEvaluated
                            ? isCorrect
                              ? "#10b981"
                              : "#ef4444"
                            : "var(--glass-border)",
                        }}
                      />
                      <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>Ω</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <div style={{color: "#3b82f6", fontWeight: "bold", fontSize: "0.95rem", lineHeight: "1.5", textAlign: "right"}}>
                    قم برسم علاقة بيانية بين الجهد (V) والتيار (I) على ورقتك، واستخرج نقطتين جديدتين من الخط المستقيم الناتج، ثم احسب قيمة الميل وهو (R).
                  </div>
                  <div className="exam-input-group">
                    <input
                      type="text"
                      placeholder="V1 (نقطة 1)"
                      value={graphV1}
                      onChange={(e)=>setGraphV1(e.target.value)}
                      disabled={isEvaluated}
                      className="exam-input"
                    />
                    <input
                      type="text"
                      placeholder="I1 (نقطة 1)"
                      value={graphI1}
                      onChange={(e)=>setGraphI1(e.target.value)}
                      disabled={isEvaluated}
                      className="exam-input"
                    />
                  </div>
                  <div className="exam-input-group">
                    <input
                      type="text"
                      placeholder="V2 (نقطة 2)"
                      value={graphV2}
                      onChange={(e)=>setGraphV2(e.target.value)}
                      disabled={isEvaluated}
                      className="exam-input"
                    />
                    <input
                      type="text"
                      placeholder="I2 (نقطة 2)"
                      value={graphI2}
                      onChange={(e) => setGraphI2(e.target.value)}
                      disabled={isEvaluated}
                      className="exam-input"
                    />
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="قيمة الميل (المقاومة) المحسوبة..."
                      value={studentSlope}
                      onChange={(e) => setStudentSlope(e.target.value)}
                      disabled={isEvaluated}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        paddingRight: "40px",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid #3b82f6",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "1rem",
                        outline: "none",
                        borderColor: isEvaluated ? "#10b981" : "#3b82f6"
                      }}
                    />
                    <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>Ω</span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              {!isEvaluated ? (
                <button
                  type="submit"
                  disabled={graphPhase ? (!studentSlope.trim() || !graphV1.trim() || !graphI1.trim() || !graphV2.trim() || !graphI2.trim()) : (examConfig ? (!studentV.trim() || !studentI.trim()) : !studentAnswer.trim())}
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontWeight: 600,
                    cursor: (graphPhase ? (studentSlope.trim() && graphV1.trim() && graphI1.trim() && graphV2.trim() && graphI2.trim()) : (examConfig ? (studentV.trim() && studentI.trim()) : studentAnswer.trim())) ? "pointer" : "not-allowed",
                    opacity: (graphPhase ? (studentSlope.trim() && graphV1.trim() && graphI1.trim() && graphV2.trim() && graphI2.trim()) : (examConfig ? (studentV.trim() && studentI.trim()) : studentAnswer.trim())) ? 1 : 0.6,
                  }}
                >
                  {examConfig ? (graphPhase ? "إرسال النتيجة البيانية" : "تسجيل القراءة") : "Check"}
                </button>
              ) : (
                !examConfig && (
                  <button
                    type="button"
                    onClick={generateNewResistor}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--primary)",
                      color: "var(--primary)",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <RefreshCw size={18} /> Retry
                  </button>
                )
              )}
              </div>
            </form>

            {/* Result Feedback */}
            {isEvaluated && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: examConfig
                    ? "rgba(59, 130, 246, 0.1)"
                    : isCorrect
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${examConfig ? "rgba(59, 130, 246, 0.3)" : isCorrect ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                }}
              >
                {examConfig ? (
                  <CheckCircle2 size={24} color="#3b82f6" />
                ) : isCorrect ? (
                  <CheckCircle2 size={24} color="#10b981" />
                ) : (
                  <XCircle size={24} color="#ef4444" />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: examConfig
                        ? "#3b82f6"
                        : isCorrect
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {examConfig
                      ? "شكراً لك، لقت تم تسجيل إجابتك بنجاح"
                      : isCorrect
                        ? "Correct! Excellent job."
                        : "Incorrect."}
                  </div>
                  {!examConfig && !isCorrect && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      Remember to convert current to Amperes before calculating!
                      (1000 mA = 1 A)
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
