import { createContext, useContext, useState } from "react";

export interface PositionEval {
  evaluation: number;
  evaledFen: string;
  mate: boolean;
  bestMove: string;
  pv: string[];
}

export enum MoveQuality {
  Best = "Best",
  Good = "Good",
  Book = "Book",
  Inaccuracy = "Inaccuracy",
  Mistake = "Mistake",
  Blunder = "Blunder",
}

export interface EvaluationContext {
  evals: PositionEval[];
  popEvals: (num: number) => PositionEval[];
  clearEvaluations: () => void;
  evaluateMoveQuality: (
    prevPosition: PositionEval,
    currentPosition: PositionEval,
    playedMove: string
  ) => MoveQuality | null;
}

export const EvaluationContext = createContext<EvaluationContext>({
  evals: [],
  popEvals: (_num) => {
    throw new Error("EvaluationProvider not initialized");
  },
  clearEvaluations: () => {
    throw new Error("EvaluationProvider not initialized");
  },
  evaluateMoveQuality: (
    _prevPosition,
    _currentPosition,
  ) => {
    throw new Error("EvaluationProvider not initialized");
  }
});

export const useEvaluation = () => useContext(EvaluationContext);
