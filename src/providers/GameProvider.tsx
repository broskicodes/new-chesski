import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Player, useChess } from "./ChessProvider/context";
import { useAuth } from "./AuthProvider/context";
import { GameState, STRIPE_LINK } from "@/utils/types";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCoach } from "./CoachProvider/context";
import { Classification, useEvaluation } from "./EvaluationProvider/context";
import { setCurrGameState } from "@/utils/clientHelpers";
import { Move } from "chess.js";
import { useRouter } from "next/navigation";

enum GameResult {
  Win = "win",
  Loss = "loss",
  Draw = "draw",
  Resign = "resign",
}

enum DrawType {
  Stalemate = 0,
  Repetition = 1,
  MoveRule = 2,
  InsufficientMaterial = 3,
}

export interface GameProviderContext {
  gameId: string | null;
  startingPos: string;
  userColor: string;
  complete: boolean;
  moves: string[];
  moveIdx: number;
  newGame: () => Promise<void>;
  resign: () => Promise<void>;
  clearGame: () => void;
  nextMove: () => void;
  prevMove: () => void;
}

export const GameContext = createContext<GameProviderContext>({
  gameId: null,
  startingPos: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  userColor: "white",
  complete: false,
  moves: [],
  moveIdx: 0,
  newGame: () => {
    throw new Error("GameProvider not initialized");
  },
  resign: () => {
    throw new Error("GameProvider not initialized");
  },
  clearGame: () => {
    throw new Error("GameProvider not initialized");
  },
  nextMove: () => {
    throw new Error("GameProvider not initialized");
  },
  prevMove: () => {
    throw new Error("GameProvider not initialized");
  },
});

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [id, setId] = useState<string | null>(null);
  const [startingPos, setStartingPos] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [userColor, setUserColor] = useState<string>("white");
  const [complete, setComplete] = useState<boolean>(false);
  const [moves, setMoves] = useState<string[]>([]);
  const [moveIdx, setMoveIdx] = useState(0);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [drawType, setDrawType] = useState<DrawType | null>(null);

  const [qualMap, setQualMap] = useState<
    { [key in Classification]: number } | null
  >(null);

  const { clearEvaluations, evaluateMoveQuality, evals } = useEvaluation();
  const { clearGameMessages } = useCoach();
  const { game, orientation, turn, gameOver, reset, undo, makeMove } =
    useChess();
  const { session, supabase, signInWithOAuth } = useAuth();
  const router = useRouter();

  const gameModalTriggerRef = useRef<HTMLButtonElement>(null);

  const newGame = useCallback(async () => {
    if (session && supabase) {
      const { data, error } = await supabase
        .from("games")
        .insert({
          starting_pos: game.fen(),
          user_id: session.id,
          user_color: orientation,
        })
        .select("id");

      // console.log(data, error);

      if (data && data[0]) {
        setId(data[0].id);
        setUserColor(orientation);
        setStartingPos(game.fen());

        setCurrGameState({
          id: data[0].id,
          startingPos: game.fen(),
          complete: false,
        });
      }
    } else {
      const newId = Math.random().toString(36).substring(2, 15);

      setId(newId);
      setUserColor(orientation);
      setStartingPos(game.fen());

      setCurrGameState({
        id: newId,
        startingPos: game.fen(),
        complete: false,
      });
    }
  }, [game, orientation, session, supabase]);

  // const classifyMoves = useCallback((moveHistory: string[]) => {
  //   const hits = evals.slice(1)
  //     .map((ev, i) => {
  //       const qual = evaluateMoveQuality(evals[i], ev, moveHistory[i], i % 2 === 0 ? Player.White : Player.Black);

  //       console.log(qual, moveHistory[i])
  //       return qual;
  //     })
  //     .filter((_, i) => orientation === "white" ? i % 2 === 0 : i % 2 === 1);

  //   setQualMap((_) => {
  //     const prev = {
  //       [Classification.Best]: 0,
  //       [Classification.Good]: 0,
  //       [Classification.Book]: 0,
  //       [Classification.Inaccuracy]: 0,
  //       [Classification.Mistake]: 0,
  //       [Classification.Blunder]: 0,
  //     }

  //     hits.forEach((qual) => {
  //       console.log(prev[qual!], qual)
  //       prev[qual!] += 1;
  //     })

  //     // console.log(prev)
  //     return prev;
  //   })

  // console.log(hits);
  // }, [orientation, evals, evaluateMoveQuality]);

  const resign = useCallback(async () => {
    gameModalTriggerRef.current?.click();
    setGameResult(GameResult.Resign);

    if (session && supabase) {
      const { data, error } = await supabase
        .from("games")
        .update({
          finished_at: new Date(),
          result: orientation === "white" ? "0-1" : "1-0",
          moves: game.history(),
        })
        .eq("id", id)
        .select();

      // console.log(data, error);
    }

    setComplete(true);
    setMoves(game.history());
    setMoveIdx(game.history().length - 1);

    setCurrGameState({
      complete: true,
    });
  }, [game, orientation, id, session, supabase]);

  const clearGame = useCallback(() => {
    setId(null);
    setGameResult(null);
    setDrawType(null);
    setComplete(false);
    setMoves([]);
    setMoveIdx(0);

    setCurrGameState({
      id: "",
      startingPos: "",
      complete: false,
    });
  }, []);

  const nextMove = useCallback(() => {
    if (makeMove(moves[moveIdx + 1])) {
      setMoveIdx(moveIdx + 1);
    }
  }, [makeMove, moveIdx, moves]);

  const prevMove = useCallback(() => {
    if (undo()) {
      setMoveIdx(moveIdx - 1);
    }
  }, [undo, moveIdx]);

  const value: GameProviderContext = useMemo(
    () => ({
      gameId: id,
      startingPos,
      userColor,
      complete,
      moves,
      moveIdx,
      newGame,
      resign,
      clearGame,
      nextMove,
      prevMove,
    }),
    [
      id,
      startingPos,
      userColor,
      complete,
      moves,
      moveIdx,
      newGame,
      clearGame,
      resign,
      nextMove,
      prevMove,
    ],
  );

  useEffect(() => {
    const gameState: GameState | null = JSON.parse(
      localStorage.getItem("currGameState")!,
    );

    if (gameState) {
      setId(gameState.id && gameState.id.length > 0 ? gameState.id : null);
      setStartingPos(
        gameState.startingPos && gameState.startingPos.length > 0
          ? gameState.startingPos
          : "",
      );
      setComplete(gameState.complete);
    }
  }, []);

  useEffect(() => {
    if (gameOver && game.isGameOver()) {
      gameModalTriggerRef.current?.click();

      setComplete(true);
      setMoves(game.history());
      setMoveIdx(game.history().length - 1);

      if (game.isCheckmate()) {
        if (turn === orientation) {
          setGameResult(GameResult.Loss);
        } else {
          setGameResult(GameResult.Win);
        }
      } else if (game.isDraw()) {
        setGameResult(GameResult.Draw);

        if (game.isStalemate()) {
          setDrawType(DrawType.Stalemate);
        } else if (game.isThreefoldRepetition()) {
          setDrawType(DrawType.Repetition);
        } else if (game.isInsufficientMaterial()) {
          setDrawType(DrawType.InsufficientMaterial);
        }
      }
    }
  }, [game, gameOver, turn, orientation, evals]);

  useEffect(() => {
    if (!gameOver || !gameResult || !id || moves.length < 1) return;

    let result: string;

    switch (gameResult) {
      case GameResult.Draw:
        result = "1/2-1/2";
        break;
      case GameResult.Resign:
      case GameResult.Loss:
        result = orientation === "white" ? "0-1" : "1-0";
        break;
      case GameResult.Win:
        result = orientation === "white" ? "1-0" : "0-1";
        break;
    }

    (async () => {
      if (session && supabase) {
        const { data, error } = await supabase
          .from("games")
          .update({
            finished_at: new Date(),
            result: result,
            moves: moves,
          })
          .eq("id", id)
          .select();

        // console.log(data, error);
      }
    })();
  }, [gameOver, gameResult, orientation, id, session, supabase, moves]);

  return (
    <GameContext.Provider value={value}>
      <Dialog>
        <DialogTrigger ref={gameModalTriggerRef} className="hidden" />
        <DialogContent>
          <DialogHeader className="flex flex-col items-center space-y-0">
            <DialogTitle className="text-2xl">Game Over</DialogTitle>
            <DialogDescription>
              {(() => {
                let desc: string;

                switch (gameResult) {
                  case GameResult.Win:
                    desc = "Congradulations, you won!";
                    break;
                  case GameResult.Loss:
                    desc = "You lost. Better luck next time!";
                    break;
                  case GameResult.Resign:
                    desc = "You resigned.";
                    break;
                  case GameResult.Draw:
                    switch (drawType) {
                      case DrawType.Stalemate:
                        desc = "Draw. The game ended in stalemate.";
                        break;
                      case DrawType.Repetition:
                        desc = "Draw by threefold repetition.";
                        break;
                      case DrawType.InsufficientMaterial:
                        desc = "Draw, insufficient material";
                        break;
                      default:
                        desc = "The game ended in a draw.";
                    }
                    break;
                  default:
                    desc = "The game came to a magical ending!";
                }

                return desc;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div>
            {qualMap &&
              Object.keys(qualMap).map((row) => {
                return (
                  <p key={row}>
                    {row} {                  
                      // @ts-ignore
                      qualMap[row]
                    }
                  </p>
                );
              })}
          </div>
          {session && (
            <div className="flex flex-col space-y-2 mt-2">
              <DialogClose className="w-full">
                <Button
                  className="w-full font-bold text-lg py-4"
                  onClick={() => {
                    router.push(`/analysis?gameId=${id}`);
                  }}
                >
                  Analyze Game
                </Button>
              </DialogClose>
              <DialogClose className="w-full">
                <Button
                  className="w-full font-semibold text-lg py-4"
                  variant="outline"
                  onClick={() => {
                    reset();
                    clearEvaluations();
                    clearGameMessages();
                    clearGame();
                  }}
                >
                  Play Again
                </Button>
              </DialogClose>
            </div>
          )}
          {!session && (
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col ">
                <DialogTitle>Learn something?</DialogTitle>
                <DialogDescription className="text-black">
                  Sign up to get more out of Chesski!
                </DialogDescription>
              </div>
              <Button onClick={() => signInWithOAuth()}>
                Sign in with Google
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {children}
    </GameContext.Provider>
  );
};
