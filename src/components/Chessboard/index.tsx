import { useChess } from '@/providers/ChessProvider/context';
import { useCallback, useEffect, useState } from 'react';
import { Chessboard as ReactChessboad } from 'react-chessboard';
import { PromotionPieceOption, Square } from 'react-chessboard/dist/chessboard/types';
import posthog from 'posthog-js';
import { PositionEval, useEvaluation } from '@/providers/EvaluationProvider/context';
import { Chess } from 'chess.js';
// import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";


interface Props {
  showMoveStrength: boolean
}

export const Chessboard = ({ showMoveStrength }: Props) => {
  const [boardWidth, setBoardWidth] = useState(512);
  const [moveTo, setMoveTo] = useState<Square | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  
  const { evals } = useEvaluation();
  const { toast } = useToast();
  const { game, makeMove, onDrop, addHighlightedSquares, setLastMoveHighlightColor, arrows, turn, orientation, aiLastMoveHighlight, highlightedMoves, highlightedSquares, lastMoveHighlight, resetHighlightedMoves, addArrows } = useChess();
  
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

    if (evalDiff <= -150) {
      return 'Blunder';
    } else if (evalDiff <= -50) {
      return 'Mistake';
    } else if (evalDiff < -25) {
      return 'Inaccuracy';
    } else {
      return 'Good';
    }
  }, [turn, lastMoveHighlight]);

  useEffect(() => {
    if (!showMoveStrength)
      return;

    if (evals.length >= 2) {
      const prev = evals.at(-2);
      const curr = evals.at(-1);

      if (game.fen() !== curr?.evaledFen && turn === orientation) {

        console.log(game.history().at(-2));
        const moveStrength = evaluateMoveQuality(prev!, curr!);

        if (!moveStrength) {
          return;
        }

        let color: string;
        let msg: string;
        switch (moveStrength) {
          case "Best":
            color = "#59C9A5";
            msg = "Best Move"
            break;
          case "Good":
            color = "#bfff8a";
            msg = "Good Move";
            break;
          case "Inaccuracy":
            color = "#f7ed6a";
            msg = "Inaccurate";
            break;
          case "Mistake":
            color = "#ff9481";
            msg = "Mistake";
            break;
          case "Blunder":
            color = "#ff1414";
            msg = "Blunder";
            break;
          default: 
            color = "#F7A28D"
            msg = "Trash"
        }
        setLastMoveHighlightColor(color);

        const { dismiss } = toast({
          title: msg,
          description: `You played ${game.history().at(-2)}.`
        });

        setTimeout(() => {
          dismiss();
        }, 2000)
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

  return (
    <ReactChessboad
      boardWidth={boardWidth}
      position={game.fen()}
      onPieceDrop={onDrop}
      boardOrientation={orientation}
      customArrows={arrows}
      promotionToSquare={moveTo}
      showPromotionDialog={showPromotionDialog}
      onPromotionPieceSelect={(piece: PromotionPieceOption | undefined) => {
        if (piece) {
          makeMove({ from: highlightedMoves[0].from, to: moveTo!, promotion: piece[1].toLowerCase() ?? "q" })
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
            background: color,
          };
        });
        aiLastMoveHighlight?.forEach(({ square, color }) => {
          sqrStyles[square] = {
            background: color,
          };
        });
        highlightedMoves.forEach((sqr) => {
          sqrStyles[sqr.from] = {
            ...sqrStyles[sqr.from],
            background: "#E6FF99",
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
  );
}