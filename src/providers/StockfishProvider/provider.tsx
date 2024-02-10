import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { Stockfish, StockfishProviderContext } from "./context";
import { SkillLevel, SkillLevelMap } from "@/utils/types";
import { useChess } from "../ChessProvider/context";

const MAX_DEPTH = 12;

export const StockfishProvider = ({ children }: PropsWithChildren) => {
  const [stockfish, setStockfish] = useState<Stockfish | null>(null);
  const [isInit, setIsInit] = useState(false);
  const [gameOver, setGameOver] = useState(false);

   const { game, makeMove } = useChess();

  const onMessage = useCallback((event: MessageEvent<string>) => {
    if (!stockfish) return;

    if (event.data === "uciok") {
      stockfish.worker.postMessage(`setoption name Skill Level value ${20}`);
      stockfish.worker.postMessage(
        `setoption name UCI_LimitStrength value ${true}`,
      );
      stockfish.worker.postMessage(
        `setoption name UCI_ELO value ${SkillLevelMap[stockfish.skillLvl][1]}`,
      );
      stockfish.worker.postMessage("ucinewgame");
      stockfish.worker.postMessage("isready");
      setIsInit(true);
    } else if (event.data === "readyok") {
      setStockfish({ ...stockfish, isReady: true });
    } else if (event.data.startsWith("bestmove")) {
      const bestMove = event.data.split(" ")[1];
      setStockfish({ ...stockfish, isSearching: false, bestMove });
      makeMove(bestMove);
    }
  }, [stockfish, makeMove]);

  const initEngine = useCallback((skillLvl: SkillLevel) => {
    if (stockfish) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }

    const worker = new Worker("/nmrugg_stockfish_js/stockfish-nnue-16.js");

    setStockfish({
      name: "Stockfish",
      worker,
      isReady: false,
      isSearching: false,
      skillLvl,
      bestMove: null,
    });
  }, [stockfish]);

  const startSearch = useCallback(() => {
    if (!stockfish || stockfish.isSearching || !stockfish.isReady || gameOver) {
      return;
    }
        
    setStockfish({ ...stockfish, isSearching: true });

    stockfish.worker.onmessage = onMessage;

    const moves = game.history().join(" ");
    stockfish.worker.postMessage(`position fen ${game.fen()}${moves.length > 0 ? `moves ${moves}` : ""}`);
    stockfish.worker.postMessage(`go ${
      true ? `movetime ${1500}` : `depth ${MAX_DEPTH}`
    }`);

  }, [stockfish, game, gameOver, onMessage]);

  useEffect(() => {
    if (game.isGameOver()) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [game]);

  useEffect(() => {
    if (isInit || !stockfish) {
      return;
    }

    stockfish.worker.onmessage = onMessage;
    stockfish.worker.postMessage("uci");    
  }, [stockfish, isInit, onMessage]);

  const value = useMemo(() => ({ 
    stockfish,
    initEngine,
    startSearch,
  }), [stockfish, initEngine, startSearch]);

  return (
    <StockfishProviderContext.Provider value={value}>
      {children}
    </StockfishProviderContext.Provider>
  )
};