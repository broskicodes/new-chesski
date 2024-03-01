"use client";
import "./styles.css";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Chessboard } from "@/components/Chessboard";
import { SkillLevel } from "@/utils/types";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { Feedback } from "@/components/Feedback";
import { BoardControl } from "@/components/BoardControl";
import { GameLogs } from "@/components/GameLogs";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { EvalBar } from "@/components/EvalBar";
import { Tooltip } from "@/components/Tooltip";

export default function Home() {
  const [showFeedback, setShowFeedback] = useState(false);

  const { session, supabase, signInWithOAuth } = useAuth();
  const { initEngine } = useStockfish();  
  const { game, makeMove } = useChess();


  useEffect(() => {
    if (session) {
      initEngine(true, SkillLevel.Beginner, 2000);
    }
  }, [session, initEngine]);

  useEffect(() => {
    (async () => {
      if (session && supabase) {
        const { data, error } = await supabase.from('feedback').select().eq('uuid', session.id);

        if (!data || data.length === 0) {
          // setTimeout(() => {
          //   setShowFeedback(true);
          // }, 1000 * 90);
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
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Tooltip content="Evaluation Bar">
                  <EvalBar />
                </Tooltip>
                <Chessboard />
              </div>
              <BoardControl />
            </div>
            <GameLogs />
          </div>
        </div>
      )}
      <Feedback show={showFeedback} close={() => setShowFeedback(false)} />
      <Footer />
    </div>
  );
}
