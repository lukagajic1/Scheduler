import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return (
      <main className="px-12 py-8">
        <p className="text-slate-600">Checking your session...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;