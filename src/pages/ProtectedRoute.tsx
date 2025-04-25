import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "./supabase-client";

const ProtectedRoute = () => {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }>({
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let authListener: any;

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: !!data.session,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: error instanceof Error ? error.message : "Auth error",
          });
        }
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: listenerData } = supabase.auth.onAuthStateChange(
      (session) => {
        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: !!session,
            error: null,
          });
        }
      },
    );

    authListener = listenerData;

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (authState.error) {
    console.error("Authentication error:", authState.error);
    return <Navigate to="/signin" />;
  }

  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
