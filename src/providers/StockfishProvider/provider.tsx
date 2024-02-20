import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { StockfishProviderContext } from "./context";
import { SkillLevel, SkillLevelMap } from "@/utils/types";
import { useChess } from "../ChessProvider/context";

const MAX_DEPTH = 17;

export const StockfishProvider = ({ children }: PropsWithChildren) => {
  const [isInit, setIsInit] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // const [bestMove, setBestMove] = useState<string | null>(null);
  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Beginner);
  // const [cp, setCp] = useState<number>(0);
  // const [mate, setMate] = useState(0);
  const [evaluated, setEvaluated] = useState(false);

  const [limitStrength, setLimitStrength] = useState(false);
  const [moveTime, setMoveTime] = useState(0);

  const worker = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    return new Worker("/nmrugg_stockfish_js/stockfish-nnue-16.js");
  }, []);

   const { game, turn, orientation, makeMove } = useChess();

  const onMessage = useCallback((event: MessageEvent<string>) => {
    if (!worker) return;

    // console.log(event.data);
    if (event.data === "uciok") {
      // worker.postMessage(`setoption name Skill Level value ${20}`);
      if (limitStrength) {
        worker.postMessage(
          `setoption name UCI_LimitStrength value ${true}`,
        );
        worker.postMessage(
          `setoption name UCI_ELO value ${SkillLevelMap[skillLvl][1]}`,
        );
      }
      worker.postMessage("ucinewgame");
      worker.postMessage("isready");
      setIsInit(true);
    } else if (event.data === "readyok") {
      setIsReady(true);
    } else if (event.data.includes("multipv")) {
      if (event.data.includes(` depth ${MAX_DEPTH}`)) {
        const res = event.data.split(" pv ")[1];
        const bestMove = res.split(" ")[0];

        if (event.data.includes(" cp ")) {
          const res = event.data.split(" cp ")[1];
          const cp = parseInt(res.split(" ")[0]);

          const customEvent = new CustomEvent("setEval", {
            detail: {
              bestMove: bestMove,
              cp: turn === orientation 
                ? orientation === "white" ? cp : -cp 
                : orientation === "white" ? -cp : cp,
              // cp: cp,
              mate: 0
            },
          });
    
          window.dispatchEvent(customEvent);
          
          // setCp(turn === orientation ? cp : -cp);
          // setMate(0);
        } else if (event.data.includes(" mate ")) {
          const res = event.data.split(" mate ")[1];
          const mate = parseInt(res.split(" ")[0]);

          const customEvent = new CustomEvent("setEval", {
            detail: {
              bestMove: bestMove,
              cp: 0,
              mate: turn === orientation ? mate : -mate
            },
          });
    
          window.dispatchEvent(customEvent);
          // setMate(turn === orientation ? mate : -mate);
        }
      }
    } else if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      setIsSearching(false);
      // setBestMove(bestMove);
      setEvaluated(true);

      // const customEvent = new CustomEvent("newBestMove", {
      //   detail: {
      //     bestMove: bestMove,
      //     // cp: cp,
      //     // mate: mate
      //   },
      // });

      // window.dispatchEvent(customEvent);

      if (turn !== orientation) {
        // makeMove(bestMove);
      }
    }
  }, [worker, orientation, skillLvl, turn, limitStrength]);

  const initEngine = useCallback((limitStrength: boolean,  skillLvl?: SkillLevel, moveTime?: number) => {
    if (!worker) {
      console.log("no worker");
      return;
    }

    setLimitStrength(limitStrength);
    skillLvl && setSkillLvl(skillLvl);
    moveTime && setMoveTime(moveTime);
  }, [worker]);

  const startSearch = useCallback(() => {
    // console.log(!worker, isSearching, !isReady, gameOver)
    if (!worker || isSearching || !isReady || gameOver) {
      return false;
    }
    // console.log("huh")


    setEvaluated(false);
    setIsSearching(true);
    
    worker.onmessage = onMessage;

    const moves = game.history().join(" ");
    worker.postMessage(`position fen ${game.fen()}${moves.length > 0 ? `moves ${moves}` : ""}`);
    worker.postMessage(`go ${
      moveTime ? `movetime ${moveTime}` : `depth ${MAX_DEPTH}`
    }`);

    return true;
  }, [isSearching, isReady, worker, game, gameOver, onMessage, moveTime]);

  // const clearBestMove = useCallback(() => {
  //   setBestMove(null);
  // }, []);

  useEffect(() => {
    if (game.isGameOver()) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [game]);

  useEffect(() => {
    if (isInit || !worker) {
      return;
    }

    worker.onmessage = onMessage;
    worker.postMessage("uci");    
  }, [worker, isInit, onMessage]);

  const value = useMemo(() => ({ 
    isInit,
    isReady,
    // cp,
    // bestMove,
    evaluated,
    initEngine,
    startSearch,
    // clearBestMove
  }), [isInit, isReady, evaluated, initEngine, startSearch]);

  return (
    <StockfishProviderContext.Provider value={value}>
      {children}
    </StockfishProviderContext.Provider>
  )
};