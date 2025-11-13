/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "../../../services/supabase/supabaseClient";
import { format } from "date-fns";

const ActiveUsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        // Fetch all admin users
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .neq("id", currentUser.id); // Exclude current user

        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Subscribe to presence changes
    const channel = supabase
      .channel("admin-presence")
      .on("presence", { event: "sync" }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";
    return format(new Date(timestamp), "MMM d, yyyy HH:mm");
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Active Users</h1>
        <p className="text-gray-600 mt-2">
          Monitor admin presence and activity
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white">👤</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.name || "Unnamed Admin"}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      user.is_online ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <LuActivity className="w-4 h-4 mr-2" />
                    <span>{user.is_online ? "Online" : "Offline"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🕐</span>
                    <span>Last seen: {formatLastSeen(user.last_seen)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ActiveUsersView;
