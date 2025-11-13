/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../../services/supabase/supabaseClient";

const SettingsView = () => {
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: true,
    emailNotifications: true,
    autoResponse: false,
    autoResponseMessage: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setSettings({
          ...settings,
          name: data.name || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaveStatus("saving");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_users")
        .update({
          name: settings.name,
          email: settings.email,
          // Add other settings as needed
        })
        .eq("id", user.id);

      if (error) throw error;

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your preferences and account settings
        </p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">👤</span>
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">✉️</span>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">🌙</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dark Mode
                    </p>
                    <p className="text-xs text-gray-500">
                      Toggle dark mode theme
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      theme: settings.theme === "light" ? "dark" : "light",
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.theme === "dark" ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <motion.span
                    layout
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    animate={{
                      x: settings.theme === "dark" ? 24 : 4,
                    }}
                  />
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">🔔</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Browser Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      Receive desktop notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: !settings.notifications,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <motion.span
                    layout
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    animate={{
                      x: settings.notifications ? 24 : 4,
                    }}
                  />
                </button>
              </div>

              {/* Auto Response */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">💬</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Auto Response
                    </p>
                    <p className="text-xs text-gray-500">
                      Send automatic replies when offline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      autoResponse: !settings.autoResponse,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoResponse ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <motion.span
                    layout
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    animate={{
                      x: settings.autoResponse ? 24 : 4,
                    }}
                  />
                </button>
              </div>

              {settings.autoResponse && (
                <div className="mt-4">
                  <label
                    htmlFor="autoResponseMessage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Auto Response Message
                  </label>
                  <textarea
                    id="autoResponseMessage"
                    rows={3}
                    value={settings.autoResponseMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoResponseMessage: e.target.value,
                      })
                    }
                    placeholder="Enter your automated response message..."
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-4">
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center space-x-2 text-sm ${
                saveStatus === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {saveStatus === "success" ? (
                <>
                  <span>✅ Settings saved successfully!</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <span>⚠️ Error saving settings</span>
                </>
              ) : null}
            </motion.div>
          )}

          <button
            onClick={saveSettings}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === "saving" ? "💾 Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
