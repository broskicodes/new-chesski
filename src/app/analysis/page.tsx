"use client"

import { AnalysisBoard } from "@/components/AnalysisBoard";
import { EvalBar } from "@/components/EvalBar";
import { GameSelect } from "@/components/GameSelect";
import { MoveList } from "@/components/MoveList";
import { Navbar } from "@/components/Navbar";
import { Chessboard } from "@/components/Playboard";
import { useAnalysis } from "@/providers/AnalysisProvider";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { Classification, useEvaluation } from "@/providers/EvaluationProvider/context";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { getClassColor } from "@/utils/clientHelpers";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const AnalyzePage = () => {

  const { nextMove, prevMove } = useAnalysis()
  const chessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextMove();
      } else if (event.key === 'ArrowLeft') {
        prevMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextMove, prevMove]);
  
  

  // useEffect(() => {
  //   setGameId(params?.get("gameId") ?? null);
  // }, [params]);

  // useEffect(() => {
  //   if (!gameId || !session || !supabase || findingGame) return;

  //   setFindingGame(true);
  //   // (async () => {
  //     supabase.from("games")
  //       .select("starting_pos,result,user_color,moves")
  //       .eq("id", gameId)
  //       .then(({ data, error }) => {
  //         if (error) {
  //           console.log(error);
  //           return
  //         }
    
  //         if (!data || !data[0]) {
  //           return;
  //         }
    
  //         const g = data[0];

  //         if (!g || moves.length > 0) {
  //           return;
  //         }
    
  //         if (orientation !== g.user_color) {
  //           swapOrientation();
  //         }
        
  //         setMoves(g.moves);
  //         setMoveIdx(-1);
  //         setFindingGame(false)
  //       })
  //   // }      
  // }, [gameId, session, supabase, orientation, moves, findingGame, swapOrientation]);

  

  // useEffect(() => {
  //   if (moves.length <= 0 || !isInit || !isReady) return;


  // }, [moves, isInit, isReady])
  // useEffect(() => {
  //   const resizeHandler = () => {
  //     if (window.innerWidth < 640) {
  //       divRef.current!.style.height = `${window.innerHeight - chessRef.current!.offsetHeight - 8}px`;
  //       divRef.current!.style.width = `${window.innerWidth > 480 ? 480 : window.innerWidth}px`;
  //     } else {
  //     }
  //   };

  //   resizeHandler();
  //   window.addEventListener("resize", resizeHandler);
  //   return () => window.removeEventListener("resize", resizeHandler);
  // }, [contentRef.current, chessRef.current, divRef.current]);


  return (
    <div>
      <Navbar />
      <GameSelect />
      <div
        className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
        ref={chessRef}
      >
        <EvalBar />
        <div className="flex flex-col space-y-2">
          <div>
            <AnalysisBoard />
          </div>
          {/* <BoardControl className={settingUp ? "z-40" : ""} /> */}
        </div>
      </div>
      <MoveList />
    </div>
  );
}

export default AnalyzePage;