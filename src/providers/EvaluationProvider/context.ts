"use client";

import { createContext, useContext, useState } from "react";
import { Player } from "../ChessProvider/context";

export interface PositionEval {
  evaluation: number;
  evaledFen: string;
  mate: boolean;
  bestMove: string;
  pv: string[];
}

export interface PositionAnal extends PositionEval {
  classification?: Classification;
  opening?: string;
}

export enum Classification {
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
    playedMove: string,
    turn: Player,
  ) => Classification | null;
}

export const EvaluationContext = createContext<EvaluationContext>({
  evals: [],
  popEvals: (_num) => {
    throw new Error("EvaluationProvider not initialized");
  },
  clearEvaluations: () => {
    throw new Error("EvaluationProvider not initialized");
  },
  evaluateMoveQuality: (_prevPosition, _currentPosition) => {
    throw new Error("EvaluationProvider not initialized");
  },
});

export const useEvaluation = () => useContext(EvaluationContext);
