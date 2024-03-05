import { useChess } from "@/providers/ChessProvider/context";
import { Evaluation, SanRegex } from "@/utils/types";
import { Chess, Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useCoach } from "@/providers/CoachProvider/context";

import "./styles.css";
import posthog from "posthog-js";

export const GameLogs = () => {
  const [prevFen, setPrevFen] = useState("");
  const [evals, setEvals] = useState<{ [key: number]: Evaluation }[]>([{}]);

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
      addHighlightedSquares([move.slice(-2) as Square], true)
      addArrows([], true);
    }
    
  }, [addArrows, addHighlightedSquares, game]);

  useEffect(() => {
    if (gameMessages.length === 0) {
      addGameMessage({
        id: Math.random().toString(32).substring(7),
        role: "assistant",
        content: "Hi I'm Chesski. I'll be giving you advice as you play moves on the board. The loading circle means I'm thinking!"
      })
    }
  }, [gameMessages, addGameMessage]);

  useEffect(() => {
    const fen = game.fen();

    if (!processing && fen !== prevFen && orientation === turn && isInit) {
      const latestEval = evals.length > 1 ? evals.at(-2)![1] : undefined;
      if (!latestEval || (latestEval && latestEval.fen !== fen)) {
        // console.log(latestEval?.fen, fen)
        return;
      }

      const moves = game.history();

      // console.log(evals);

      // console.log(latestEval);

      setPrevFen(fen);
      appendGameMessage({
        role: "user",
        content: `The user is playing as ${orientation}. The current position is ${fen}. The moves leading up to this position are ${moves.join(" ")}. ${turn === "white" ? "Black" : "White"} just played ${moves.at(-1)}.\n\nStockfish gives the position an evaluation of ${latestEval?.eval} centipawns. The best engine line is ${latestEval?.pv.join(" ")}.`
      });

      setEvals((prev) => {
        return [...prev, {}]
      });
    }
  }, [processing, game, prevFen, orientation, turn, isInit, evals, appendGameMessage]);

  // useEffect(() => {
  //   if (!processing 
  //     && (gameMessages.at(-1)?.role === "assistant" || !gameMessages.at(-1))
  //     && game.fen() !== prevFen
  //     ) {
  //     setPrevFen(game.fen());
  //     startSearch();
  //   }
  // }, [processing, gameMessages, startSearch, game, prevFen]);

  // useEffect(() => {
  //   if (game.fen() !== prevFen) {
  //     startSearch();
  //   }
  // }, [game, prevFen, startSearch]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameMessages, processing]);

  useEffect(() => {
    // if (evals.at(-2) && evals.at(-2)![1]) {
    //   console.log(evals.at(-2)![1].eval)
    // }
  }, [evals])

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { cp, mate, pv, multiPv } = (event as CustomEvent).detail;

      setEvals((prev) => {
        prev.at(-1)![multiPv] = { fen: game.fen(), eval: mate ? mate : cp, pv: pv, mate: mate !== 0 };

        return prev;
      });
      // console.log(multiPv, pv);
    }

    window.addEventListener("setEval", evalHandler);

    const moveHandler = (event: Event) => {
      const { bestMove } = (event as CustomEvent).detail;

      if (turn !== orientation) {
        makeMove(bestMove);
      }
      setEvals((prev) => {
        return [...prev, {}]
      });
    }

    window.addEventListener("setBestMove", moveHandler);
    return () => {
      window.removeEventListener("setEval", evalHandler);
      window.removeEventListener("setBestMove", moveHandler);
    }
  }, [game, evals, orientation, turn, makeMove])

  return (
    <div className="logs">
      <div className="log-content" ref={logRef}>
        {gameMessages.map((message, i) => {
          if (!message.content) return null;

          if (!(message.role === "assistant")) return null;

          const segments = message.content.split(SanRegex).filter(Boolean);
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
        <div className={`queries ${!processing ? "flex" : "hidden"}`}>
          {queries.map((query, i) => (
            <button key={i} className="button inverted-button thin-button" onClick={() => {
              posthog.capture("position_queried")
              getExplantion(query.query) 
            }}>{query.title}</button>
          ))}
        </div>
        <div className={`justify-center pt-2 ${processing && gameMessages.length > 0 ? "flex" : "hidden"}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1B03A3]" />
        </div>
      </div>
    </div>
  )
}