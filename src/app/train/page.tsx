'use client';
import "./styles.css";

import { BoardControl } from "@/components/BoardControl";
import { Chessboard } from "@/components/Chessboard";
import { EvalBar } from "@/components/EvalBar";
import { SignUpModal } from "@/components/SignUpModal";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { SkillLevel } from "@/utils/types";
import { ToolCall } from "ai";
import { Message, useChat } from "ai/react";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";

const Train = () => {
  const [processing, setProcessing] = useState(false);
  const [prevFen, setPrevFen] = useState("");
  const [d, setD] = useState(0)

  const { initEngine } = useStockfish();
  const { puzzle, moveIdx, currPos, puzzleComplete, checkMove, setPuzzle, playNextMove } = usePuzzle();
  const { game, orientation, turn } = useChess();

  const chessRef = useRef<HTMLDivElement>(null);

  const { messages, append } = useChat({
    api: "/train/api/instructor",
    body: { puzzle: puzzle },
    onFinish: () => {
      setProcessing(false);
    }
    // experimental_onToolCall: async (_msgs: Message[], toolCalls: ToolCall[]) => {
    //   console.log(JSON.parse(toolCalls[0].function.arguments));
    // },
  })


  useEffect(() => {
    initEngine(true, SkillLevel.Grandmaster, 2000);
  }, [initEngine]);

  useEffect(() => {
    if (puzzle && moveIdx >= 0 && !processing && messages.length === 0) {
      setTimeout(() => {
        playNextMove();
      }, 1500);

      setProcessing(true);
      append({
        role: "user",
        content: `Please introduce the puzzle.`
      });
    }
  }, [puzzle, moveIdx, messages, processing, append, playNextMove]);

  useEffect(() => {
    if (!puzzle) {
      (async () => {
        const res = await fetch("/train/api/lessons", { method: "GET" });
        const puzzles = await res.json();

        const puzzle = puzzles[0];
        setPuzzle(puzzle.id)
      })(); 
    }
  }, [setPuzzle, puzzle]);

  useEffect(() => {
    if (game.fen() != prevFen) {
      setPrevFen(game.fen())
    }

    if (orientation === turn || puzzleComplete)
      return;


    if (prevFen === currPos && checkMove()) {
      setProcessing(true);
      append({
        role: "user",
        content: `The player just played the correct move: ${game.history().at(-1)}! Congradulate them and briefly comment on the impact of the move.`
      });    
    }    
  }, [game, prevFen, currPos, orientation, turn, checkMove, append]);

  useEffect(() => {
    if (puzzleComplete && !d && !processing) {
      setD(1)
      append({
        role: "user",
        content: `Congradulate the player for completing the puzzle!`
      }); 
    }
  }, [puzzleComplete, append, d, processing])

  // useEffect(() => {
  //   if (moveIdx >= 0 && moveIdx % 2 === 0) {
  //     
  //   }
  // }, [moveIdx, playNextMove])

  return (
    <div>
      <SignUpModal disabled={false} />
      <div className="page-content">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0" ref={chessRef}>
          <Tooltip content="Evaluation Bar">
            <EvalBar />
          </Tooltip>
          <div className="flex flex-col space-y-2">
            <Chessboard showMoveStrength={false} />
            <BoardControl />
          </div>
        </div>
        <Card className="assistant pt-6">
          <CardContent className="h-full">
            <ScrollArea className="h-full flex flex-col">
              {messages.slice(1).map((msg) => {
                return (
                  <div>{msg.content}</div>
                );
              })}
              {moveIdx >= 0 && moveIdx % 2 === 0 && !puzzleComplete && (
                <Button onClick={() => {
                  setTimeout(() => {
                    playNextMove();
                  }, 500);}}
                  >continue</Button>
              )}
              {puzzleComplete && (
                <Button onClick={() => {}}>next puzzle</Button>
              )}
              {/* <Button 
                // onClick={() => { append({ role: "user", content: "Create a lesson for a beginner to learn about king safety." })}}
                onClick={async () => { const r = await fetch("/train/api/lessons", { method: "POST" }); alert(await r.text()); }}
                >
                  Do it
              </Button>
              <Button 
                // onClick={() => { append({ role: "user", content: "Create a lesson for a beginner to learn about king safety." })}}
                onClick={async () => { 
                  (async () => {
                    const res = await fetch("/train/api/lessons", { method: "GET" });
                    const puzzles = await res.json();

                    const puzzle = puzzles[0];

                    const temp = new Chess(puzzle.starting_fen);
                    temp.move(puzzle.moves.split(" ")[0])

                    if ((temp.turn() === "w" && orientation === "black") || (temp.turn() === "b" && orientation === "white"))
                      swapOrientation();

                    setPosition(temp.fen());
                    // console.log();
                  })(); 
                }}
                >
                  again
              </Button> */}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Train;
