import "./styles.css";

import { useEffect, useRef, useState } from "react";
import { useChess } from "@/providers/ChessProvider/context";
import { useStockfish } from "@/providers/StockfishProvider/context";

export const EvalBar = () => {
  const [evaluation, setEvaluation] = useState<number>(0);
  const [barLength, setBarLength] = useState<number>(512);
  const [evaledFen, setEvaledFen] = useState<string>("");
  const [mate, setMate] = useState(false);
  const [mobile, setMobile] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  
  const { game, orientation } = useChess();
  const { startSearch, isReady } = useStockfish();

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
    // console.log(evaluation);
    let mult = 1;
    if (orientation === "black") {
      mult = -1;
    }

    const length = mate 
      ? mult * evaluation > 0 ? 100 : 0
      : (Math.tanh(evaluation / 1000) + 1) * 50; // Map -1 to 1 to 0% to 100%

    fillRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${length}%`);
    fillRef.current?.style.setProperty(`${mobile ? "height" : "width"}`, `100%`);
    barRef.current?.style.setProperty(`${mobile ? "height" : "width"}`, `24px`);
    barRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${barLength}px`)
  }, [evaluation, orientation, mobile]);

  useEffect(() => {
    if (isReady && game.fen() !== evaledFen) {
      startSearch();
    }
  }, [game, evaledFen, isReady]);

  useEffect(() => {
    barRef.current?.style.setProperty(`${mobile ? "width" : "height"}`, `${barLength}px`)
  }, [barLength])

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { cp, multiPv, mate } = (event as CustomEvent).detail;

      if (multiPv === 1) {
        setEvaluation(mate !==0 ? mate : cp);
        setMate(mate !== 0);
      }
    }

    window.addEventListener("setEval", evalHandler);

    const moveHandler = (event: Event) => {
      const { fen } = (event as CustomEvent).detail;
      setEvaledFen(fen);
    }

    window.addEventListener("setBestMove", moveHandler);
    return () => {
      window.removeEventListener("setEval", evalHandler);
      window.removeEventListener("setBestMove", moveHandler);
    }
  }, [game]);

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

