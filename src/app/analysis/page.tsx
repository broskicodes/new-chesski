"use client"

import { AnalysisBoard } from "@/components/AnalysisBoard";
import { MoveList } from "@/components/MoveList";
import { Navbar } from "@/components/Navbar";
import { useAnalysis } from "@/providers/AnalysisProvider";
import { useAuth } from "@/providers/AuthProvider/context";
import { useCoach } from "@/providers/CoachProvider/context";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const UselessComp = () => {
  const [findingGame, setFindingGame] = useState(false);
  const [found, setFound] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const { setGamePgn } = useAnalysis();
  const { session, supabase } = useAuth();

  const params = useSearchParams();

  useEffect(() => {
    setGameId(params?.get("gameId") ?? null);
  }, [params]);

  useEffect(() => {
    if (!gameId || !session || !supabase || findingGame || found) return;

    setFindingGame(true);
    // (async () => {
      supabase.from("games")
        .select("starting_pos,result,user_color,moves")
        .eq("id", gameId)
        .then(({ data, error }) => {
          if (error) {
            console.log(error);
            return
          }
    
          if (!data || !data[0]) {
            return;
          }
    
          const g = data[0];

          if (!g) {
            return;
          }
    
          setGamePgn(g.moves.join(" "), g.user_color, g.result);
          setFound(true);
          
          setFindingGame(false);
        })
    // }      
  }, [gameId, session, supabase, findingGame, found, setGamePgn]);

  return (
    <div className="hidden" />
  )
}

const AnalyzePage = () => {
  const { processing } = useCoach();
  const { nextMove, prevMove, firstMove, lastMove, analyzed, classified } = useAnalysis();

  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextMove();
      } else if (event.key === 'ArrowLeft') {
        prevMove();
      } else if (event.key === 'ArrowDown') {
        lastMove();
      } else if (event.key === 'ArrowUp') {
        firstMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [firstMove, lastMove, nextMove, prevMove]);

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth < 640) {
        divRef.current!.style.height = `${window.innerHeight - chessRef.current!.offsetHeight - 8}px`;
        divRef.current!.style.width = `${window.innerWidth > 480 ? 480 : window.innerWidth}px`;
      } else {
      }
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [chessRef.current, divRef.current]);

  return (
    <div className="sm:justify-center flex flex-col h-full">
      <Navbar />
      <Suspense>
        <UselessComp />
      </Suspense>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-16 h-full sm:h-min">
        <div
          className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:space-y-0"
          ref={chessRef}
        >
          {/* <EvalBar /> */}
          <div className="flex flex-col space-y-2">
            <div>
              <AnalysisBoard freeze={!analyzed || !classified || processing} />
            </div>
          </div>
        </div>
        <div ref={divRef}>
          <MoveList />
        </div>
      </div>
    </div>
  );
}

export default AnalyzePage;