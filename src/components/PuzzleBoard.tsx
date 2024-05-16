import { useChess } from "@/providers/ChessProvider/context";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { Chess, Square } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";
import { PromotionPieceOption } from "react-chessboard/dist/chessboard/types";

interface Props {
  freeze?: boolean
}

export const PuzzleBoard = ({ freeze }: Props) => {
  const [boardWidth, setBoardWidth] = useState(1);

  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pieceDropSquares, setPieceDropSquares] = useState<
      [Square, Square] | null
    >(null);

  const { puzzle, setPuzzle } = usePuzzle();
  const { game, orientation, highlightedMoves, highlightedSquares, moveHighlight, arrows, onDrop, makeMove, resetHighlightedMoves, addArrows, addHighlightedSquares  } = useChess();

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

  // useEffect(() => {
  //   setPuzzle("001h8");
  // }, [setPuzzle])

  return (
    <div className="relative">
      
      <ReactChessboard
        boardWidth={boardWidth}
        position={freeze ? new Chess().fen() : game.fen()}
        boardOrientation={freeze ? "white" : orientation}
        isDraggablePiece={() => !freeze}
        customArrows={arrows}
        onPieceDrop={(sSqr: Square, tSqr: Square) => {
          const res = onDrop(sSqr, tSqr);

          return res;
        }}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
        onPromotionCheck={(sourceSquare, targetSquare, piece) => {
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
        onPromotionPieceSelect={(piece: PromotionPieceOption | undefined) => {
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

          return true;
        }}
        onSquareRightClick={(sqr) => {
          addHighlightedSquares([{ square: sqr, color: "#F7A28D" }], false);
        }}
        onSquareClick={(sqr) => {
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

            makeMove({
              from: highlightedMoves[0].from,
              to: sqr,
              promotion: "q",
            })
          }

          resetHighlightedMoves(game.moves({ square: sqr, verbose: true }));
          resetHighlights && addHighlightedSquares([], true);
          addArrows([], true);
        }}
        customSquareStyles={(() => {
          if (freeze) {
            return {};
          }

          const sqrStyles: { [key: string]: {} } = {};
          highlightedSquares.forEach(({ square, color }) => {
            sqrStyles[square] = {
              background: color,
            };
          });
          moveHighlight?.forEach(({ square, color }) => {
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
