/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase, visitorId } from "../services/supabase/supabaseClient";

export const useDatabase = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const initialized = useRef(false); // prevents double init

  const initializeChat = useCallback(async () => {
    if (initialized.current) return currentSession;
    initialized.current = true;

    setLoading(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("visitor_id", visitorId)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existing && existing.length > 0) {
        setCurrentSession(existing[0]);
        return existing[0];
      }

      const newSession = {
        id: uuidv4(),
        visitor_id: visitorId,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from("chat_sessions")
        .insert([newSession])
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentSession(inserted);
      return inserted;
    } catch (error) {
      console.error("Chat initialization error:", error);
      return null;
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
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
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
          is_admin: false, // or false for user
          created_at: new Date().toISOString(),
          status: "sent",
        };

        const { data, error } = await supabase
          .from("messages")
          .insert([newMessage])
          .select();

        if (error) throw error;
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
      if (session) await fetchMessages(session.id);
    })();
  }, [initializeChat, fetchMessages]);

  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel("messages-listener")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${currentSession.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Prevent duplicate messages by checking id
            const exists = prev.some((msg) => msg.id === payload.new?.id);
            if (payload.eventType === "INSERT" && !exists) {
              return [...prev, payload.new];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((msg) =>
                msg.id === payload.new.id ? payload.new : msg
              );
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((msg) => msg.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  return {
    messages,
    sendMessage,
    loading,
    messageLoading,
    currentSession,
  };
};

export default useDatabase;
