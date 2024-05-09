import { Chess, Move, Piece, Square } from "chess.js";
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
  moveHighlight: [SquareHighlight, SquareHighlight] | null;
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
  doubleUndo: () => Move[];
  reset: () => void;
  swapOrientation: () => void;
  addArrows: (arrows: Arrow[], reset: boolean) => void;
  addHighlightedSquares: (sqrs: SquareHighlight[], reset: boolean) => void;
  resetHighlightedMoves: (moves: Move[]) => void;
  setLastMoveHighlightColor: (color: string) => void;
  playContinuation: (moves: string[], reset: boolean, fen?: string) => boolean;
  addPiece: (piece: Piece, sqr: Square) => boolean;
  removePiece: (sqr: Square) => Piece | null;
  clear: () => void;
  dragPiece: (sSqr: Square, tSqr: Square) => boolean;
  setCastling: (wkc: boolean, wqc: boolean, bkc: boolean, bqc: boolean) => void;
  setTurn: (turn: "w" | "b") => void;
}

export const ChessContext = createContext<ChessProviderContext>({
  game: new Chess(),
  gameOver: false,
  turn: Player.White,
  orientation: Player.White,
  highlightedSquares: [],
  highlightedMoves: [],
  arrows: [],
  moveHighlight: null,
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
  doubleUndo: () => {
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
  playContinuation: (_moves, _reset) => {
    throw new Error("ChessboardProvider not initialized");
  },
  addPiece: (_piece, _sqr) => {
    throw new Error("ChessboardProvider not initialized");
  },
  removePiece: (_sqr) => {
    throw new Error("ChessboardProvider not initialized");
  },
  clear: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  dragPiece: (_ss, _ts) => {
    throw new Error("ChessboardProvider not initialized");
  },
  setCastling: (_wkc, _wqc, _bkc, _bqc)  => {
    throw new Error("ChessboardProvider not initialized");
  },
  setTurn: (_t) => {
    throw new Error("ChessboardProvider not initialized");
  }
});

export const useChess = () => useContext(ChessContext);
