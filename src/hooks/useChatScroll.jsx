import { useState, useRef, useEffect, useCallback } from "react";

export const useChatScroll = (messages) => {
  const scrollRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Check if scroll position is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const threshold = 100; // pixels from bottom
    const bottomDistance =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setIsNearBottom(bottomDistance < threshold);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkIfNearBottom();
    // Only auto-scroll if user hasn't manually scrolled up
    if (!isNearBottom) {
      setAutoScroll(false);
    }
  }, [checkIfNearBottom, isNearBottom]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (force = false) => {
      const container = scrollRef.current;
      if (!container || (!autoScroll && !force)) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    },
    [autoScroll]
  );

  // Reset auto-scroll when manually scrolling to bottom
  useEffect(() => {
    if (isNearBottom && !autoScroll) {
      setAutoScroll(true);
    }
  }, [isNearBottom, autoScroll]);

  // Auto-scroll on new messages if enabled
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    scrollRef,
    isNearBottom,
    scrollToBottom: () => scrollToBottom(true), // Force scroll to bottom
    autoScroll,
    setAutoScroll,
  };
};

export default useChatScroll;
