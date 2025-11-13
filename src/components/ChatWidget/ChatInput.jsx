/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import uploadImage from "../../hooks/useUpload";

const ChatInput = ({ onSendMessage, isLoading, chatId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = window.innerWidth < 768 ? 80 : 100;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [message]);

  const handleEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message || !message.trim()) && !imageFile) return;

    let image_url = null;
    if (imageFile) {
      image_url = await uploadImage(imageFile, chatId);
    }

    await onSendMessage({
      content: message?.trim() || "",
      image_url: imageFile ? await uploadImage(imageFile, chatId) : null,
    });

    setMessage("");
    removeImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-100 bg-white px-3 py-2 sticky bottom-0 w-full z-10"
    >
      <div className="flex flex-col gap-2">
        {/* Image preview */}
        {imagePreview && (
          <div className="relative w-40 h-40">
            <img
              src={imagePreview}
              alt="preview"
              className="object-cover rounded-md w-full h-full"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 relative">
          <div className="flex items-center flex-1 bg-gray-100 rounded-full px-3 py-1 max-h-[120px] overflow-y-auto">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setShowPicker(!showPicker)}
            >
              <Smile size={20} />
            </button>

            {showPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none focus:outline-none px-2 py-1 text-sm text-gray-800"
            />

            {/* Paperclip */}
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </div>

          <AnimatePresence>
            {(message?.trim().length > 0 || imageFile) && (
              <motion.button
                key="send"
                type="submit"
                disabled={isLoading}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="bg-purple-400 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-60"
              >
                {isLoading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <Send size={18} />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
