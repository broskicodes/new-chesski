import { Puzzle } from "@/utils/types";
import { createContext, useContext } from "react";

export interface PuzzleProviderContext {
  puzzle: Puzzle | null;
  currPos: string;
  puzzleComplete: boolean;
  moveIdx: number;
  wrongMove: boolean;
  retryPuzzle: () => void;
  updatePosition: () => void;
  setPuzzle: (puzzleId: string) => void;
  clearPuzzle: () => void;
}

export const PuzzleContext = createContext<PuzzleProviderContext>({
  puzzle: null,
  currPos: "",
  puzzleComplete: false,
  moveIdx: -1,
  wrongMove: false,
  retryPuzzle: () => {
    throw new Error("PuzzleProvider not initialized");
  },
  updatePosition: () => {
    throw new Error("PuzzleProvider not initialized");
  },
  setPuzzle: (_puzzleId) => {
    throw new Error("PuzzleProvider not initialized");
  },
  clearPuzzle: () => {
    throw new Error("PuzzleProvider not initialized");
  },
});

export const usePuzzle = () => useContext(PuzzleContext);
