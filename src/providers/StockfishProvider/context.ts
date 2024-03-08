import { SkillLevel } from "@/utils/types";
import { createContext, useContext } from "react";

export interface StockfishProviderContext {
  isInit: boolean;
  isReady: boolean;
  skillLvl: SkillLevel;
  evaluated: boolean;
  initEngine: (limitStrength: boolean, skillLvl?: SkillLevel, moveTime?: number) => void;
  updateEngine: (limitStrength: boolean, skillLvl?: SkillLevel, moveTime?: number) => void;
  startSearch: () => boolean;
}

export const StockfishProviderContext = createContext<StockfishProviderContext>({
  isInit: false,
  isReady: false,
  skillLvl: SkillLevel.Beginner,
  evaluated: false,
  initEngine: () => {
    throw new Error("StockfishProvider not initialized");
  },
  updateEngine: () => {
    throw new Error("StockfishProvider not initialized");
  },
  startSearch: () => {
    throw new Error("StockfishProvider not initialized");
  },
});

export const useStockfish = () => useContext(StockfishProviderContext);