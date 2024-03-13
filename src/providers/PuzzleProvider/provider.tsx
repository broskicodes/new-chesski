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

  const clearPuzzle = useCallback(() => {
    setPuzzle(null);
  }, []);

  const setNewPuzzle = useCallback(async (puzzleId: string) => {
    const res = await fetch(`/api/puzzle/${puzzleId}`);
    const { puzzle, description } = await res.json();

    const tempGame = new Chess(puzzle.starting_fen);

    if (tempGame.turn() === 'b' && orientation === 'black' ||
        tempGame.turn() === 'w' && orientation === 'white'){
      swapOrientation()
    } 

    setPuzzleComplete(false);
    setPuzzle({
      ...puzzle,
      moves: puzzle.moves.split(" "),
      themes: puzzle.themes.split(" "),
      opening_tags: puzzle.opening_tags.length > 0 ? puzzle.opening_tags?.split(" ") : null,
      description: description
    });  
  }, [swapOrientation, orientation]);

  const updatePosition = useCallback(() => {
    if (!puzzle || moveIdx < 0) {
      return;
    }

    if (game.fen() !== puzzlePos) {
      const tempGame = new Chess(puzzlePos);
      tempGame.move(puzzle.moves[moveIdx]);

      if (game.fen() !== tempGame.fen()) {
        // alert('wrong');
        // undo();
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

  const checkMove = useCallback(() => {
    if (!puzzle || moveIdx < 0) {
      return false;
    }
    
    const tempGame = new Chess(puzzlePos);
    console.log(puzzlePos)
    tempGame.move(puzzle.moves[moveIdx]);

    const correct = game.fen() === tempGame.fen();

    if (correct) {
      setPuzzlePos(game.fen());
      
      if (moveIdx + 1 < puzzle.moves.length) {
        setMoveIdx(moveIdx + 1);
      } else {
        setPuzzleComplete(true);
      }
    }

    return correct;
  }, [puzzle, puzzlePos, moveIdx, game]);

  const playNextMove = useCallback(() => {
    if (!puzzle || moveIdx < 0 || puzzleComplete) {
      return;
    }
    
    if (moveIdx >= 0 && moveIdx % 2 === 0) {
      const tempGame = new Chess(game.fen());
      tempGame.move(puzzle.moves[moveIdx]);

      makeMove(puzzle.moves[moveIdx]);
      setPuzzlePos(tempGame.fen());
      
      if (moveIdx + 1 < puzzle.moves.length) {
        setMoveIdx(moveIdx + 1);
      } else {
        setPuzzleComplete(true);
      }
    }
  }, [makeMove, game, puzzle, moveIdx, puzzleComplete]);

  // useEffect(() => {
  //   updatePosition();
  // }, [updatePosition]);

  useEffect(() => {
    if (puzzle) {
      setPosition(puzzle.starting_fen);
      setPuzzlePos(puzzle.starting_fen);
      setMoveIdx(0);
    } else {
      setPuzzlePos("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      setMoveIdx(-1);
      setPuzzleComplete(false);
    }
  }, [puzzle, setPosition]);

  // useEffect(() => {
  //   if(!puzzle) return;

  //   if (moveIdx >= 0 && moveIdx % 2 === 0) {
  //     setTimeout(() => {
  //       makeMove(puzzle.moves[moveIdx]);
  //     }, 1000)
  //   }
  // }, [moveIdx, puzzle, makeMove]);

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
    moveIdx,
    setPuzzle: setNewPuzzle,
    playNextMove,
    checkMove: checkMove,
    updatePosition: updatePosition,
    clearPuzzle: clearPuzzle
  }), [puzzle, puzzleComplete, puzzlePos, moveIdx, setNewPuzzle, playNextMove, checkMove, updatePosition, clearPuzzle, ]);

  return (
    <PuzzleContext.Provider value={value}>
      {children}
    </PuzzleContext.Provider>
  );
}