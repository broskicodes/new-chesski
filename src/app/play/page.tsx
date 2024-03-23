"use client";
import './styles.css';

import { BoardControl } from "@/components/BoardControl";
import { Chessboard } from '@/components/Chessboard';
import { EvalBar } from "@/components/EvalBar";
import { GameLogs } from "@/components/GameLogs";
import { Tooltip } from "@/components/Tooltip";
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogOverlay, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/providers/AuthProvider/context';
import { useChess } from '@/providers/ChessProvider/context';
import { useCoach } from '@/providers/CoachProvider/context';
import { useEvaluation } from '@/providers/EvaluationProvider/context';
import { useStockfish } from '@/providers/StockfishProvider/context';
import { GameState, SkillLevel } from '@/utils/types';
import { useEffect, useRef, useState } from 'react';
import { Footer } from '@/components/Footer';
import { Message } from 'ai';

enum GameResult {
  Win = 0,
  Loss = 1,
  Draw = 2
}

enum DrawType {
  Stalemate = 0,
  Repetition = 1,
  MoveRule = 2,
  InsufficientMaterial = 3
}

export default function Play() {
  const [gameStateChanged, setGameStateChanged] = useState(0);
  const [pastFen, setPastFen] = useState("");
  const [closed, setClosed] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [drawType, setDrawType] = useState<DrawType | null>(null);


  const { session, supabase, signInWithOAuth, signOut } = useAuth();
  const { initEngine, isReady } = useStockfish();
  const { game, gameOver, turn, orientation, reset, playContinuation, swapOrientation } = useChess();
  const { clearEvaluations } = useEvaluation();
  const { clearGameMessages, setGameMessages } = useCoach();

  const contentRef = useRef<HTMLDivElement>(null);
  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!session && game.fen() !== pastFen) {
      setGameStateChanged(gameStateChanged + 1);
      setPastFen(game.fen())
    }
  }, [game, session, gameStateChanged, pastFen])

  useEffect(() => {
    initEngine(true, SkillLevel.Beginner, 2000);
  }, [initEngine]);

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth < 640) {
        divRef.current!.style.height = `${window.innerHeight - chessRef.current!.offsetHeight - 8}px`;
        divRef.current!.style.width = `${window.innerWidth > 480 ? 480 : window.innerWidth}px`
      } else {

      }
    }

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [contentRef.current, chessRef.current, divRef.current]);

  useEffect(()=> {
    if (gameOver && game.isGameOver()) {
      modalTriggerRef.current?.click();

      if (game.isCheckmate()) {
        if (turn === orientation) {
          setGameResult(GameResult.Loss)
        } else {
          setGameResult(GameResult.Win);
        }
      } else if (game.isDraw()) {
        setGameResult(GameResult.Draw);

        if (game.isStalemate()) {
          setDrawType(DrawType.Stalemate)
        } else if (game.isThreefoldRepetition()) {
          setDrawType(DrawType.Repetition)
        } else if (game.isInsufficientMaterial()) {
          setDrawType(DrawType.InsufficientMaterial)
        }
      }
    }
  }, [game, gameOver, turn, orientation])

  useEffect(() => {
    console.log("hello");

    const gameState: GameState | null = JSON.parse(localStorage.getItem("currGameState")!);
    const msgState: Message[] = JSON.parse(localStorage.getItem("currMessages")!)

    if (gameState) {
      playContinuation(gameState.moves, true);
      if (gameState.orientation && gameState.orientation === "black" && orientation === "white") {
        swapOrientation();
      }
    }

    if (msgState) {
      setGameMessages(msgState);
    }
  }, [])

  return (
    <div className="">
      <Navbar />
      {/* <Footer /> */}
      <Dialog >
        <DialogTrigger ref={modalTriggerRef} className='hidden' />
        <DialogContent>
          <DialogHeader className='flex flex-col items-center space-y-0'>
            <DialogTitle className='text-2xl'>Game Over</DialogTitle>
            <DialogDescription>{(() => {
              let desc: string;

              switch (gameResult) {
                case GameResult.Win:
                  desc = "Congradulations, you won!";
                  break;
                case GameResult.Loss:
                  desc = "You lost. Better luck next time!";
                  break;
                case GameResult.Draw:
                  switch (drawType) {
                    case DrawType.Stalemate:
                      desc = "Draw. The game ended in stalemate.";
                      break;
                    case DrawType.Repetition:
                      desc = "Draw by threefold repetition.";
                      break;
                    case DrawType.InsufficientMaterial:
                      desc = "Draw, insufficient material";
                      break;
                    default: 
                      desc = "The game ended in a draw."
                  }
                  break;
                default:
                  desc = "The game came to a magical ending!"
              }

              return desc;
            })()}</DialogDescription>
          </DialogHeader>
          {session && (
            <Button onClick={() => { 
              reset();
              clearEvaluations();
              clearGameMessages();
            }}>
              Play Again
            </Button>
          )}
          {!session && (
            <div className='flex flex-col space-y-2'>
              <div className='flex flex-col '>
                <DialogTitle>Learn something?</DialogTitle>
                <DialogDescription className='text-black'>Sign up to get more out of Chesski!</DialogDescription>
              </div>
              <Button onClick={signInWithOAuth}>
                Sign in with Google
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* <Button onClick={() => { signOut(); router.push("/"); }}>sign out</Button> */}
      <div className="page-content" ref={contentRef}>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0" ref={chessRef}>
          <EvalBar />
          <div className="flex flex-col space-y-2">
            <div className='relative'>
              {/* {!isReady && (
                <div className='board-overlay'>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B03A3]" />
                </div>
              )} */}
              <Chessboard />
            </div>
            <BoardControl />
          </div>
        </div>
        <div className='sm:w-fit sm:h-fit' ref={divRef}>
          <GameLogs />
        </div>
      </div>
    </div>
  )
}