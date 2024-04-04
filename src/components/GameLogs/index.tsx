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
import { useAuth } from "@/providers/AuthProvider/context";
import { useUserData } from "@/providers/UserDataProvider/context";
import Link from "next/link";
// import ReactMarkdown from "react-markdown";

export const GameLogs = () => {
  const [prevFen, setPrevFen] = useState("");
  const [numQueries, setNumQueries] = useState(0);
  // const [evals, setEvals] = useState<{ [key: number]: Evaluation }[]>([{}]);

  const { session, supabase, signInWithOAuth } = useAuth();
  const { evals } = useEvaluation();
  const { isInit, startSearch } = useStockfish();
  const { game, turn, orientation, addHighlightedSquares, addArrows, makeMove } = useChess();
  const { gameMessages, processing, queries, addGameMessage, appendGameMessage, getExplantion } = useCoach();
  const { isPro } = useUserData();

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

  useEffect(() => {
    if (!session || !supabase) {
      return;
    }

    (async () => {
      const { data } = await supabase.from("daily_position_queries")
        .select("number")
        .eq("user_id", session.id);

      if (data && data[0]) {
        setNumQueries(data[0].number);
      }
    })()
  }, [session, supabase])

  return (
    <div className="logs">
      <div className="log-content" ref={logRef}>
        {gameMessages.map((message, i) => {
          if (!message.content) return null;

          if (!(message.role === "assistant")) return null;

          const advice = message.content.split('"""')[1];

          if (!advice) return null;

          const adviceLines = advice.split('\n');

          const elems = adviceLines.map((line, i) => {
            const segments = line.split(SanRegex).filter(Boolean);

            const lineElems = segments.map((segment, j) => {
              if (SanRegex.test(segment)) {
                return <span key={j} className="san" onClick={() => highlightGameBoard(segment)}>{segment}</span>;
              } 

              if (segment.includes("Subscribe now")) {
                const parts = segment.split("Subscribe now");
                return (
                  <span key={j}>
                    {parts[0]}
                    <Link href="/subscribe" className="underline font-semibold">Subscribe now</Link>
                    {parts[1]}
                  </span>
                );
              }           
              return <span key={j}>{segment}</span>;
            });

            return (
              <div key={i} className="content">{lineElems}</div>
            );
          });

          return (
            <div key={i} className="flex flex-col">
              <span className={`${message.role}-message role`}>CHESSKI:</span>
              <div className="flex flex-col space-y-2">
                {elems}
              </div>
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
            {session && (
              <Button 
                variant="outline" size="thin"
                onClick={async () => {
                  if (!isPro) {
                    if (numQueries >= 3) {
                      addGameMessage({
                        id: Math.random().toString(32).substring(7),
                        role: "assistant",
                        content: `"""Your have reached your daily limit for analysis. Subscribe now, or come back tomorrow."""`
                      })
                      return;
                    }


                    if (!supabase) {
                      return;
                    }

                    const {} = await supabase
                      .from("daily_position_queries")
                      .upsert({
                        user_id: session.id,
                        number: numQueries + 1
                      });

                    setNumQueries(numQueries + 1);
                  }

                  const latestEval = evals.length > 0 ? evals.at(-1)! : undefined;

                  if (!latestEval) return;

                  appendGameMessage({
                    role: "user",
                    content: `${latestEval.evaluation} ${latestEval.pv.join(" ")}`
                  });
                }}
                >Analyze position</Button>
            )}
            {!session && (
              <Button 
              variant="outline" size="thin"
              onClick={() => {
                signInWithOAuth()
              }}
              >Sign in to Analyze</Button>
            )}
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