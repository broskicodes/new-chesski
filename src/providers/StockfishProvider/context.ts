import { SkillLevel } from "@/utils/types";
import { createContext, useContext } from "react";

export interface Stockfish {
  name: string;
  worker: Worker;
  isReady: boolean;
  isSearching: boolean;
  skillLvl: SkillLevel;
  // numPVs: number;
  moveTime?: number;
  bestMove: string | null;
  // pvs: { [key: number]: PV } | null;
}

export interface StockfishProviderContext {
  stockfish: Stockfish | null;
  initEngine: (skillLvl: SkillLevel) => void;
  startSearch: () => void;
}

export const StockfishProviderContext = createContext<StockfishProviderContext>({
  stockfish: null,
  initEngine: () => {
    throw new Error("StockfishProvider not initialized");
  },
  startSearch: () => {
    throw new Error("StockfishProvider not initialized");
  },
});

export const useStockfish = () => useContext(StockfishProviderContext);