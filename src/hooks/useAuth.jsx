import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (ignore) return;

      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    // Listen for auth changes including PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (ignore) return;

      // Supabase recovery event
      if (event === "PASSWORD_RECOVERY") {
        // User is in reset-password flow
        navigate("/admin/live/reset-password");
        setUser(session?.user ?? null);
        setLoading(false);
        return;
      }

      // Regular auth updates
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkAuth = () => {
    if (!user && !loading) {
      navigate("/admin/live/login");
      return false;
    }
    return true;
  };

  const checkAuthRedirectToDashboard = () => {
    if (user && !loading) {
      navigate("/admin/dashboard");
      return true;
    }
    return false;
  };

  return { user, loading, checkAuth, checkAuthRedirectToDashboard };
}
