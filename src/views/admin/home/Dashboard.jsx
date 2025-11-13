/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "../../../services/supabase/supabaseClient";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    waitingSessions: 0,
    totalMessages: 0,
    onlineAdmins: 0,
    averageResponseTime: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch chat sessions stats
        const { data: sessions, error: sessionsError } = await supabase
          .from("chat_sessions")
          .select("*");

        if (sessionsError) throw sessionsError;

        // Get total messages
        const { count: totalMessages, error: messagesError } = await supabase
          .from("messages")
          .select("*", { count: "exact" });

        if (messagesError) throw messagesError;

        // Get online admins
        const { data: admins, error: adminsError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("is_online", true);

        if (adminsError) throw adminsError;

        // Calculate statistics
        const activeSessions = sessions.filter(
          (s) => s.status === "active"
        ).length;
        const waitingSessions = sessions.filter(
          (s) => s.status === "waiting"
        ).length;

        // Get recent sessions with their last messages
        const recentSessionsData = await Promise.all(
          sessions
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(async (session) => {
              const { data: lastMessage } = await supabase
                .from("messages")
                .select("*")
                .eq("session_id", session.id)
                .order("created_at", { ascending: false })
                .limit(1);

              return {
                ...session,
                lastMessage,
              };
            })
        );

        setStats({
          totalSessions: sessions.length,
          activeSessions,
          waitingSessions,
          totalMessages,
          onlineAdmins: admins.length,
          averageResponseTime: 0, // This would need a more complex calculation
        });

        setRecentSessions(recentSessionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const sessionsChannel = supabase
      .channel("sessions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_sessions" },
        fetchDashboardData
      )
      .subscribe();

    const adminsChannel = supabase
      .channel("admins-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_users" },
        fetchDashboardData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(adminsChannel);
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    return format(new Date(timestamp), "MMM d, HH:mm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "waiting":
        return "bg-yellow-500";
      case "ended":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of chat activity and metrics
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-100">
              Total Sessions
            </h3>
            <span className="text-2xl text-purple-200">💬</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
          <div className="mt-4 text-sm text-purple-200">
            <span className="flex items-center gap-1">
              <span>📈</span>
              {stats.activeSessions} active now
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-100">
              Active Chats
            </h3>
            <span className="text-2xl text-green-200">👥</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeSessions}</p>
          <div className="mt-4 text-sm text-green-200">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              {stats.waitingSessions} waiting
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-100">
              Online Admins
            </h3>
            <span className="text-2xl text-blue-200">👤</span>
          </div>
          <p className="text-3xl font-bold">{stats.onlineAdmins}</p>
          <div className="mt-4 text-sm text-blue-200">
            <span className="flex items-center gap-1">
              <span>💬</span>
              {stats.totalMessages} total messages
            </span>
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Sessions
            </h2>
            <Link
              to="/admin/conversations"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <AnimatePresence initial={false}>
            {recentSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white">👤</span>
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/admin/conversations/${session.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600"
                      >
                        {session.visitor_id}
                      </Link>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>🕐</span>
                        {formatTime(session.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        session.status === "active"
                          ? "bg-green-100 text-green-800"
                          : session.status === "waiting"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {session.status}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        session.status
                      )}`}
                    />
                  </div>
                </div>
                {session.lastMessage && (
                  <div className="mt-2 ml-13">
                    <p className="text-sm text-gray-600 truncate">
                      {session.lastMessage.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
