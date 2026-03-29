import { Routes, Route } from "react-router-dom";
import "./App.css";

// Pages & Components
import LandingPage from "./components/LandingPage";

// Modular Route Domains
import InstructorRoutes from "./routes/InstructorRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import StudentRoutes from "./routes/StudentRoutes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lab/instructor/*" element={<InstructorRoutes />} />
      <Route path="/lab/admin/*" element={<AdminRoutes />} />
      <Route path="/lab/*" element={<StudentRoutes />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
