import { Routes, Route } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import AuthLayout from "../layout/AuthLayout";
import MainLayout from "../layout/MainLayout";
import Login from "../views/admin/auth/login";
import Signup from "../views/admin/auth/signup";
import ForgotPassword from "../views/admin/auth/forgot-password";
import ResetPassword from "../views/admin/auth/reset-password";
import Dashboard from "../views/admin/home/Dashboard";
import ConversationsView from "../views/admin/conversations/ConversationsView";
import AdminChatView from "../views/admin/conversations/AdminChatView";
import ActiveUsersView from "../views/admin/users/ActiveUsersView";
import SettingsView from "../views/admin/settings/SettingsView";
import AppShell from "../components/admin/AppShell";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/admin/live/login" element={<Login />} />
        <Route path="/admin/live/signup" element={<Signup />} />
        <Route
          path="/admin/live/forgot-password"
          element={<ForgotPassword />}
        />
        <Route path="/admin/live/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/admin/conversations/:userId" element={<AdminChatView />} />
      <Route element={<MainLayout />}>
        <Route
          path="/admin/dashboard"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/admin/conversations"
          element={
            <AppShell>
              <ConversationsView />
            </AppShell>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AppShell>
              <ActiveUsersView />
            </AppShell>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AppShell>
              <SettingsView />
            </AppShell>
          }
        />
      </Route>

      {/* Public Home Page */}
      <Route
        path="*"
        element={
          <div className="min-h-screen text-white bg-black/80">
            <ChatWidget />
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
