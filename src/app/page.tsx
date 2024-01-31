"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [validSignup, setValidSignup] = useState(false);
  const [sessison, setSession] = useState<User | null>(null);

  const [origin, setOrigin] = useState("");

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      alert("Error signing up");
      return;
    }

    setValidSignup(true);
  }, [email]);

  const oauth = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }, [origin]);

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
          {validSignup && (
            <div className="success flex flex-col items-center">
              <p>Thank you for signing up!</p>
              <p>We&apos;ll be in touch soon.</p>
            </div>
          )}
          {!validSignup && (<div className="sign-up">
            <button className="button" onClick={oauth}>Sign In With Google</button>
          </div>)}
        </div>
      )}
      {sessison && (
        <div>

          <div className="chat">
            <input className="input" type="text" placeholder="Send a message" />
          </div>
        </div> 
      )}
    </div>
  );
}
