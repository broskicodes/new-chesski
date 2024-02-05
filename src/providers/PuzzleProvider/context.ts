import { Puzzle } from "@/utils/types";
import { createContext, useContext } from "react";

export interface PuzzleProviderContext {
  puzzle: Puzzle | null;
  currPos: string;
  puzzleComplete: boolean;
  updatePosition: () => void;
  setPuzzle: (puzzleId: string) => void;
}

export const PuzzleContext = createContext<PuzzleProviderContext>({
  puzzle: null,
  currPos: "",
  puzzleComplete: false,
  updatePosition: () => {
    throw new Error("PuzzleProvider not initialized");
  },
  setPuzzle: (_puzzleId) => {
    throw new Error("PuzzleProvider not initialized");
  },
});

export const usePuzzle = () => useContext(PuzzleContext);

