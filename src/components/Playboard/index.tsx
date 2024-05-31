import { useChess } from "@/providers/ChessProvider/context";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chessboard as ReactChessboad } from "react-chessboard";
import {
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import posthog from "posthog-js";
import {
  Classification,
  PositionEval,
  useEvaluation,
} from "@/providers/EvaluationProvider/context";
import { Chess, Color, Piece, PieceSymbol } from "chess.js";
import { Piece as Pc } from "react-chessboard/dist/chessboard/types"
// import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";
import { useCoach } from "@/providers/CoachProvider/context";
import { setLocalMessages } from "@/utils/clientHelpers";
import { Message } from "ai";
import { useAuth } from "@/providers/AuthProvider/context";
import { useSetup } from "@/providers/SetupProvider";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

export const Chessboard = () => {
  const [boardWidth, setBoardWidth] = useState(1);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pieceDropSquares, setPieceDropSquares] = useState<
    [Square, Square] | null
  >(null);
  const [movesMade, setMovesMade] = useState(0);
  const [mult, setMult] = useState(1);

  const { evals, evaluateMoveQuality } = useEvaluation();
  const { toast } = useToast();
  const { session, supabase, signInWithOAuth } = useAuth();
  const { addGameMessage, gameMessages } = useCoach();
  const { settingUp, removing } = useSetup();
  const {
    game,
    makeMove,
    onDrop,
    addHighlightedSquares,
    setLastMoveHighlightColor,
    arrows,
    turn,
    orientation,
    aiLastMoveHighlight,
    highlightedMoves,
    highlightedSquares,
    lastMoveHighlight,
    resetHighlightedMoves,
    addArrows,
    dragPiece,
    addPiece,
    removePiece,
    clear
  } = useChess();

  // const modalTriggerRef = useRef<HTMLButtonElement>(null);

  // const updateStreak = useCallback(async () => {
  //   if (!supabase || !session) {
  //     return;
  //   }

  //   await fetch("/api/streaks/update", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       id: session.id,
  //     }),
  //   });
  // }, [supabase, session]);

  useEffect(() => {
    if (evals.length >= 2) {
      const prev = evals.at(-2);
      const curr = evals.at(-1);

      if (game.fen() !== curr?.evaledFen && turn === orientation) {
        const tempGame = new Chess();
        tempGame.loadPgn(`[FEN "${game.history({ verbose: true }).at(0)?.before}"]\n\n${game.history().slice(0, -2).join(" ")}`);
        try {
          tempGame.move(prev?.bestMove!);

          const moveStrength = evaluateMoveQuality(
            prev!,
            curr!,
            game.history().at(-2)!,
            turn,
          );

          if (!moveStrength) {
            return;
          }

          let color: string;
          let msg: string;
          switch (moveStrength) {
            case Classification.Book:
              color = "#9D695A";
              msg = "Book Move";
              break;
            case Classification.Best:
              color = "#E64DFF";
              msg = "Best Move";
              break;
            case Classification.Good:
              color = "#33C57D";
              msg = "Good Move";
              break;
            case Classification.Inaccuracy:
              color = "#F6C333";
              msg = "Inaccurate";
              break;
            case Classification.Mistake:
              color = "#F4A153";
              msg = "Mistake";
              break;
            case Classification.Blunder:
              color = "#E45B4F";
              msg = "Blunder";
              break;
            default:
              color = "#F7A28D";
              msg = "Trash";
          }
          setLastMoveHighlightColor(color);

          const gameMsg: ChatCompletionMessage = {
            role: "assistant",
            content: `"""You played ${game.history().at(-2)}${msg === "Book Move" ? ", its a book move." : msg !== "Best Move" ? `. The best move was ${tempGame.history().at(-1)}` : ", it was the best move."}"""`,
          };

          addGameMessage(gameMsg);
          setLocalMessages([gameMsg], false);
        } catch (e) {
          // console.error(e);
          return;
        }
      }
    }
  }, [evals, setLastMoveHighlightColor, game, turn, orientation]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBoardWidth(window.innerWidth > 480 ? 480 : window.innerWidth);
        return;
      } else if (window.innerWidth < 1024) {
        setBoardWidth(480);
        return;
      }
      setBoardWidth(window.innerHeight - 196);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <ReactChessboad
        boardWidth={boardWidth}
        position={game.fen()}
        onPieceDrop={(sSqr: Square, tSqr: Square, pc: Pc) => {
          if (settingUp) {
            // @ts-ignore
            if (sSqr === "null") {
              const piece: Piece = {
                color: pc[0] as Color,
                type: pc[1].toLowerCase() as PieceSymbol
              } 

              return addPiece(piece, tSqr);
            } else {
              return dragPiece(sSqr, tSqr);
            }
          } else {
            const res = onDrop(sSqr, tSqr);

            if (res && !settingUp) {
              setMovesMade(movesMade + 1);
              posthog.capture("user_played_move");
              // updateStreak();
            }

            return res;
          }
        }}
        boardOrientation={orientation}
        customArrows={arrows}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog && !settingUp}
        onPromotionCheck={settingUp ? undefined : (sourceSquare, targetSquare, piece) => {
          setPieceDropSquares([sourceSquare, targetSquare]);

          return (
            ((piece === "wP" &&
              sourceSquare[1] === "7" &&
              targetSquare[1] === "8") ||
              (piece === "bP" &&
                sourceSquare[1] === "2" &&
                targetSquare[1] === "1")) &&
            Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <=
              1
          );
        }}
        onPromotionPieceSelect={settingUp ? undefined : (piece: PromotionPieceOption | undefined) => {
          if (highlightedMoves.length > 0) {
            if (piece) {
              makeMove({
                from: highlightedMoves[0].from,
                to: moveTo!,
                promotion: piece[1].toLowerCase() ?? "q",
              });
            }
          } else {
            makeMove({
              from: pieceDropSquares![0],
              to: pieceDropSquares![1],
              promotion: piece![1].toLowerCase() ?? "q",
            });
            setPieceDropSquares(null);
          }

          resetHighlightedMoves([]);
          addHighlightedSquares([], true);
          addArrows([], true);
          setShowPromotionDialog(false);
          posthog.capture("user_played_move");
          // updateStreak();

          return true;
        }}
        onSquareRightClick={(sqr) => {
          if (settingUp) {
            removePiece(sqr);
          } else {
            addHighlightedSquares([{ square: sqr, color: "#F7A28D" }], false);
          }
        }}
        onSquareClick={settingUp ? (sqr) => { if (removing) { removePiece(sqr); } } : (sqr) => {
          let resetHighlights = true;
          if (highlightedMoves.length > 0) {
            setMoveTo(sqr);

            const moves = game.moves({
              verbose: true,
              square: highlightedMoves[0].from,
            });

            const foundMove = moves.find(
              (m) => m.from === highlightedMoves[0].from && m.to === sqr,
            );

            if (
              foundMove &&
              foundMove.to === sqr &&
              ((foundMove.color === "w" &&
                foundMove.piece === "p" &&
                sqr[1] === "8") ||
                (foundMove.color === "b" &&
                  foundMove.piece === "p" &&
                  sqr[1] === "1"))
            ) {
              setShowPromotionDialog(true);
              return;
            }

            if (
              makeMove({
                from: highlightedMoves[0].from,
                to: sqr,
                promotion: "q",
              })
            ) {
              if (!settingUp) {
                setMovesMade(movesMade + 1);
                posthog.capture("user_played_move");
                // updateStreak();
              }
              // addHighlightedSquares([{ square: sqr, color: "#000000" }], true);
              // console.log(evals.at(-1)?.bestMove)

              // resetHighlights = false;
            }
          }

          resetHighlightedMoves(game.moves({ square: sqr, verbose: true }));
          resetHighlights && addHighlightedSquares([], true);
          addArrows([], true);
        }}
        customSquareStyles={(() => {
          const sqrStyles: { [key: string]: {} } = {};
          highlightedSquares.forEach(({ square, color }) => {
            sqrStyles[square] = {
              background: color,
            };
          });
          lastMoveHighlight?.forEach(({ square, color }) => {
            sqrStyles[square] = {
              background: "#FFF",
              boxShadow: `inset 0 0 ${boardWidth / 12}px ${color}`,
            };
          });
          aiLastMoveHighlight?.forEach(({ square, color }) => {
            sqrStyles[square] = {
              background: "#FFF",
              boxShadow: `inset 0 0 ${boardWidth / 12}px ${color}`,
            };
          });
          highlightedMoves.forEach((sqr) => {
            sqrStyles[sqr.from] = {
              ...sqrStyles[sqr.from],
              background: "#FFF",
              boxShadow: `inset 0 0 ${boardWidth / 12}px ${"#E6FF99"}`,
            };
            sqrStyles[sqr.to] = {
              ...sqrStyles[sqr.to],
              background:
                game.get(sqr.to) &&
                game.get(sqr.from).color !== game.get(sqr.to).color
                  ? "radial-gradient(circle, rgba(0,0,0,.1) 75%, transparent 10%)"
                  : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 10%)",
            };
          });
          return sqrStyles;
        })()}
      />
    </div>
  );
};
