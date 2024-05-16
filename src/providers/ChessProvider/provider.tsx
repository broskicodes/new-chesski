import { Chess, Move, Piece } from "chess.js";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChessContext,
  ChessProviderContext,
  Player,
  SquareHighlight,
} from "./context";
import { Arrow, Square } from "react-chessboard/dist/chessboard/types";
import posthog from "posthog-js";
import { setCurrGameState } from "@/utils/clientHelpers";

export const ChessProvider = ({ children }: PropsWithChildren) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [orientation, setOrientation] = useState<Player>(Player.White);
  const [turn, setTurnState] = useState<Player>(Player.White);
  const [highlightedSquares, setHighlightedSquares] = useState<
    SquareHighlight[]
  >([]);
  const [highlightedMoves, setHighlightedMoves] = useState<Move[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<
    [SquareHighlight, SquareHighlight] | null
  >(null);
  const [aiLastMoveHighlight, setAILastMoveHighlight] = useState<
    [SquareHighlight, SquareHighlight] | null
  >(null);
  const [moveHighlight, setMoveHighlight] = useState<
    [SquareHighlight, SquareHighlight] | null
  >(null);

  const makeMove = useCallback(
    (
      move:
        | string
        | {
            from: string;
            to: string;
            promotion?: string | undefined;
          },
    ) => {
      const tempGame = new Chess();
      tempGame.loadPgn(game.pgn());
      try {
        const res = tempGame.move(move);
        if (res) {
          setGame(tempGame);
          setTurnState(turn === Player.White ? Player.Black : Player.White);

          setCurrGameState({ moves: tempGame.history() });

          if (turn === orientation) {
            setLastMoveHighlight([
              { square: res.from, color: "#F9DC5C" },
              { square: res.to, color: "#F9DC5C" },
            ]);
            setAILastMoveHighlight(null);
          } else {
            setAILastMoveHighlight([
              { square: res.from, color: "#F9DC5C" },
              { square: res.to, color: "#F9DC5C" },
            ]);
          }

          setMoveHighlight([
            { square: res.from, color: "#F9DC5C" },
            { square: res.to, color: "#F9DC5C" },
          ]);
        }
        return res;
      } catch (e) {
        return null;
      }
    },
    [game, turn, orientation],
  );

  const setPosition = useCallback((fen: string) => {
    try {
      const tempGame = new Chess(fen);
      setGame(tempGame);
      setTurnState(tempGame.turn() === "w" ? Player.White : Player.Black);
      setAILastMoveHighlight(null);
      setLastMoveHighlight(null);
      setMoveHighlight(null);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const playContinuation = useCallback(
    (moves: string[], reset: boolean = false, fen?: string) => {
      const tempGame = new Chess(fen);
      if (!reset) {
        tempGame.loadPgn(game.pgn());
      }

      for (const move of moves) {
        try {
          tempGame.move(move);
        } catch (e) {
          return false;
        }
      }

      const lastMove = tempGame.history({ verbose: true }).at(-1);
      lastMove &&
        setMoveHighlight([
          { square: lastMove.from, color: "#F9DC5C" },
          { square: lastMove.to, color: "#F9DC5C" },
        ]);

      setGame(tempGame);
      setTurnState(tempGame.turn() === "w" ? Player.White : Player.Black);

      return true;
    },
    [game],
  );

  const undo = useCallback(() => {
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    try {
      const res = tempGame.undo();
      if (res) {
        const lastMove = tempGame.history({ verbose: true }).at(-1);

        setGame(tempGame);
        setTurnState(turn === Player.White ? Player.Black : Player.White);

        setHighlightedMoves([]);
        setHighlightedSquares([]);
        setLastMoveHighlight(null);
        setAILastMoveHighlight(null);
        lastMove &&
          setMoveHighlight([
            { square: lastMove.from, color: "" },
            { square: lastMove.to, color: "" },
          ]);
        !lastMove && setMoveHighlight(null);
        setArrows([]);

        setCurrGameState({ moves: tempGame.history() });
      }
      return res;
    } catch (e) {
      return null;
    }
  }, [game, turn]);

  const doubleUndo = useCallback(() => {
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
    try {
      const res = tempGame.undo();
      if (res) {
        const res2 = tempGame.undo();

        setGame(tempGame);

        setHighlightedMoves([]);
        setHighlightedSquares([]);
        setLastMoveHighlight(null);
        setAILastMoveHighlight(null);
        setArrows([]);

        setCurrGameState({ moves: tempGame.history() });

        if (!res2) {
          setTurnState(turn === Player.White ? Player.Black : Player.White);
          return [res];
        }

        return [res, res2];
      }
      return [];
    } catch (e) {
      return [];
    }
  }, [game, turn]);

  const reset = useCallback(() => {
    const tempGame = new Chess();
    setGame(tempGame);
    setTurnState(Player.White);

    setHighlightedMoves([]);
    setHighlightedSquares([]);
    setMoveHighlight(null);
    setLastMoveHighlight(null);
    setAILastMoveHighlight(null);
    setArrows([]);

    setCurrGameState({ moves: tempGame.history() });
  }, []);

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      const move = makeMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });

      if (!move) return false;

      setArrows([]);
      setHighlightedMoves([]);

      return true;
    },
    [makeMove],
  );

  const onDropVersus = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (orientation === turn) {
        return onDrop(sourceSquare, targetSquare);
      }

      return false;
    },
    [onDrop, turn, orientation],
  );

  const swapOrientation = useCallback(() => {
    const newOrientation =
      orientation === Player.White ? Player.Black : Player.White;
    setOrientation(newOrientation);
    setCurrGameState({ orientation: newOrientation });
  }, [orientation]);

  const addArrows = useCallback(
    (newArrows: Arrow[], reset: boolean) => {
      const newArr: Arrow[] = reset ? newArrows : [...arrows, ...newArrows];
      setArrows(newArr);
    },
    [arrows],
  );

  const addHighlightedSquares = useCallback(
    (newSqrs: SquareHighlight[], reset: boolean) => {
      const newArr = reset ? newSqrs : [...highlightedSquares, ...newSqrs];
      setHighlightedSquares(newArr);
    },
    [highlightedSquares],
  );

  const resetHighlightedMoves = useCallback((moves: Move[]) => {
    setHighlightedMoves(moves);
  }, []);

  const setLastMoveHighlightColor = useCallback((color: string) => {
    setLastMoveHighlight((prev) => {
      if (!prev) {
        return null;
      }

      return [
        { ...prev[0], color },
        { ...prev[1], color },
      ];
    });

    setMoveHighlight((prev) => {
      if (!prev) {
        return null;
      }

      return [
        { ...prev[0], color },
        { ...prev[1], color },
      ];
    });
  }, []);

  const removePiece = useCallback((sqr: Square) => {
    const tempGame = new Chess();
    tempGame.load(game.fen(), { skipValidation: true })
    const res = tempGame.remove(sqr);

    setGame(tempGame);
    return res;
  }, [game]);

  const addPiece = useCallback((piece: Piece, sqr: Square) => {
    const tempGame = new Chess();
    tempGame.load(game.fen(), { skipValidation: true })
    const res = tempGame.put(piece, sqr);

    setGame(tempGame);
    return res;
  }, [game]);

  const clear = useCallback(() => {
    const tempGame = new Chess();
    tempGame.clear();

    setGame(tempGame);
  }, []);

  const dragPiece = useCallback((sSqr: Square, tSqr: Square) => {
    const tempGame = new Chess();
    tempGame.load(game.fen(), { skipValidation: true })
    const res = tempGame.remove(sSqr);
    if (res) {
      const r = tempGame.put(res, tSqr);
      setGame(tempGame);
      return r;
    }

    return false;
  }, [game]);

  const setCastling = useCallback((wkc: boolean, wqc: boolean, bkc: boolean, bqc: boolean) => {
    const tempGame = new Chess();
    tempGame.loadPgn(game.pgn());
  
    tempGame.setCastlingRights("w", { "k": wkc, "q": wqc });
    tempGame.setCastlingRights("b", { "k": bkc, "q": bqc });

    setGame(new Chess(tempGame.fen()));
  }, [game]);

  const setTurn = useCallback((turn: "w" | "b") => {  
    const newFen = game.fen().split(" ");
    newFen[1] = turn;

    setTurnState(turn === "w" ? Player.White : Player.Black);
    setGame(new Chess(newFen.join(" ")))
  }, [game]);

  useEffect(() => {
    setGameOver(game.isGameOver());
  }, [game]);

  useEffect(() => {
    if (gameOver) {
      posthog.capture("game_complete");
    }
  }, [gameOver]);

  const value: ChessProviderContext = useMemo(
    () => ({
      game,
      gameOver,
      turn,
      orientation,
      arrows,
      highlightedSquares,
      highlightedMoves,
      lastMoveHighlight,
      aiLastMoveHighlight,
      moveHighlight,
      removePiece,
      addPiece,
      clear,
      dragPiece,
      setCastling,
      setTurn,
      makeMove,
      playContinuation,
      setPosition,
      onDrop,
      onDropVersus,
      undo,
      doubleUndo,
      reset,
      swapOrientation,
      addArrows,
      addHighlightedSquares,
      resetHighlightedMoves,
      setLastMoveHighlightColor,
    }),
    [
      game,
      gameOver,
      turn,
      orientation,
      arrows,
      highlightedMoves,
      highlightedSquares,
      lastMoveHighlight,
      aiLastMoveHighlight,
      moveHighlight,
      makeMove,
      playContinuation,
      setPosition,
      onDrop,
      onDropVersus,
      undo,
      doubleUndo,
      reset,
      swapOrientation,
      addArrows,
      addHighlightedSquares,
      resetHighlightedMoves,
      setLastMoveHighlightColor,
      removePiece,
      addPiece,
      clear,
      dragPiece,
      setCastling,
      setTurn
    ],
  );

  return (
    <ChessContext.Provider value={value}>{children}</ChessContext.Provider>
  );
};
