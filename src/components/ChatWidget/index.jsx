import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleBubble = () => setIsOpen(!isOpen);
  return (
    <div>
      {isOpen ? (
        <ChatWindow handleWindow={handleBubble} />
      ) : (
        <ChatBubble handleBubble={handleBubble} />
      )}
    </div>
  );
};

export default ChatWidget;
