/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";

const ChatImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  const handleClick = () => {
    if (src) window.open(src, "_blank");
  };

  return (
    <div className="relative flex justify-center items-center">
      {!loaded && (
        <div className="flex flex-row justify-center items-center h-40 w-40 bg-gray-200 rounded-2xl">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                repeatType: "loop",
                delay,
              }}
              className="w-3 h-3 bg-purple-500 rounded-full mx-1"
            />
          ))}
        </div>
      )}

      <img
        src={src}
        alt={alt || "chat-image"}
        onLoad={() => setLoaded(true)}
        onClick={handleClick}
        className={`rounded-2xl object-cover cursor-pointer transition-all duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } w-40 h-40`}
      />
    </div>
  );
};

export default ChatImage;
