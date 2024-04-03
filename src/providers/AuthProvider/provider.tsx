import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./context";
import posthog from 'posthog-js';
import { setCurrGameState } from "@/utils/clientHelpers";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [origin, setOrigin] = useState("");
  const [session, setSession] = useState<User | null>(null);
  
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const signInWithOAuth = useCallback(async (next?: string) => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback${next ? '?next=subscribe' :''}`,
        queryParams: {
          next: "subscribe"
        }
      },
    });
  }, [origin, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrGameState({
      id: "",
      startingPos: "",
      complete: false,
      moves: [],
      orientation: "white"
    });
  }, [supabase]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user }} = await supabase.auth.getUser();
      setSession(user || null);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session?.user || null);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    })();
  }, [supabase.auth]);

  useEffect(() => {
    if (session) {
      try {
        posthog.identify(session.id, {
          id: session.id,
          email: session.email,
        });
      } catch (error) {
        console.log("Error during posthog identify: ", error);
      }
    }
  }, [session]);

  const value = useMemo(() => ({
    session,
    supabase,
    signInWithOAuth,
    signOut,
  }), [session, supabase, signInWithOAuth, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};