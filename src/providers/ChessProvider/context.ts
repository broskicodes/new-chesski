import { Chess, Move, Square } from "chess.js";
import { createContext, useContext } from "react";

export enum Player {
  White = "white",
  Black = "black",
}

export interface ChessProviderContext {
  game: Chess;
  turn: Player;
  orientation: Player;
  highlightedSquares: Square[];
  highlightedMoves: Move[];
  arrows: Square[][];
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  makeMove: (
    move:
      | string
      | {
          from: string;
          to: string;
          promotion?: string | undefined;
        },
  ) => Move | null;
  setPosition: (fen: string) => boolean;
  undo: () => Move | null;
  reset: () => void;
  swapOrientation: () => void;
  addArrows: (arrows: Square[][], reset: boolean) => void;
  addHighlightedSquares: (sqrs: Square[], reset: boolean) => void;
  resetHighlightedMoves: (moves: Move[]) => void;
}

export const ChessContext = createContext<ChessProviderContext>({
  game: new Chess(),
  turn: Player.White,
  orientation: Player.White,
  highlightedSquares: [],
  highlightedMoves: [],
  arrows: [],
  onDrop: (_src, _tgt) => {
    throw new Error("ChessboardProvider not initialized");
  },
  makeMove: (_move) => {
    throw new Error("ChessboardProvider not initialized");
  },
  setPosition: (_fen) => {
    throw new Error("ChessboardProvider not initialized");
  },
  undo: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  reset: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  swapOrientation: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  addArrows: (_arrows, _r) => {
    throw new Error("ChessboardProvider not initialized");
  },
  addHighlightedSquares: (_sqrs, _r) => {
    throw new Error("ChessboardProvider not initialized");
  },
  resetHighlightedMoves: (_moves) => {
    throw new Error("ChessboardProvider not initialized");
  },
});

export const useChess = () => useContext(ChessContext);
