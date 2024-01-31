"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [sessison, setSession] = useState<User | null>(null);

  const [origin, setOrigin] = useState("");

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const oauth = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }, [origin]);

  const importGames = useCallback(async () => {
    if (!sessison) return;
    
    const res = await fetch("/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      alert("Error importing games");
      return;
    }

    const count = await res.json();
    if (count === 0) {
      alert("No games found. Ensure you have linked the correct accounts");
      return;
    } else {
      alert(`Imported ${count} games`);
    }

  }, [sessison]);

  useEffect(() => {
    setOrigin(window.location.origin);
    console.log(window.location.origin);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSession(user);
    })();
  }, [supabase]);

  return (
    <div>
      {!sessison && (
        <div>
          <div className="header">
            CHESSKI
          </div>
          <div className="sub-header">
            <p>Your personal AI chess <i>tutor</i>&nbsp; that coaches you in <i>plain English</i></p>
          </div>
          <div className="sign-up">
            <button className="button" onClick={oauth}>Sign In With Google</button>
          </div>
        </div>
      )}
      {sessison && (
        <div>
          <button className="button" onClick={importGames}>Import Games</button>
          <div className="chat">
            <input className="input" type="text" placeholder="Send a message" />
          </div>
        </div> 
      )}
    </div>
  );
}
