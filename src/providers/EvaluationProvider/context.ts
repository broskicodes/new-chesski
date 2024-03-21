import { createContext, useContext, useState } from "react";

export interface PositionEval {
  evaluation: number;
  evaledFen: string;
  mate: boolean;
  bestMove: string;
  pv: string[];
}

export interface EvaluationContext {
  evals: PositionEval[];
  clearEvaluations: () => void;
}

export const EvaluationContext = createContext<EvaluationContext>({
  evals: [],
  clearEvaluations: () => {
    throw new Error("EvaluationProvider not initialized");
  },
});

export const useEvaluation = () => useContext(EvaluationContext);

