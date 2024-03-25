import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { StockfishProviderContext } from "./context";
import { SkillLevel, SkillLevelMap } from "@/utils/types";
import { useChess } from "../ChessProvider/context";

const MAX_DEPTH = 17;

export const StockfishProvider = ({ children }: PropsWithChildren) => {
  const [isInit, setIsInit] = useState(false);
  const [uciOk, setUciOk] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // const [bestMove, setBestMove] = useState<string | null>(null);
  // const [cp, setCp] = useState<number>(0);
  // const [mate, setMate] = useState(0);
  const [evaluated, setEvaluated] = useState(false);

  const [limitStrength, setLimitStrength] = useState(false);
  const [moveTime, setMoveTime] = useState(0);
  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Beginner);

  const { game, turn, orientation, makeMove } = useChess();

  const worker = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    return new Worker("/nmrugg_stockfish_js/stockfish-nnue-16.js");
  }, []);


  const onMessage = useCallback((event: MessageEvent<string>) => {
    if (!worker) return;

    // console.log(event.data);
    if (event.data === "uciok") {
      if (limitStrength) {
        // console.log("limit", SkillLevelMap[skillLvl][1])
        // worker.postMessage(`setoption name Skill Level value ${20}`);
        worker.postMessage(
          `setoption name UCI_LimitStrength value ${true}`,
        );
        worker.postMessage(
          `setoption name UCI_Elo value ${SkillLevelMap[skillLvl][1]}`,
        );
      }
      worker.postMessage("setoption name MultiPV value 3")
      worker.postMessage("ucinewgame");
      worker.postMessage("isready");
      
      setUciOk(true);
    } else if (event.data === "readyok") {
      setIsReady(true);
    } else if (event.data.includes("multipv")) {
      if ((!moveTime && event.data.includes(` depth ${MAX_DEPTH}`)) || (moveTime && parseInt(event.data.split(" time ")[1].split(" ")[0]) >= moveTime)) {
        const pv = event.data.split(" pv ")[1];
        // const bestMove = pv.split(" ")[0];
        const multiPv = parseInt(event.data.split(" multipv ")[1].split(" ")[0]);

        // console.log(multiPv, pv.split(" "));

        if (event.data.includes(" cp ")) {
          const res = event.data.split(" cp ")[1];
          const cp = parseInt(res.split(" ")[0]);

          const customEvent = new CustomEvent("setEval", {
            detail: {
              multiPv: multiPv,
              pv: pv.split(" "),
              cp: turn === orientation 
                ? orientation === "white" ? cp : -cp 
                : orientation === "white" ? -cp : cp,
              // cp: cp,
              mate: 0,
              fen: game.fen()
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
              // bestMove: bestMove,
              multiPv: multiPv,
              pv: pv.split(" "),
              cp: 0,
              mate: turn === orientation 
              ? orientation === "white" ? mate : -mate 
              : orientation === "white" ? -mate : mate,
              fen: game.fen()
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

      const customEvent = new CustomEvent("setBestMove", {
        detail: {
          bestMove: bestMove,
          fen: game.fen()
        },
      });

      window.dispatchEvent(customEvent);
    }
  }, [worker, orientation, skillLvl, turn, limitStrength, game, moveTime]);

  const initEngine = useCallback((limitStrength: boolean,  skillLvl?: SkillLevel, moveTime?: number) => {
    if (!worker) {
      console.log("no worker");
      return;
    }

    skillLvl && setSkillLvl(skillLvl);
    moveTime && setMoveTime(moveTime);
    setLimitStrength(limitStrength);

    setIsInit(true);
  }, [worker]);

  const updateEngine = useCallback((limitStrength: boolean,  skillLvl?: SkillLevel, moveTime?: number) => {
    if (!worker) {
      console.log("no worker");
      return;
    }

    initEngine(limitStrength, skillLvl, moveTime);

    setUciOk(false);
  }, [initEngine, worker]);

  const startSearch = useCallback(() => {
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

  const uninit = useCallback(() => {
    setIsInit(false);
    setIsReady(false);
    setUciOk(false);
  }, []);

  useEffect(() => {
    if (game.isGameOver()) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [game]);

  useEffect(() => {
    if (!worker || !isInit || uciOk) {
      return;
    }

    setIsReady(false);
    worker.onmessage = onMessage;
    worker.postMessage("uci");    
  }, [worker, isInit, uciOk, onMessage]);

  const value = useMemo(() => ({ 
    isInit,
    isReady,
    evaluated,
    skillLvl,
    initEngine,
    updateEngine,
    startSearch,
    uninit
  }), [isInit, isReady, evaluated, skillLvl, initEngine, updateEngine, startSearch, uninit]);

  return (
    <StockfishProviderContext.Provider value={value}>
      {children}
    </StockfishProviderContext.Provider>
  )
};