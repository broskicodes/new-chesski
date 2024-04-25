import { useChess } from "@/providers/ChessProvider/context";
import { useEffect, useState } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";

export const AnalysisBoard = () => {
  const [boardWidth, setBoardWidth] = useState(512);

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
      setBoardWidth(512);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <ReactChessboard 
        boardWidth={boardWidth}
        position={game.fen()}
        isDraggablePiece={() => false}
        boardOrientation={orientation}
        customSquareStyles={(() => {
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
}