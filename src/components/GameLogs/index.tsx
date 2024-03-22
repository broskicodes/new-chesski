import { useChess } from "@/providers/ChessProvider/context";
import { Evaluation, SanRegex } from "@/utils/types";
import { Chess, Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useCoach } from "@/providers/CoachProvider/context";

import "./styles.css";
import posthog from "posthog-js";
import { useEvaluation } from "@/providers/EvaluationProvider/context";
import { Button } from "../ui/button";

export const GameLogs = () => {
  const [prevFen, setPrevFen] = useState("");
  // const [evals, setEvals] = useState<{ [key: number]: Evaluation }[]>([{}]);

  const { evals } = useEvaluation();
  const { isInit, startSearch } = useStockfish();
  const { game, turn, orientation, addHighlightedSquares, addArrows, makeMove } = useChess();
  const { gameMessages, processing, queries, addGameMessage, appendGameMessage, getExplantion } = useCoach();

  const logRef = useRef<HTMLDivElement>(null);

  const highlightGameBoard = useCallback((move: string) => {
    const tempGame = new Chess(game.fen());

    try {
      const res = tempGame.move(move);
      addArrows([[res.from, res.to]], true);
      addHighlightedSquares([], true)
    } catch (e) {
      addHighlightedSquares([{ square: move.slice(-2) as Square, color: "#F7A28D"}], true)
      addArrows([], true);
    }
    
  }, [addArrows, addHighlightedSquares, game]);

  useEffect(() => {
    if (gameMessages.length === 0) {
      addGameMessage({
        id: Math.random().toString(32).substring(7),
        role: "assistant",
        content: `"""This is the starting position. Make a move to start the game."""`
      })
    }
  }, [gameMessages, addGameMessage]);

  useEffect(() => {
    const fen = game.fen();

    if (!processing && fen !== prevFen && orientation === turn && isInit) {
      const latestEval = evals.length > 0 ? evals.at(-1)! : undefined;
      if (!latestEval || (latestEval && latestEval.evaledFen !== fen)) {
        return;
      }

      const moves = game.history();

      setPrevFen(fen);
      // appendGameMessage({
      //   role: "user",
      //   content: `${latestEval.evaluation} ${latestEval.pv.join(" ")}`
      // });
    }
  }, [processing, game, prevFen, orientation, turn, isInit, evals, appendGameMessage]);

  useEffect(() => {
    if (logRef.current) {
      const message = gameMessages.at(-1);
      const advice = message?.content.split('"""')[1];

      if (!advice) return;

      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameMessages, processing]);

  useEffect(() => {
    const moveHandler = (event: Event) => {
      const { bestMove } = (event as CustomEvent).detail;

      if (turn !== orientation) {
        makeMove(bestMove);
      }
    }

    window.addEventListener("setBestMove", moveHandler);
    return () => {
      window.removeEventListener("setBestMove", moveHandler);
    }
  }, [game, orientation, turn, makeMove]);

  return (
    <div className="logs">
      <div className="log-content" ref={logRef}>
        {gameMessages.map((message, i) => {
          if (!message.content) return null;

          if (!(message.role === "assistant")) return null;

          const advice = message.content.split('"""')[1];

          if (!advice) return null;

          const segments = advice.split(SanRegex).filter(Boolean);

          const elems = segments.map((segment, i) => {
            if (SanRegex.test(segment)) {
              return <span key={i} className="san" onClick={() => highlightGameBoard(segment)}>{segment}</span>;
            }
            return <span key={i}>{segment}</span>;
          });

          return (
            <div key={i} className="flex flex-col">
              <span className={`${message.role}-message role`}>CHESSKI:</span>
              {/* <ReactMarkdown className="content">{elems}</ReactMarkdown> */}
              <div className="content">{elems}</div>
            </div>
          )
        })}
        {!processing && (
          // <div className={`queries`}>
          //   {queries.map((query, i) => (
          //     <button key={i} className="button inverted-button thin-button" onClick={() => {
          //       posthog.capture("position_queried")
          //       getExplantion(query.query) 
          //     }}>{query.title}</button>
          //   ))}
          // </div>
          <div className="queries">
            <Button 
              variant="outline" size="thin"
              onClick={() => {
                const latestEval = evals.length > 0 ? evals.at(-1)! : undefined;

                if (!latestEval) return;

                appendGameMessage({
                  role: "user",
                  content: `${latestEval.evaluation} ${latestEval.pv.join(" ")}`
                });
              }}
              >Analyze position</Button>
            {/* <Button 
              variant="outline" size="thin"
              onClick={() => {

              }}>Next move options</Button> */}
          </div>
        )}
        {processing && gameMessages.length > 0 && (
          <div className={`justify-center pt-2 mx-auto w-fit h-fit`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1B03A3]" />
          </div>
        )}
      </div>
    </div>
  )
}