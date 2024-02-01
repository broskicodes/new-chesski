"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";

import "./styles.css";
import { useChat, experimental_useAssistant } from "ai/react";

export default function Home() {
  const [sessison, setSession] = useState<User | null>(null);
  const [origin, setOrigin] = useState("");

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/chat"
  });

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
  }, [origin, supabase]);

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

  const analyzePlaystyle = useCallback(async () => {
    if (!sessison) return;

    const res = await fetch("/analyze-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      alert("Error analyzing playstyle");
      return;
    }

    // const data = await res.json();
    alert(`Your playstyle has been analyzed`);
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
          <button className="button" onClick={analyzePlaystyle}>Analyze Playstyle</button>
          <div className="chat">
            <div className="chat-messages">
              {messages.map((message, i) => {
                if (!(message.role === "user" || message.role === "assistant")) return null;

                return (
                  <div key={i} className="flex flex-row space-x-2 items-center">
                    <span className={`${message.role}-message role`}>{message.role.toUpperCase()}:</span>
                    <p className="content">{message.content}</p>
                  </div>
                )
              })}
            </div>
            {/* <form onSubmit={handleSubmit} className="flex flex-row items-center space-x-4">
              <input className="input" value={input} onChange={handleInputChange} type="text" placeholder="Send a message" />
              <button className="button" type="submit">Send</button>
            </form> */}
          </div>
        </div> 
      )}
    </div>
  );
}
