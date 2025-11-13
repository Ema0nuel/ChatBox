/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import LeftNav from "./LeftNav";
import MobileNav from "./MobileNav";
import { LuLogOut } from "react-icons/lu";
import { navigationItems } from "../../constants/navigation";
import { supabase } from "../../services/supabase/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

const AppShell = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(isMobile);
  const isInChat = location.pathname.includes("/admin/conversations/");

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/admin/live/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  // Mobile chat layout
  if (isMobile && isInChat) {
    return <div className="h-screen bg-gray-50">{children}</div>;
  }

  // Regular layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Left Navigation */}
        <motion.div
          initial={false}
          animate={{
            width: isNavCollapsed ? "64px" : "256px",
          }}
          className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-10"
        >
          <LeftNav
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            navigationItems={navigationItems}
          />
        </motion.div>

        {/* Main Content */}
        <motion.main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isNavCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          {/* Header */}
          <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LuLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container mx-auto max-w-7xl p-8">{children}</div>
          </div>
        </motion.main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">ChatBox Admin</h1>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-700 hover:text-red-600"
          >
            <span>🚪</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16">
          <div className="p-4">{children}</div>
        </main>

        {/* Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default AppShell;
