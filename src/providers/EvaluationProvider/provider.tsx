import {
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { EvaluationContext, MoveQuality, PositionEval } from "./context";
import { useChess } from "../ChessProvider/context";
import { Chess } from "chess.js";
import openings from "@/utils/openings.json";

export const EvaluationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [evals, setEvals] = useState<PositionEval[]>([]);

  const { turn, lastMoveHighlight, orientation } = useChess();

  const addEvaluation = useCallback((newEval: PositionEval) => {
    setEvals((prevEvals) => [...prevEvals, newEval]);
  }, []);

  const popEvals = useCallback((num: number) => {
    const popped = evals.slice(-num);

    setEvals(evals.slice(0, -num));

    return popped;
  }, [evals]);

  const clearEvaluations = useCallback(() => {
    setEvals([]);
  }, []);

  const evaluateMoveQuality = useCallback(
    (
      prevPosition: PositionEval,
      currentPosition: PositionEval,
      playedMove: string
    ): MoveQuality | null => {
      let evalDiff = currentPosition.evaluation - prevPosition.evaluation;

      const chess = new Chess(prevPosition.evaledFen);
      try {
        const res = chess.move(playedMove);
      } catch (err) {
        return null;
      }

      const o = openings.find(opening => currentPosition.evaledFen.includes(opening.fen));

      if (o) {
        console.log(o);
        return MoveQuality.Book
      }

      if (
        `${chess.history({ verbose: true }).at(-1)?.from}${chess.history({ verbose: true }).at(-1)?.to}` ===
        prevPosition.bestMove
      ) {
        return MoveQuality.Best;
      }

      if (turn == "black") {
        evalDiff = -evalDiff;
      }

      // Since we can only use the four listed classes, we will map the mate situations to the closest class.
      if (prevPosition.mate && currentPosition.mate) {
        // Both positions have a mate, so the move didn't change the inevitable outcome
        // This could be considered a 'Blunder' if it was the player's turn to move and they failed to prevent mate
        // or 'Good' if there was no way to prevent the mate.
        return turn === orientation ? MoveQuality.Blunder : MoveQuality.Good;
      } else if (prevPosition.mate) {
        // Previous position had a mate, but the current one doesn't, so the move prevented mate
        // This is a 'Good' move as it prevented mate.
        return MoveQuality.Good;
      } else if (currentPosition.mate) {
        // Current position has a mate, so the move led to a mate
        // This is a 'Blunder' as it led to a mate.
        return MoveQuality.Blunder;
      }

      if (evalDiff <= -150) {
        return MoveQuality.Blunder;
      } else if (evalDiff <= -50) {
        return MoveQuality.Mistake;
      } else if (evalDiff < -25) {
        return MoveQuality.Inaccuracy;
      } else {
        return MoveQuality.Good;
      }
    },
    [orientation, turn, lastMoveHighlight],
  );

  const value = useMemo(
    () => ({
      evals,
      popEvals,
      evaluateMoveQuality,
      clearEvaluations,
    }),
    [evals, evaluateMoveQuality, popEvals, clearEvaluations],
  );

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { cp, multiPv, mate, fen, pv } = (event as CustomEvent).detail;

      if (multiPv === 1) {
        setEvals((prev) => {
          return [
            ...prev,
            {
              evaledFen: fen,
              evaluation: mate ? mate : cp,
              mate: mate !== 0,
              pv: pv,
              bestMove: pv.at(0),
            },
          ];
        });
      }
    };

    window.addEventListener("setEval", evalHandler);

    // const moveHandler = (event: Event) => {
    //   const { fen } = (event as CustomEvent).detail;
    //   // setEvaledFen(fen);
    // }

    // window.addEventListener("setBestMove", moveHandler);
    return () => {
      window.removeEventListener("setEval", evalHandler);
      // window.removeEventListener("setBestMove", moveHandler);
    };
  }, []);

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
};
