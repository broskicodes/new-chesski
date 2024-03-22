import { useChess } from '@/providers/ChessProvider/context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chessboard as ReactChessboad } from 'react-chessboard';
import { PromotionPieceOption, Square } from 'react-chessboard/dist/chessboard/types';
import posthog from 'posthog-js';
import { PositionEval, useEvaluation } from '@/providers/EvaluationProvider/context';
import { Chess } from 'chess.js';
// import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";
import { useCoach } from '@/providers/CoachProvider/context';
import { setCurrMessages } from '@/utils/clientHelpers';
import { Message } from 'ai';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '@/providers/AuthProvider/context';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { STRIPE_LINK } from '@/utils/types';

export const Chessboard = () => {
  const [boardWidth, setBoardWidth] = useState(512);
  const [moveTo, setMoveTo] = useState<Square | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pieceDropSquares, setPieceDropSquares] = useState<[Square, Square] | null>(null);
  const [movesMade, setMovesMade] = useState(0);
  const [mult, setMult] = useState(1);
  
  const { evals } = useEvaluation();
  const { toast } = useToast();
  const { session, supabase, signInWithOAuth } = useAuth();
  const { addGameMessage, gameMessages } = useCoach()
  const { game, makeMove, onDrop, addHighlightedSquares, setLastMoveHighlightColor, arrows, turn, orientation, aiLastMoveHighlight, highlightedMoves, highlightedSquares, lastMoveHighlight, resetHighlightedMoves, addArrows } = useChess();
  
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  const evaluateMoveQuality = useCallback((prevPosition: PositionEval, currentPosition: PositionEval): string | null => {
    let evalDiff = currentPosition.evaluation - prevPosition.evaluation;

    const chess = new Chess(prevPosition.evaledFen);
    try {
      const res = chess.move({ from: lastMoveHighlight![0].square, to: lastMoveHighlight![1].square });
    } catch (err) {
      return null;
    }
    
    if (`${lastMoveHighlight![0].square}${lastMoveHighlight![1].square}` === prevPosition.bestMove) {
      return 'Best';
    }

    if (turn == "black") {
      evalDiff = -evalDiff;
    }

    // Since we can only use the four listed classes, we will map the mate situations to the closest class.
    if (prevPosition.mate && currentPosition.mate) {
      // Both positions have a mate, so the move didn't change the inevitable outcome
      // This could be considered a 'Blunder' if it was the player's turn to move and they failed to prevent mate
      // or 'Good' if there was no way to prevent the mate.
      return turn === orientation ? 'Blunder' : 'Good';
    } else if (prevPosition.mate) {
      // Previous position had a mate, but the current one doesn't, so the move prevented mate
      // This is a 'Good' move as it prevented mate.
      return 'Good';
    } else if (currentPosition.mate) {
      // Current position has a mate, so the move led to a mate
      // This is a 'Blunder' as it led to a mate.
      return 'Blunder';
    }

    if (evalDiff <= -150) {
      return 'Blunder';
    } else if (evalDiff <= -50) {
      return 'Mistake';
    } else if (evalDiff < -25) {
      return 'Inaccuracy';
    } else {
      return 'Good';
    }
  }, [orientation, turn, lastMoveHighlight]);

  useEffect(() => {
    // if (orientation)
    if (evals.length >= 2) {
      const prev = evals.at(-2);
      const curr = evals.at(-1);

      if (game.fen() !== curr?.evaledFen && turn === orientation) {

        const moveStrength = evaluateMoveQuality(prev!, curr!);

        if (!moveStrength) {
          return;
        }

        let color: string;
        let msg: string;
        switch (moveStrength) {
          case "Best":
            color = "#E64DFF";
            msg = "Best Move"
            break;
          case "Good":
            color = "#33C57D";
            msg = "Good Move";
            break;
          case "Inaccuracy":
            color = "#F6C333";
            msg = "Inaccurate";
            break;
          case "Mistake":
            color = "#F4A153";
            msg = "Mistake";
            break;
          case "Blunder":
            color = "#E45B4F";
            msg = "Blunder";
            break;
          default: 
            color = "#F7A28D"
            msg = "Trash"
        }
        setLastMoveHighlightColor(color);

        const tempGame = new Chess();
        tempGame.loadPgn(game.history().slice(0, -2).join(" "))
        tempGame.move(prev?.bestMove!)

        const gameMsg: Message = {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: `"""You played ${game.history().at(-2)}${msg !== "Best Move" ? `. The best move was ${tempGame.history().at(-1)}` : ", it was the best move."}"""`
        }

        addGameMessage(gameMsg);
        setCurrMessages([gameMsg], false);

        // const { dismiss } = toast({
        //   title: msg,
        //   description: `You played ${game.history().at(-2)}.`
        // });

        // setTimeout(() => {
        //   dismiss();
        // }, 2000)
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
      setBoardWidth(512);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (movesMade === (session ? 2 : 5) * mult) {
      setMult(mult * 2);

      if (!session || !supabase) return;

      (async () => {
        const { data, error } = await supabase
          .from("user_donos")
          .select()
          .eq("email", session.email);

        if (data && data.length > 0) return;
          
        modalTriggerRef.current?.click();
      })();
    }
  }, [movesMade, mult, session, supabase])

  return (
    <div>
      <Dialog>
        <DialogTrigger ref={modalTriggerRef} className='hidden' />
        <DialogContent>
          <DialogHeader className='flex flex-col items-center space-y-0'>
            <DialogTitle className='text-2xl'>Enjoying  Chesski?</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col space-y-4'>
            {!session && (
              <div className=''>
                <DialogDescription className='text-black font-semibold text-lg'>Get notified about future updates!</DialogDescription>
                <Button 
                  className='w-full'
                  onClick={signInWithOAuth}>
                  Sign in with Google
                </Button>
              </div>
            )}
            <div>
            <DialogDescription className='text-black font-semibold text-lg'>Support the creator!</DialogDescription>
            <Link
              href={`${STRIPE_LINK}?${session ? `prefilled_email=${session.email}`: ""}`} 
              target="_blank" 
              className={`${buttonVariants({ variant: "default" })} w-full`}
              onClick={() => { posthog.capture("dono_clicked") }}
              >
              Donate now
            </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ReactChessboad
        boardWidth={boardWidth}
        position={game.fen()}
        onPieceDrop={(sSqr: Square, tSqr: Square) => {
          setMovesMade(movesMade + 1);
          return onDrop(sSqr, tSqr);
        }}
        boardOrientation={orientation}
        customArrows={arrows}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
        onPromotionCheck={(sourceSquare, targetSquare, piece) => {
          setPieceDropSquares([sourceSquare, targetSquare]);

          return (
            (piece === "wP" && sourceSquare[1] === "7" && targetSquare[1] === "8") 
            || (piece === "bP" && sourceSquare[1] === "2" && targetSquare[1] === "1")
          ) && Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1
        }}
        onPromotionPieceSelect={(piece: PromotionPieceOption | undefined) => {
          if (highlightedMoves.length > 0) {
            if (piece) {
              makeMove({ from: highlightedMoves[0].from, to: moveTo!, promotion: piece[1].toLowerCase() ?? "q" })
            }
          } else {
            makeMove({ from: pieceDropSquares![0], to: pieceDropSquares![1], promotion: piece![1].toLowerCase() ?? "q" })
            setPieceDropSquares(null)
          }

          resetHighlightedMoves([]);
          addHighlightedSquares([], true);
          addArrows([], true);
          setShowPromotionDialog(false);
          posthog.capture("user_played_move");

          return true;
        }}
        onSquareRightClick={(sqr) => {
          addHighlightedSquares([{ square: sqr, color: "#F7A28D" }], false);
        }}
        onSquareClick={(sqr) => {
          let resetHighlights = true;
          if (highlightedMoves.length > 0) {
            setMoveTo(sqr)
            
            const moves = game.moves({
              verbose: true,
              square: highlightedMoves[0].from
            });

            const foundMove = moves.find(
              (m) => m.from ===  highlightedMoves[0].from && m.to === sqr
            );

            if (foundMove && foundMove.to === sqr && (
              (foundMove.color === "w" &&
                foundMove.piece === "p" &&
                sqr[1] === "8") ||
              (foundMove.color === "b" &&
                foundMove.piece === "p" &&
                sqr[1] === "1"))
            ) {
              setShowPromotionDialog(true);
              return;
            }
            
            if (makeMove({ from: highlightedMoves[0].from, to: sqr, promotion: "q" })) {
              posthog.capture("user_played_move");
              setMovesMade(movesMade + 1);

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
}