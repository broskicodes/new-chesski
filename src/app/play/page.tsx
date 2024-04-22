"use client";
import "./styles.css";

import { BoardControl } from "@/components/BoardControl";
import { Chessboard } from "@/components/Chessboard";
import { EvalBar } from "@/components/EvalBar";
import { GameLogs } from "@/components/GameLogs";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { useCoach } from "@/providers/CoachProvider/context";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { GameState } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { Message } from "ai";
import { useSetup } from "@/providers/SetupProvider";
import { expToLvl } from "@/utils/clientHelpers";
import { useUserData } from "@/providers/UserDataProvider/context";

export default function Play() {
  const [gameStateChanged, setGameStateChanged] = useState(0);
  const [pastFen, setPastFen] = useState("");

  const { session } = useAuth();
  const { initEngine, uninit } = useStockfish();
  const { game, orientation, playContinuation, swapOrientation } = useChess();
  const { setGameMessages } = useCoach();
  const { settingUp, toggleModal } = useSetup();
  const { experience } = useUserData();

  const contentRef = useRef<HTMLDivElement>(null);
  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session && game.fen() !== pastFen) {
      setGameStateChanged(gameStateChanged + 1);
      setPastFen(game.fen());
    }
  }, [game, session, gameStateChanged, pastFen]);

  useEffect(() => {
    uninit();
    initEngine(true, expToLvl(experience), 2000);
  }, [initEngine, uninit, experience]);

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
  }, [contentRef.current, chessRef.current, divRef.current]);

  useEffect(() => {
    const gameState: GameState | null = JSON.parse(
      localStorage.getItem("currGameState")!,
    );
    const msgState: Message[] = JSON.parse(
      localStorage.getItem("currMessages")!,
    );

    if (gameState) {
      if (gameState.moves && gameState.moves.length) {
        playContinuation(gameState.moves, true);
      }
      if (
        gameState.orientation &&
        gameState.orientation === "black" &&
        orientation === "white"
      ) {
        swapOrientation();
      }

      // if (gameState.moves.length === 0) {
      //   toggleModal(true);
      // }
    }

    if (msgState) {
      setGameMessages(msgState);
    }
  }, []);

  return (
    <div>
      {settingUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" />
      )}

      <Navbar />
      {/* <Footer /> */}
      <div className="page-content" ref={contentRef}>
        <div
          className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
          ref={chessRef}
        >
          <EvalBar />
          <div className="flex flex-col space-y-2">
            <div className={settingUp ? "z-40" : ""}>
              <Chessboard />
            </div>
            <BoardControl className={settingUp ? "z-40" : ""} />
          </div>
        </div>
        <div className="sm:w-fit sm:h-fit" ref={divRef}>
          <GameLogs />
        </div>
      </div>
    </div>
  );
}
