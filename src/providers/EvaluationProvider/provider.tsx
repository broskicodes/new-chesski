import {
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { EvaluationContext, PositionEval } from "./context";

export const EvaluationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [evals, setEvals] = useState<PositionEval[]>([]);

  const addEvaluation = useCallback((newEval: PositionEval) => {
    setEvals((prevEvals) => [...prevEvals, newEval]);
  }, []);

  const clearEvaluations = useCallback(() => {
    setEvals([]);
  }, []);

  const value = useMemo(
    () => ({
      evals,
      addEvaluation,
      clearEvaluations,
    }),
    [evals, addEvaluation, clearEvaluations],
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
