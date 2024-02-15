import { useChess } from "@/providers/ChessProvider/context";
import { SanRegex } from "@/utils/types";
import { Chess, Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useCoach } from "@/providers/CoachProvider/context";

import "./styles.css";

export const GameLogs = () => {
  const [prevFen, setPrevFen] = useState("");

  const { isInit, startSearch } = useStockfish();
  const { game, turn, orientation, addHighlightedSquares, addArrows } = useChess();
  const { gameMessages, processing, queries, appendGameMessage, getExplantion } = useCoach();

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
    if (game.fen() !== prevFen && isInit) {
      const moves = game.history();
      const fen = game.fen();

      setPrevFen(fen);
      appendGameMessage({
        role: "user",
        content: `The user is playing as ${orientation}. The current position is ${fen}. The moves leading up to this position are ${moves.join(" ")}. ${turn === "white" ? "Black" : "White"} just played ${moves.at(-1)}.`
      });
    }
  }, [game, prevFen, orientation, turn, isInit, appendGameMessage]);

  useEffect(() => {
    if (!processing && gameMessages.at(-1)?.role === "assistant") {
      startSearch();
    }
  }, [processing, gameMessages, startSearch]);

  useEffect(() => {
    if (game.fen() !== prevFen) {
      startSearch();
    }
  }, [game, prevFen, startSearch]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameMessages, processing]);

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
              <span className={`${message.role}-message role`}>{message.role.toUpperCase()}:</span>
              {/* <ReactMarkdown className="content">{elems}</ReactMarkdown> */}
              <div className="content">{elems}</div>
            </div>
          )
        })}
        <div className={`queries ${!processing ? "flex" : "hidden"}`}>
          {queries.map((query, i) => (
            <button key={i} className="button inverted-button thin-button" onClick={() => getExplantion(query.query) }>{query.title}</button>
          ))}
        </div>
        <div className={`justify-center pt-2 ${processing ? "flex" : "hidden"}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1B03A3]" />
        </div>
      </div>
    </div>
  )
}