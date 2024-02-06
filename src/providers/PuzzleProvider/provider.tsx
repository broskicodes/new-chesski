import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { PuzzleContext } from "./context";
import { Puzzle } from "@/utils/types";
import { useChess } from "../ChessProvider/context";
import { Chess } from "chess.js";


export const PuzzleProvider = ({ children }: PropsWithChildren) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePos, setPuzzlePos] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [moveIdx, setMoveIdx] = useState<number>(-1);
  const [puzzleComplete, setPuzzleComplete] = useState(false);

  const { game, orientation, undo, setPosition, swapOrientation, makeMove } = useChess();

  const setNewPuzzle = useCallback(async (puzzleId: string) => {
    const res = await fetch(`/api/puzzle/${puzzleId}`);
    const data = await res.json();

    const tempGame = new Chess(data.starting_fen);

    if (tempGame.turn() === 'b' && orientation === 'black' ||
        tempGame.turn() === 'w' && orientation === 'white'){
      swapOrientation()
    } 

    setPuzzleComplete(false);
    setPuzzle({
      ...data,
      moves: data.moves.split(" "),
      themes: data.themes.split(" "),
      opening_tags: data.opening_tags.length > 0 ? data.opening_tags?.split(" ") : null
    });  
  }, []);

  const updatePosition = useCallback(() => {
    if (!puzzle) {
      return;
    }

    if (game.fen() !== puzzlePos) {
      const tempGame = new Chess(puzzlePos);
      tempGame.move(puzzle.moves[moveIdx]);

      if (game.fen() !== tempGame.fen()) {
        alert('wrong');
        undo();
      } else {
        setPuzzlePos(game.fen());
        if (moveIdx + 1 < puzzle.moves.length) {
          setMoveIdx(moveIdx + 1);
        } else {
          setPuzzleComplete(true);
        }
      }
    }
  }, [game, undo, puzzle, puzzlePos, moveIdx]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (puzzle) {
      setPosition(puzzle.starting_fen);
      setPuzzlePos(puzzle.starting_fen);
      setMoveIdx(0);
    }
  }, [puzzle]);

  useEffect(() => {
    if(!puzzle) return;

    if (moveIdx >= 0 && moveIdx % 2 === 0) {
      makeMove(puzzle.moves[moveIdx]);
    }
  }, [moveIdx, puzzle]);

  // useEffect(() => { 
  //   if (moveIdx !== 0) return;

    // if (game.turn() === 'b' && orientation === 'white' ||
    //     game.turn() === 'w' && orientation === 'black'){
    //   swapOrientation()
    // } 
  // }, [game, moveIdx, orientation, swapOrientation])

  const value = useMemo(() => ({
    puzzle,
    currPos: puzzlePos,
    puzzleComplete: puzzleComplete,
    setPuzzle: setNewPuzzle,
    updatePosition: updatePosition,
  }), [puzzle, setNewPuzzle, puzzlePos, setPuzzlePos, updatePosition]);

  return (
    <PuzzleContext.Provider value={value}>
      {children}
    </PuzzleContext.Provider>
  );
}