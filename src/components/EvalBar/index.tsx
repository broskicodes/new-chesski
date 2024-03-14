import "./styles.css";

import { useEffect, useRef, useState } from "react";
import { useChess } from "@/providers/ChessProvider/context";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useEvaluation } from "@/providers/EvaluationProvider/context";

export const EvalBar = () => {
  const [barLength, setBarLength] = useState<number>(512);
  const [mobile, setMobile] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  
  const { game, orientation } = useChess();
  const { startSearch, isReady } = useStockfish();
  const { evals } = useEvaluation();

  useEffect(() => {
    if (orientation === "white") {
      barRef.current?.style.setProperty("background-color", "#000");
      fillRef.current?.style.setProperty("background-color", "#FFF");
    } else {
      barRef.current?.style.setProperty("background-color", "#FFF");
      fillRef.current?.style.setProperty("background-color", "#000");
    }
  }, [orientation]);

  useEffect(() => {
    const evaluation = evals.at(-1);

    let mult = 1;
    if (orientation === "black") {
      mult = -1;
    }

    const length = evaluation?.mate ?? false
      ? mult * (evaluation?.evaluation ?? 0) > 0 ? 100 : 0
      : (Math.tanh(mult * (evaluation?.evaluation ?? 0) / 1000) + 1) * 50; // Map -1 to 1 to 0% to 100%

    fillRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${length}%`);
    fillRef.current?.style.setProperty(`${mobile ? "height" : "width"}`, `100%`);
    barRef.current?.style.setProperty(`${mobile ? "height" : "width"}`, `24px`);
    barRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${barLength}px`)
  }, [evals, orientation, mobile, barLength]);

  useEffect(() => {
    if (isReady && game.fen() !== evals.at(-1)?.evaledFen) {
      startSearch();
    }
  }, [game, evals, isReady, startSearch]);

  useEffect(() => {
    barRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${barLength}px`)
  }, [barLength, mobile])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBarLength(window.innerWidth > 480 ? 480 : window.innerWidth);
        setMobile(true);
        return;
      } else if (window.innerWidth < 1024) {
        setBarLength(480);
        setMobile(false);
        return;
      }
      setMobile(false);
      setBarLength(512);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div id="eval-bar" ref={barRef}>
      <div id="eval-fill" ref={fillRef}></div>
    </div>
  );
};

