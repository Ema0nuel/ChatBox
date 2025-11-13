import React from "react";
import { LuMessageSquare } from "react-icons/lu";

const ChatBubble = ({ handleBubble }) => {
  return (
    <>
      <div
        onClick={handleBubble}
        className="bg-purple-400/90 fixed bottom-8 right-6 p-2 rounded-full border-2 transition-all hover:bg-purple-600/80 hover:transition-colors hover:duration-300 hover:cursor-pointer"
      >
        <LuMessageSquare color="white" size={32} />
      </div>
    </>
  );
};

export default ChatBubble;
