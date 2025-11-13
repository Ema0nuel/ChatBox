/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuMessageSquare } from "react-icons/lu";

const LeftNav = ({
  isCollapsed,
  isMobile,
  isOpen,
  onToggle,
  navigationItems,
}) => {
  const navClasses = isMobile
    ? `fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`
    : `fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300`;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggle}
        />
      )}

      {/* Navigation */}
      <nav className={navClasses}>
        {/* Logo */}
        <div
          className={`h-16 flex items-center ${
            isCollapsed ? "justify-center" : "px-6"
          } border-b border-gray-200`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <LuMessageSquare size={24} className="text-purple-600" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-semibold text-gray-900"
                >
                  Admin Chat
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <div className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-colors ${
                      isActive
                        ? "text-purple-600 bg-purple-50"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${isCollapsed ? "justify-center" : "space-x-3"}`
                  }
                >
                  <item.icon size={20} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        key={`nav-text-${item.id}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default LeftNav;
