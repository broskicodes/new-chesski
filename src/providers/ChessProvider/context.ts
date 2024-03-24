import { Chess, Move, Square } from "chess.js";
import { createContext, useContext } from "react";
import { Arrow } from "react-chessboard/dist/chessboard/types";

export enum Player {
  White = "white",
  Black = "black",
}

export interface SquareHighlight {
  square: Square;
  color: string;
}

export interface ChessProviderContext {
  game: Chess;
  gameOver: boolean;
  turn: Player;
  orientation: Player;
  highlightedSquares: SquareHighlight[];
  highlightedMoves: Move[];
  lastMoveHighlight: [SquareHighlight, SquareHighlight] | null;
  aiLastMoveHighlight: [SquareHighlight, SquareHighlight] | null;
  arrows: Arrow[];
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
  addArrows: (arrows: Arrow[], reset: boolean) => void;
  addHighlightedSquares: (sqrs: SquareHighlight[], reset: boolean) => void;
  resetHighlightedMoves: (moves: Move[]) => void;
  setLastMoveHighlightColor: (color: string) => void;
  playContinuation: (moves: string[], reset: boolean) => void;
}

export const ChessContext = createContext<ChessProviderContext>({
  game: new Chess(),
  gameOver: false,
  turn: Player.White,
  orientation: Player.White,
  highlightedSquares: [],
  highlightedMoves: [],
  arrows: [],
  lastMoveHighlight: null,
  aiLastMoveHighlight: null,
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
  setLastMoveHighlightColor: (_color) => {
    throw new Error("ChessboardProvider not initialized");
  },
  playContinuation: (_movess, _reset) => {
    throw new Error("ChessboardProvider not initialized");
  },
});

export const useChess = () => useContext(ChessContext);
