/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../services/supabase/supabaseClient";
import { formatDistanceToNow } from "date-fns";

const ConversationsView = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all conversations with their latest message
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all chat sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // For each session, get the latest message
      const conversationsWithMessages = await Promise.all(
        sessions.map(async (session) => {
          const { data: messages, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("session_id", session.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (messagesError) throw messagesError;

          return {
            ...session,
            lastMessage: messages?.[0] || null,
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time subscription to new messages
  useEffect(() => {
    const channel = supabase
      .channel("conversations-listener")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refetch conversations when messages change
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "waiting":
        return "bg-yellow-500";
      case "closed":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "waiting":
        return "Waiting";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "No messages";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-white">Conversations</h1>
        <p className="text-purple-100 text-sm">
          {conversations.length} active chat sessions
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            <p className="font-semibold">Error loading conversations</p>
            <p className="text-sm">{error}</p>
          </motion.div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-semibold">No conversations yet</p>
              <p className="text-sm">
                Users will appear here when they start a chat
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-3"
          >
            <AnimatePresence mode="popLayout">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  variants={itemVariants}
                  layout
                  onClick={() =>
                    navigate(`/admin/conversations/${conversation.id}`)
                  }
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {conversation.user_name?.charAt(0).toUpperCase() ||
                          conversation.id?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {conversation.user_name ||
                            conversation.user_email ||
                            "Anonymous"}
                        </h3>
                        <span
                          className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(
                            conversation.status
                          )}`}
                        ></span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {truncateText(conversation.lastMessage?.content)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.lastMessage
                          ? formatDistanceToNow(
                              new Date(conversation.lastMessage.created_at),
                              { addSuffix: true }
                            )
                          : "No messages"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0 text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {getStatusText(conversation.status)}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConversationsView;
