/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatabase } from "../../hooks/useDatabase";
import { useChatScroll } from "../../hooks/useChatScroll";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Header from "./Header";

const ChatWindow = ({ handleWindow }) => {
  const DEFAULT_SIZE = { width: 380, height: 520 };
  const isInitiallyMobile = window.innerWidth < 768;

  const [isMobile, setIsMobile] = useState(isInitiallyMobile);
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState(
    isInitiallyMobile
      ? { width: window.innerWidth, height: window.innerHeight }
      : DEFAULT_SIZE
  );

  const containerRef = useRef(null);
  const {
    messages = [],
    sendMessage,
    loading,
    messageLoading,
    currentSession,
    initializeChat,
  } = useDatabase();
  const { scrollRef, isNearBottom, scrollToBottom } = useChatScroll(messages);

  // detect resize and update mobile mode dynamically
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!isDragging) {
        setSize(
          mobile
            ? { width: window.innerWidth, height: window.innerHeight }
            : DEFAULT_SIZE
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDragging]);

  // handle resizing on desktop
  const handleResize = useCallback(
    (e) => {
      if (isMobile || !isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = Math.max(
        320,
        Math.min(window.innerWidth - 40, e.clientX - rect.left)
      );
      const height = Math.max(
        420,
        Math.min(window.innerHeight - 40, e.clientY - rect.top)
      );
      setSize({ width, height });
    },
    [isDragging, isMobile]
  );

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopDragging);
  }, [handleResize]);

  const startDragging = useCallback(
    (e) => {
      if (isMobile) return;
      e.preventDefault();
      setIsDragging(true);
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopDragging);
    },
    [handleResize, stopDragging, isMobile]
  );

  const handleSendMessage = async (messageData) => {
    // messageData is an object: { content, image_url }
    if (!messageData) return;

    const content =
      typeof messageData.content === "string" ? messageData.content.trim() : "";
    const image_url = messageData.image_url || null;

    // skip if both are empty
    if (!content && !image_url) return;
    if (messageLoading) return;

    if (!currentSession) await initializeChat();

    // send the object as-is to your useDatabase sendMessage
    await sendMessage({ content, image_url });
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`fixed bg-white shadow-2xl overflow-hidden border border-purple-100 z-[99999999999] transition-all duration-300 ${
        isMobile ? "inset-0 rounded-none" : "rounded-2xl right-5 bottom-5"
      }`}
      style={{
        width: isMobile ? "100vw" : size.width,
        height: isMobile ? "100vh" : size.height,
        maxWidth: "100vw",
        maxHeight: "100vh",
      }}
    >
      <div className="flex flex-col h-full">
        <Header handleWindow={handleWindow} />

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ height: "calc(100% - 140px)" }}
        >
          <AnimatePresence initial={false}>
            {loading ? (
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isAdmin={msg.is_admin}
                />
              ))
            )}
          </AnimatePresence>

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

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={messageLoading}
        />

        {!isMobile && (
          <div
            onMouseDown={startDragging}
            className="absolute bottom-2 right-2 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400">
              <path
                fill="currentColor"
                d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatWindow;
