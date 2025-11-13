/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { format } from "date-fns";
import ChatImage from "./ChatImage";

const msgMotion = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  exit: { opacity: 0, y: -15, transition: { duration: 0.15 } },
};

const ChatMessage = ({ message, isAdmin }) => {
  const bubbleColor = isAdmin
    ? "bg-gray-100 text-gray-800"
    : "bg-gradient-to-br from-purple-500 to-purple-600 text-white";

  const align = isAdmin ? "items-start" : "items-end";
  const row = isAdmin ? "flex-row" : "flex-row-reverse";

  return (
    <motion.div
      variants={msgMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`flex ${row} gap-2 w-full`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isAdmin ? "bg-purple-100 text-purple-700" : "bg-purple-600 text-white"
        }`}
      >
        {isAdmin ? "S" : "U"}
      </motion.div>

      <div className={`flex flex-col ${align} max-w-[75%]`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`rounded-2xl px-4 py-2 text-[14px] leading-relaxed shadow-sm ${bubbleColor}`}
        >
          {message.image_url ? <ChatImage src={message.image_url} /> : null}
          {message.content && (
            <span className="whitespace-pre-wrap break-words">
              {message.content}
            </span>
          )}
        </motion.div>

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
                  : "text-purple-300"
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

export default ChatMessage;
