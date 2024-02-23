import { useChess } from '@/providers/ChessProvider/context';
import { useEffect, useState } from 'react';
import { Chessboard as ReactChessboad } from 'react-chessboard';
import { PromotionPieceOption, Square } from 'react-chessboard/dist/chessboard/types';
import posthog from 'posthog-js';

export const Chessboard = () => {
  const [boardWidth, setBoardWidth] = useState(512);
  const { game, makeMove, onDrop, addHighlightedSquares, arrows, orientation, highlightedMoves, highlightedSquares, resetHighlightedMoves, addArrows } = useChess();
  const [moveTo, setMoveTo] = useState<Square | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

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
        addHighlightedSquares([sqr], false);
      }}
      onSquareClick={(sqr) => {
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
          }
        }

        resetHighlightedMoves(game.moves({ square: sqr, verbose: true }));
        addHighlightedSquares([], true);
        addArrows([], true);
      }}
      customSquareStyles={(() => {
        const sqrStyles: { [key: string]: {} } = {};
        highlightedSquares.forEach((sqr) => {
          sqrStyles[sqr] = {
            background: "#F7A28D",
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