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
import { useAuth } from "@/providers/AuthProvider/context";

export default function Home() {
  const [showFeedback, setShowFeedback] = useState(false);

  const { session, supabase, signInWithOAuth } = useAuth();
  const { initEngine } = useStockfish();  


  useEffect(() => {
    if (session) {
      initEngine(true, SkillLevel.Beginner, 1500);
    }
  }, [session, initEngine]);

  useEffect(() => {
    (async () => {
      if (session && supabase) {
        const { data, error } = await supabase.from('feedback').select().eq('uuid', session.id);

        if (!data || data.length === 0) {
          setTimeout(() => {
            setShowFeedback(true);
          }, 1000 * 90);
        }
      }
    })();
  }, [session, supabase]);

  return (
    <div className="h-full">
      {!session && (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="header">
            CHESSKI
          </div>
          <div className="sub-header">
            <p>Your personal AI chess <i>tutor</i>&nbsp; that coaches you in <i>plain English</i></p>
          </div>
          <div className="sign-up">
            <button className="button" onClick={signInWithOAuth}>Sign In With Google</button>
          </div>
        </div>
      )}
      {session && (
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
      <Feedback session={session} show={showFeedback} close={() => setShowFeedback(false)} />
      <Footer />
    </div>
  );
}
