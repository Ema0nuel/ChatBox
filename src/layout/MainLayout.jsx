/* eslint-disable react-hooks/exhaustive-deps */
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function MainLayout() {
  const { checkAuth, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
    </>
  );
}

export default MainLayout;
