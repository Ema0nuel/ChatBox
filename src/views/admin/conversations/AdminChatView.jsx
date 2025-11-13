/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAdminDatabase from "../../../hooks/useAdminDatabase";
import ChatInput from "../../../components/ChatWidget/ChatInput";
import ChatImage from "../../../components/ChatWidget/ChatImage";
import { format } from "date-fns";

const AdminChatView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    messages = [],
    sendMessage,
    loading,
    messageLoading,
    currentSession,
    initializeChat,
  } = useAdminDatabase(userId);

  const messagesRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // scroll detection
  const handleScroll = () => {
    if (!messagesRef.current) return;
    const nearBottom =
      messagesRef.current.scrollHeight -
        messagesRef.current.scrollTop -
        messagesRef.current.clientHeight <
      100;
    setIsNearBottom(nearBottom);
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!loading) scrollToBottom();
  }, [loading, messages]);

  const handleSendMessage = async (messageData) => {
    if (!messageData) return;
    const content =
      typeof messageData.content === "string" ? messageData.content.trim() : "";
    const image_url = messageData.image_url || null;

    if (!content && !image_url) return;
    if (messageLoading) return;

    if (!currentSession) await initializeChat();
    await sendMessage({ content, image_url });
  };

  const ChatMessage = ({ message, isAdmin }) => {
    const bubbleColor = isAdmin
      ? "bg-gray-100 text-gray-800"
      : "bg-gradient-to-br from-purple-500 to-purple-600 text-white";
    const row = isAdmin ? "flex-row" : "flex-row-reverse";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`flex ${row} gap-2 w-full`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isAdmin
              ? "bg-purple-100 text-purple-700"
              : "bg-purple-600 text-white"
          }`}
        >
          {isAdmin ? "S" : "U"}
        </div>

        <div className="flex flex-col max-w-[75%]">
          <div
            className={`rounded-2xl px-4 py-2 text-[14px] leading-relaxed shadow-sm ${bubbleColor}`}
          >
            {message.image_url && (
              <ChatImage
                src={message.image_url}
                onClick={() => window.open(message.image_url, "_blank")}
              />
            )}
            {message.content && (
              <span className="whitespace-pre-wrap break-words">
                {message.content}
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 mt-1 ${
              isAdmin ? "justify-start" : "justify-end"
            }`}
          >
            <span
              className={`text-[11px] ${
                isAdmin ? "text-gray-500" : "text-purple-200"
              }`}
            >
              {format(new Date(message.created_at), "HH:mm")}
            </span>
            {!isAdmin && (
              <span
                className={`text-[10px] ${
                  message.status === "read"
                    ? "text-purple-200"
                    : message.status === "delivered"
                    ? "text-purple-300"
                    : "text-purple-400"
                }`}
              >
                {message.status === "read"
                  ? "✓✓"
                  : message.status === "delivered"
                  ? "✓✓"
                  : "✓"}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-600 font-semibold hover:text-purple-800 p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="text-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Chat Session</h2>
          <p className="text-sm text-gray-500 truncate max-w-xs mx-auto">
            ID: {userId}
          </p>
        </div>

        <span
          className={`inline-block w-3 h-3 rounded-full ${
            currentSession?.status === "active"
              ? "bg-green-500"
              : currentSession?.status === "waiting"
              ? "bg-yellow-500"
              : "bg-gray-400"
          }`}
        />
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ paddingBottom: "80px" }}
      >
        <AnimatePresence initial={false}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isAdmin={!msg.is_admin} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 text-sm mt-10"
            >
              No messages yet.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll-to-bottom button */}
        {!isNearBottom && (
          <motion.button
            onClick={scrollToBottom}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed md:bottom-40 bottom-28 md:right-7 right-4 bg-purple-400 text-white rounded-full p-3 shadow-lg hover:bg-purple-600"
            title="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={messageLoading} />
    </motion.div>
  );
};

export default AdminChatView;
