"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";
import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import "./styles.css";
import { Footer } from "@/components/Footer";
import { Chessboard } from "@/components/Chessboard";
import { SanRegex, SkillLevel } from "@/utils/types";
import { useChess } from "@/providers/ChessProvider/context";
import { Message } from "ai";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { Feedback } from "@/components/Feedback";
import { BoardControl } from "@/components/BoardControl";
import { match } from "assert";
import { GameLogs } from "@/components/GameLogs";

export default function Home() {
  const [sessison, setSession] = useState<User | null>(null);
  const [origin, setOrigin] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const { initEngine } = useStockfish();  

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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // useEffect(() => {
  //   console.log("bestMove", bestMove);
  // }, [bestMove]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSession(user);
    })();
  }, [supabase]);

  useEffect(() => {
    if (sessison) {
      initEngine(SkillLevel.Beginner);
    }
  }, [sessison, initEngine]);

  useEffect(() => {
    (async () => {
      if (sessison) {
        const { data, error } = await supabase.from('feedback').select().eq('uuid', sessison.id);

        if (!data || data.length === 0) {
          setTimeout(() => {
            setShowFeedback(true);
          }, 1000 * 90);
        }
      }
    })();
  }, [sessison, supabase]);

  return (
    <div className="h-full">
      {!sessison && (
        <div className="flex flex-col justify-center items-center h-full">
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
        <div className="sm:pt-20 not-footer">
          <div className="header hidden sm:block">
            CHESSKI
          </div>
          <div className="page-content">
            <div className="flex flex-col space-y-4">
              <Chessboard />
              <BoardControl />
            </div>
            <GameLogs />
          </div>
        </div> 
      )}
      <Feedback session={sessison} show={showFeedback} close={() => setShowFeedback(false)} />
      <Footer />
    </div>
  );
}
