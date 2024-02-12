import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { StockfishProviderContext } from "./context";
import { SkillLevel, SkillLevelMap } from "@/utils/types";
import { useChess } from "../ChessProvider/context";

const MAX_DEPTH = 12;

export const StockfishProvider = ({ children }: PropsWithChildren) => {
  const [isInit, setIsInit] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Beginner);
  const [cp, setCp] = useState<number>(0);
  const [evaluated, setEvaluated] = useState(false);

  const worker = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    return new Worker("/nmrugg_stockfish_js/stockfish-nnue-16.js");
  }, []);

   const { game, turn, orientation, makeMove } = useChess();

  const onMessage = useCallback((event: MessageEvent<string>) => {
    if (!worker) return;

    // console.log("stockfish message", event.data);
    if (event.data === "uciok") {
      worker.postMessage(`setoption name Skill Level value ${20}`);
      worker.postMessage(
        `setoption name UCI_LimitStrength value ${true}`,
      );
      worker.postMessage(
        `setoption name UCI_ELO value ${SkillLevelMap[skillLvl][1]}`,
      );
      worker.postMessage("ucinewgame");
      worker.postMessage("isready");
      setIsInit(true);
    } else if (event.data === "readyok") {
      setIsReady(true);
    } else if (event.data.includes("multipv")) {
      const res = event.data.split("cp ")[1];
      const cp = parseInt(res.split(" ")[0]);
      
      // console.log("cp", cp);
      setCp(cp);
    } else if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      setIsSearching(false);
      setBestMove(bestMove);
      setEvaluated(true);

      if (turn !== orientation) {
        makeMove(bestMove);
      }
    }
  }, [worker, orientation, skillLvl, turn, makeMove]);

  const initEngine = useCallback((skillLvl?: SkillLevel) => {
    if (!worker) {
      console.log("no worker");
      return;
    }

    skillLvl && setSkillLvl(skillLvl);
  }, [worker]);

  const startSearch = useCallback(() => {
    if (!worker || isSearching || !isReady || gameOver) {
      return;
    }
        
    setEvaluated(false);
    setIsSearching(true);
    
    worker.onmessage = onMessage;

    const moves = game.history().join(" ");
    worker.postMessage(`position fen ${game.fen()}${moves.length > 0 ? `moves ${moves}` : ""}`);
    worker.postMessage(`go ${
      true ? `movetime ${2000}` : `depth ${MAX_DEPTH}`
    }`);

  }, [isSearching, isReady, worker, game, gameOver, onMessage]);

  const clearBestMove = useCallback(() => {
    setBestMove(null);
  }, []);

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
    cp,
    bestMove,
    evaluated,
    initEngine,
    startSearch,
    clearBestMove
  }), [isInit, bestMove, evaluated, cp, initEngine, startSearch, clearBestMove]);

  return (
    <StockfishProviderContext.Provider value={value}>
      {children}
    </StockfishProviderContext.Provider>
  )
};