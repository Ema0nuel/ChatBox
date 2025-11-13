import React from "react";
import { NavLink } from "react-router-dom";

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg ${
              isActive ? "text-purple-600" : "text-gray-600"
            }`
          }
        >
          <span>📊</span>
          <span className="text-xs">Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/conversations"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg ${
              isActive ? "text-purple-600" : "text-gray-600"
            }`
          }
        >
          <span>💬</span>
          <span className="text-xs">Chats</span>
        </NavLink>
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg ${
              isActive ? "text-purple-600" : "text-gray-600"
            }`
          }
        >
          <span>⚙️</span>
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNav;
