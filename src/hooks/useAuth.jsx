import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
