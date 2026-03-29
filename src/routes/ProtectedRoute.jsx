import { Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import AdminLogin from "../components/AdminLogin";

/**
 * A reusable ProtectedRoute component to handle Instructor and Admin authentication.
 * Without changing any core functionality!
 */
export function ProtectedInstructorRoute({
  instructorName,
  instructorId,
  onLogin,
  onBack,
  children,
}) {
  if (!instructorName || !instructorId) {
    return <LoginPage onLogin={onLogin} onBack={onBack} />;
  }
  return children;
}

export function ProtectedAdminRoute({ adminLoggedIn, onLogin, onBack, children }) {
  if (!adminLoggedIn) {
    return <AdminLogin onLogin={onLogin} onBack={onBack} />;
  }
  return children;
}
