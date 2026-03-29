import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import InstructorDashboard from "../components/InstructorDashboard";
import CreateExamPage from "../components/CreateExamPage";
import StudentResultsPage from "../components/StudentResultsPage";
import { ProtectedInstructorRoute } from "./ProtectedRoute";

export default function InstructorRoutes() {
  const navigate = useNavigate();

  const [instructorName, setInstructorName] = useState(() => sessionStorage.getItem("app_instructorName") || "");
  const [instructorId, setInstructorId] = useState(() => sessionStorage.getItem("app_instructorId") || "");

  useEffect(() => {
    instructorName ? sessionStorage.setItem("app_instructorName", instructorName) : sessionStorage.removeItem("app_instructorName");
    instructorId ? sessionStorage.setItem("app_instructorId", instructorId) : sessionStorage.removeItem("app_instructorId");
  }, [instructorName, instructorId]);

  const handleInstructorLogin = (data) => {
    setInstructorName(data.username);
    setInstructorId(data.id);
    navigate("/lab/instructor/dashboard");
  };

  const handleInstructorLogout = () => {
    setInstructorName("");
    setInstructorId("");
    navigate("/");
  };

  return (
    <ProtectedInstructorRoute
      instructorName={instructorName}
      instructorId={instructorId}
      onLogin={handleInstructorLogin}
      onBack={() => navigate("/")}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <InstructorDashboard
              username={instructorName}
              instructorId={instructorId}
              onBack={handleInstructorLogout}
              onCreateExam={() => navigate("/lab/instructor/create")}
              onViewResults={() => navigate("/lab/instructor/results")}
            />
          }
        />
        <Route
          path="create"
          element={
            <CreateExamPage
              instructorId={instructorId}
              onBack={() => navigate("/lab/instructor/dashboard")}
            />
          }
        />
        <Route
          path="results"
          element={
            <StudentResultsPage
              instructorId={instructorId}
              onBack={() => navigate("/lab/instructor/dashboard")}
            />
          }
        />
      </Routes>
    </ProtectedInstructorRoute>
  );
}
