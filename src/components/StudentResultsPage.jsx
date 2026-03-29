import { useState, useEffect } from "react";
import { ArrowLeft, Users, Save, CheckCircle2, Camera, X } from "lucide-react";
import { supabase } from "../supabaseClient";

function StudentResultsPage({ instructorId, onBack }) {
  const [results, setResults] = useState([]);
  const [savedMessage, setSavedMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Proctoring Modal State
  const [proctoringModalOpen, setProctoringModalOpen] = useState(false);
  const [proctoringImages, setProctoringImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from("results")
          .select("*")
          .eq("instructor_id", instructorId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setResults(data);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleGradeChange = (index, value) => {
    const newResults = [...results];
    newResults[index].instructor_grade = value;
    setResults(newResults);
  };

  const saveGrades = async () => {
    try {
      // Update each result's grade in Supabase
      for (const result of results) {
        await supabase
          .from("results")
          .update({ instructor_grade: result.instructor_grade || "" })
          .eq("id", result.id);
      }
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error("Error saving grades:", err);
      alert("حدث خطأ أثناء حفظ التقييمات.");
    }
  };

  const fetchProctoringImages = async (req) => {
    setSelectedStudent(req.student_name);
    setProctoringModalOpen(true);
    setLoadingImages(true);
    setProctoringImages([]);

    const safeStudentId = req.student_id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const folderPath = `${req.exam_code}/${safeStudentId}`;

    try {
      const { data, error } = await supabase.storage
        .from("exam_snapshots")
        .list(folderPath);
      if (error) throw error;

      if (data && data.length > 0) {
        const images = data
          .filter((file) => /\.(webp|jpg|jpeg|png)$/i.test(file.name))
          .map((file) => {
            const { data: publicUrlData } = supabase.storage
              .from("exam_snapshots")
              .getPublicUrl(`${folderPath}/${file.name}`);
            const nameWithoutExt = file.name.replace(
              /\.(webp|jpg|jpeg|png)$/i,
              "",
            );
            return {
              name: file.name,
              url: publicUrlData.publicUrl,
              timestamp: parseInt(nameWithoutExt),
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        setProctoringImages(images);
      }
    } catch (err) {
      console.error("Error fetching proctoring images:", err);
    } finally {
      setLoadingImages(false);
    }
  };

  const renderResultData = (dataStr, unit, isStudent) => {
    if (!dataStr) return "";
    if (dataStr === "--") return <span style={{ color: "#ef4444" }}>-- (انتهى الوقت)</span>;
    if (dataStr === "--kicked--") return <span style={{ color: "#ef4444", fontWeight: "bold" }}>غياب الكاميرا</span>;
    if (dataStr === "--quit--") return <span style={{ color: "#f59e0b", fontWeight: "bold" }}>منسحب (Withdrawn)</span>;
    if (dataStr === "جاري الاختبار...") return <span style={{ color: "#3b82f6", fontWeight: "bold", animation: "pulse 2s infinite" }}>جاري أداء الاختبار... ⏳</span>;
    try {
      const obj = JSON.parse(dataStr);
      if (obj && obj.table) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minWidth: "180px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                color: isStudent ? "#10b981" : "var(--text-muted)",
              }}
            >
              Avg: {obj.avg} {unit}
            </span>
            <table
              style={{
                fontSize: "0.75rem",
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text-main)",
                textAlign: "center",
              }}
            >
              <tbody>
                <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                  <th
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px",
                    }}
                  >
                    B
                  </th>
                  <th
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px",
                    }}
                  >
                    D
                  </th>
                  <th
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px",
                    }}
                  >
                    t
                  </th>
                  <th
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px",
                    }}
                  >
                    v
                  </th>
                  <th
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px",
                    }}
                  >
                    η
                  </th>
                </tr>
                {obj.table.map((row, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "4px",
                        color: "var(--primary)",
                      }}
                    >
                      {row.id}
                    </td>
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "4px",
                      }}
                    >
                      {row.d}
                    </td>
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "4px",
                      }}
                    >
                      {row.t}
                    </td>
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "4px",
                      }}
                    >
                      {row.v}
                    </td>
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "4px",
                      }}
                    >
                      {row.eta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } catch {
      // fallback to plain string
    }
    return (
      <span
        style={{
          fontWeight: 600,
          color: isStudent
            ? (dataStr === "--" || dataStr === "--kicked--" || dataStr === "--quit--")
              ? "#ef4444"
              : "#10b981"
            : "var(--text-muted)",
        }}
      >
        {dataStr} {unit}
      </span>
    );
  };

  return (
    <div className="app-container" style={{ background: "var(--bg-main)" }}>
      {/* Top Header */}
      <header
        style={{
          padding: "24px 32px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 500 }}>
              نتائج الطلاب
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              عرض درجات الامتحانات وتقييمها
            </p>
          </div>
        </div>

        <button
          onClick={saveGrades}
          style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {savedMessage ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {savedMessage ? "تم الحفظ" : "حفظ التقييمات"}
        </button>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="glass-panel"
          style={{ padding: "24px", overflowX: "auto" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
              color: "var(--primary)",
            }}
          >
            <Users size={24} />
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>
              سجل اختبارات العملي
            </h3>
          </div>

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              جاري تحميل النتائج...
            </div>
          ) : results.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              لا توجد أية نتائج للطلاب بعد.
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-muted)",
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    التجربة
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    اسم الطالب
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    الرقم الأكاديمي (ID)
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    كود الاختبار
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    إجابة الطالب
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    القيمة الفعلية (الصحيحة)
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    المراقبة
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 500,
                    }}
                  >
                    الدرجة
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((req, index) => (
                  <tr
                    key={req.id || index}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "background 0.2s",
                    }}
                  >
                    <td style={{ padding: "16px", color: "var(--primary)" }}>
                      {req.experiment}
                    </td>
                    <td style={{ padding: "16px" }}>{req.student_name}</td>
                    <td
                      style={{
                        padding: "16px",
                        fontFamily: "monospace",
                        color: "#a78bfa",
                      }}
                    >
                      {req.student_id}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {req.exam_code}
                      </span>
                    </td>
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      {renderResultData(
                        req.student_result,
                        req.student_result !== "--" ? req.unit : "",
                        true,
                      )}
                    </td>
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      {renderResultData(req.actual_result, req.unit, false)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() => fetchProctoringImages(req)}
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "#3b82f6",
                          border: "1px solid #3b82f6",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          margin: "0 auto",
                          transition: "all 0.2s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Camera size={14} />
                        معاينة
                      </button>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <input
                        type="text"
                        placeholder="0/10"
                        value={req.instructor_grade || ""}
                        onChange={(e) =>
                          handleGradeChange(index, e.target.value)
                        }
                        style={{
                          width: "80px",
                          padding: "8px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--glass-border)",
                          color: "#fff",
                          borderRadius: "8px",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Proctoring Modal */}
      {proctoringModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(5px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: "90%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setProctoringModalOpen(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "transparent",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>
            <h3
              style={{
                margin: "0 0 20px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Camera size={20} color="var(--primary)" />
              لقطات المراقبة:{" "}
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                {selectedStudent}
              </span>
            </h3>

            {loadingImages ? (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "40px",
                }}
              >
                جاري تحميل الصور من قاعدة البيانات...
              </p>
            ) : proctoringImages.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "60px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "12px",
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                لا توجد لقطات مسجلة لهذا الطالب.
                <br /> (إما أنه لم يفعل الكاميرا، أو اختباره كان بدون تفعيل الـ
                SEB).
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                {proctoringImages.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#000",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.1)",
                      position: "relative",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`Snapshot ${idx}`}
                      style={{
                        width: "100%",
                        height: "150px",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "8px",
                        fontSize: "0.8rem",
                        color: "#fff",
                        textAlign: "center",
                        background: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      اللقطة #{idx + 1} &nbsp; (
                      {new Date(img.timestamp).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentResultsPage;
