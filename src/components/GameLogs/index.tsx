import { useChess } from "@/providers/ChessProvider/context";
import { SanRegex } from "@/utils/types";
import { Message } from "ai";
import { Chess, Square } from "chess.js";
import { useCallback, useEffect, useRef } from "react";

interface GameLogsProps {
  messages: Message[];
}

export const GameLogs = ({ messages }: GameLogsProps) => {
  const { game, addHighlightedSquares, addArrows } = useChess();

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
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="logs">
      <div className="log-content" ref={logRef}>
        {messages.map((message, i) => {
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
      </div>
    </div>
  )
}