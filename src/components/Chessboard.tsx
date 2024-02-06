import { useChess } from '@/providers/ChessProvider/context';
import { useEffect } from 'react';
import { Chessboard as ReactChessboad } from 'react-chessboard';


export const Chessboard = () => {
  const { game, makeMove, onDrop, addHighlightedSquares, arrows, orientation, highlightedMoves, highlightedSquares, resetHighlightedMoves, addArrows } = useChess();

  // useEffect(() => {
  //   console.log(game.fen());
  // }, [game]);

  return (
    // <div>
      <ReactChessboad
        boardWidth={512}
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        onSquareRightClick={(sqr) => {
          addHighlightedSquares([sqr], false);
        }}
        onSquareClick={(sqr) => {
          if (highlightedMoves.length > 0) {
            makeMove({ from: highlightedMoves[0].from, to: sqr })
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
    // </div>
  );
}