"use client";
import { BottomNav } from "@/components/BottomNav";
import { ChatPopupTrigger } from "@/components/ChatPopupTrigger";
import { Navbar } from "@/components/Navbar";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { Button } from "@/components/ui/button";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { useRef } from "react";

export default function Puzzles() {

  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const { wrongMove, retryPuzzle } = usePuzzle();

  return (
    <div>
      <Navbar />
      <BottomNav />
      <ChatPopupTrigger hideMobile={true} />

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-16 h-full sm:h-min">
        <div
          className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:space-y-0"
          ref={chessRef}
        >
          {/* <EvalBar /> */}
          <div className="flex flex-col space-y-2">
            <div>
              <PuzzleBoard  />
            </div>
          </div>
        </div>
        <div ref={divRef}>
          {wrongMove && <Button onClick={retryPuzzle}>Retry</Button>}
        </div>
      </div>
    </div>
  )
}