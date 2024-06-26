import { createContext, useContext } from "react";
import { Provider, SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthProviderContext {
  session: User | null;
  supabase: SupabaseClient | null;
  sessionLoaded: boolean;
  signInWithOAuth: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthProviderContext>({
  session: null,
  supabase: null,
  sessionLoaded: false,
  signInWithOAuth: () => {
    throw new Error("signInWithOAuth function has not been implemented");
  },
  signOut: () => {
    throw new Error("signOut function has not been implemented");
  },
});

export const useAuth = () => useContext(AuthContext);
