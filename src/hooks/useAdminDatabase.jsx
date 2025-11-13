/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const useAdminDatabase = (sessionId) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const initialized = useRef(false);

  const initializeChat = useCallback(async () => {
    if (initialized.current) return currentSession;
    initialized.current = true;

    setLoading(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existing && existing.length > 0) {
        setCurrentSession(existing[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const fetchMessages = useCallback(async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.log("Error fetching messages: ", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (messageData) => {
      if (!messageData) return;

      const content =
        typeof messageData.content === "string"
          ? messageData.content.trim()
          : "";
      const image_url = messageData.image_url || null;

      if (!content && !image_url) return; // skip empty messages

      setMessageLoading(true);

      try {
        const session = currentSession || (await initializeChat());
        if (!session) throw new Error("Failed to initialize chat session.");

        const newMessage = {
          id: uuidv4(),
          session_id: session.id,
          content,
          image_url, // store optional image
          is_admin: true, // or false for user
          created_at: new Date().toISOString(),
          status: "sent",
        };

        const { error } = await supabase
          .from("messages")
          .insert([newMessage])
          .select();

        if (error) throw error;

        setMessages((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setMessageLoading(false);
      }
    },
    [currentSession, initializeChat]
  );

  useEffect(() => {
    (async () => {
      const session = await initializeChat();
      if (session) await fetchMessages(sessionId);
    })();
  }, [initializeChat, fetchMessages]);

  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel("messages-listener") // fixed name
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => {
            if (payload.new.session_id !== currentSession.id) return prev; // only update current session
            const exists = prev.some((msg) => msg.id === payload.new.id);
            if (payload.eventType === "INSERT" && !exists)
              return [...prev, payload.new];
            if (payload.eventType === "UPDATE")
              return prev.map((msg) =>
                msg.id === payload.new.id ? payload.new : msg
              );
            if (payload.eventType === "DELETE")
              return prev.filter((msg) => msg.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  return { messages, messageLoading, loading, currentSession, sendMessage };
};

export default useAdminDatabase;
