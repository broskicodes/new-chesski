import { SkillLevel } from "@/utils/types";
import { createContext, useContext } from "react";


export interface StockfishProviderContext {
  // stockfish: Stockfish | null;
  isInit: boolean;
  bestMove: string | null;
  cp: number;
  evaluated: boolean;
  initEngine: (skillLvl: SkillLevel) => void;
  startSearch: () => void;
  clearBestMove: () => void;
}

export const StockfishProviderContext = createContext<StockfishProviderContext>({
  // stockfish: null,
  isInit: false,
  bestMove: null,
  cp: 0,
  evaluated: false,
  initEngine: () => {
    throw new Error("StockfishProvider not initialized");
  },
  startSearch: () => {
    throw new Error("StockfishProvider not initialized");
  },
  clearBestMove: () => {
    throw new Error("StockfishProvider not initialized");
  },
});

export const useStockfish = () => useContext(StockfishProviderContext);