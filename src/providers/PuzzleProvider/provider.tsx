import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PuzzleContext } from "./context";
import { API_URL, Puzzle } from "@/utils/types";
import { useChess } from "../ChessProvider/context";
import { Chess, Square } from "chess.js";
import { useAuth } from "../AuthProvider/context";
import posthog from "posthog-js";

export const PuzzleProvider = ({ children }: PropsWithChildren) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePos, setPuzzlePos] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [hintNum, setHintNum] = useState(1);
  const [moveIdx, setMoveIdx] = useState<number>(-1);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [wrongMove, setWrongMove] = useState(false);

  const { supabase, session } = useAuth();
  const { game, turn, orientation, playContinuation, setPosition, swapOrientation, makeMove, setLastMoveHighlightColor, addHighlightedSquares, addArrows } =
    useChess();

  const hint = useCallback(() => {
    if (!puzzle) return;

    const s = puzzle.moves[moveIdx].slice(0, 2)
    const t = puzzle.moves[moveIdx].slice(2)

    switch (hintNum) {
      case 1: 
        addHighlightedSquares([{ square: s as Square, color: "#A1E8AF" }], true);
        addArrows([], true)
        break;
      case 2:
        addHighlightedSquares([], true);
        addArrows([[s as Square, t as Square]], true)
        break;
    }

    setHintNum(hintNum < 2 ? hintNum + 1 : 2)
  }, [hintNum, puzzle, moveIdx, addHighlightedSquares, addArrows])

  const retryPuzzle = useCallback(() => {
    playContinuation(puzzle?.moves.slice(0, moveIdx)!, true, puzzle?.starting_fen);
    setWrongMove(false)
  }, [playContinuation, moveIdx, puzzle]);

  const restartPuzzle = useCallback(() => {
    if (!puzzle) return;

    setPuzzleComplete(false);
    setPosition(puzzle.starting_fen);
    setPuzzlePos(puzzle.starting_fen);
    setMoveIdx(0);

  }, [setPosition, puzzle])

  const clearPuzzle = useCallback(() => {
    setPuzzle(null);
  }, []);

  const setNewPuzzle = useCallback(
    async (puzzleId: string) => {
      const res = await fetch(`${API_URL}/puzzles/${puzzleId}`);
      const data = await res.json();

      const tempGame = new Chess(data.starting_fen);

      if (
        (tempGame.turn() === "b" && orientation === "black") ||
        (tempGame.turn() === "w" && orientation === "white")
      ) {
        swapOrientation();
      }

      setPuzzleComplete(false);
      setPuzzle({
        ...data,
        moves: data.moves.split(" "),
        themes: data.themes.split(" "),
        opening_tags:
          data.opening_tags.length > 0 ? data.opening_tags?.split(" ") : null,
      });
    },
    [swapOrientation, orientation],
  );

  const updatePosition = useCallback(() => {
    if (!puzzle || moveIdx < 0) {
      return;
    }

    if (game.fen() !== puzzlePos) {
      const tempGame = new Chess(puzzlePos);
      tempGame.move(puzzle.moves[moveIdx]);

      if (game.fen() !== tempGame.fen()) {
        setWrongMove(true);
        setLastMoveHighlightColor("#E45B4F")
        // undo();
      } else {
        setPuzzlePos(game.fen());
        if (turn !== orientation) {
          setLastMoveHighlightColor("#33C57D")
        }
        if (moveIdx + 1 < puzzle.moves.length) {
          setMoveIdx(moveIdx + 1);
        } else {
          setPuzzleComplete(true);
        }
      }
    }
  }, [game, puzzle, puzzlePos, moveIdx, turn, orientation, setLastMoveHighlightColor]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

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

  useEffect(() => {
    if (!puzzle) return;
    setHintNum(1)

    if (moveIdx >= 0 && moveIdx % 2 === 0) {
      setTimeout(() => {
        makeMove(puzzle.moves[moveIdx]);
      }, 1000);
    }
  }, [moveIdx, puzzle, makeMove, setLastMoveHighlightColor]);

  useEffect(() => {
    if (!session || !supabase) return;

    (async () => {
      if (puzzleComplete) {
        posthog.capture("puzzle_complete")
        const {} = await supabase.from("completed_puzzles")
          .insert({
            puzzle_id: puzzle?.id,
            user_id: session.id,
          });
      }
    })()
  }, [puzzleComplete, supabase, session, puzzle])

  // useEffect(() => {
  //   if (moveIdx !== 0) return;

  // if (game.turn() === 'b' && orientation === 'white' ||
  //     game.turn() === 'w' && orientation === 'black'){
  //   swapOrientation()
  // }
  // }, [game, moveIdx, orientation, swapOrientation])

  const value = useMemo(
    () => ({
      puzzle,
      currPos: puzzlePos,
      puzzleComplete,
      moveIdx,
      wrongMove,
      hintNum,
      hint,
      restartPuzzle,
      retryPuzzle,
      setPuzzle: setNewPuzzle,
      updatePosition: updatePosition,
      clearPuzzle: clearPuzzle,
    }),
    [
      puzzle,
      puzzleComplete,
      puzzlePos,
      moveIdx,
      wrongMove,
      hintNum,
      hint,
      restartPuzzle,
      retryPuzzle,
      setNewPuzzle,
      updatePosition,
      clearPuzzle,
    ],
  );

  return (
    <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>
  );
};
