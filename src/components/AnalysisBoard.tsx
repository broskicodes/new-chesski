import { useAnalysis } from "@/providers/AnalysisProvider";
import { useChess } from "@/providers/ChessProvider/context";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";

interface Props {
  freeze: boolean;
}

export const AnalysisBoard = ({ freeze }: Props) => {
  const [boardWidth, setBoardWidth] = useState(1);

  const { moves } = useAnalysis();
  const { game, moveHighlight, orientation } = useChess();

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
    <div className="relative">
      {freeze && (
        <div className="absolute inset-0 bg-black/30 z-40 flex justify-center items-center">
          {moves.length > 0 && (
            <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-b-4 border-[#1B03A3]" />
          )}
          {moves.length === 0 && (
            <div className="text-white text-2xl font-semibold sm:text-4xl sm:font-bold bg-black/10 px-2">
              Choose a game to analyze
            </div>
          )}
        </div>
      )}
      <ReactChessboard
        boardWidth={boardWidth}
        position={freeze ? new Chess().fen() : game.fen()}
        isDraggablePiece={() => false}
        boardOrientation={freeze ? "white" : orientation}
        customSquareStyles={(() => {
          if (freeze) {
            return {};
          }

          const sqrStyles: { [key: string]: {} } = {};

          moveHighlight?.forEach(({ square, color }) => {
            sqrStyles[square] = {
              background: "#FFF",
              boxShadow: `inset 0 0 ${boardWidth / 12}px ${color}`,
            };
          });

          return sqrStyles;
        })()}
      />
    </div>
  );
};
