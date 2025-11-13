import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function AuthLayout() {
  const { checkAuthRedirectToDashboard, loading } = useAuth();

  useEffect(() => {
    checkAuthRedirectToDashboard();
  }, [checkAuthRedirectToDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
