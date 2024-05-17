"use client";
import "./styles.css";

import { BottomNav } from "@/components/BottomNav";
import { ChatPopupTrigger } from "@/components/ChatPopupTrigger";
import { Navbar } from "@/components/Navbar";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { useUserData } from "@/providers/UserDataProvider/context";
import { experienceToTitle } from "@/utils/clientHelpers";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface PuzzleDescs {
  id: string;
  description: string;
}

export default function Puzzles() {
  const [puzzles, setPuzzles] = useState<PuzzleDescs[]>([]);
  const [pIdx, setPIdx] = useState(0);

  const [dailyPuzzles, setDailyPuzzles] = useState(0);
  const [compPuzzlesLoaded, setCompPuzzlesLoaded] = useState(false);

  const { session, supabase } = useAuth();
  const { orientation } = useChess();
  const { experienceText, weaknesses, experience, isPro } = useUserData();
  const { wrongMove, puzzleComplete, retryPuzzle, setPuzzle, restartPuzzle, hint, hintNum } = usePuzzle();

  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const trigRef = useRef<HTMLButtonElement>(null);

  const getDailyPuzzles = useCallback(async () => {
    if (!session || !supabase) {
      return;
    }

    setCompPuzzlesLoaded(false);

    const { data, error } = await supabase
      .from("completed_puzzles")
      .select("created_at")
      .eq("user_id", session.id);

    if (data) {
      const das = data.filter((a) => {
        const ad = new Date(a.created_at);
        const td = new Date();

        return ad.getDate() === td.getDate() && ad.getMonth() === td.getMonth();
      })
      setDailyPuzzles(das.length);
    } else {
      setDailyPuzzles(0);
    }

    setCompPuzzlesLoaded(true);
  }, [session, supabase]);


  const getCustomPuzzles = useCallback(async () => {
    const res = await fetch("/api/puzzle", {
      method: "POST",
      body: JSON.stringify({
        experience: experienceText ? experienceText : experienceToTitle(experience),
        weaknesses
      })
    });

    const ps = await res.json();

    setPIdx(0);
    setPuzzles(ps.map((p: any) => {
      return {
        id: p.id,
        description: p.content
      }
    }));

    setPuzzle(ps[0].id);
  }, [setPuzzle, experienceText, experience, weaknesses])

  // const embed = useCallback(async () => {
  //   const res = await fetch("/api/puzzle/embed", {
  //     method: "POST",
  //     // body: JSON.stringify({
  //     //   experience: experienceText ? experienceText : experienceToTitle(experience),
  //     //   weaknesses
  //     // })
  //   });

  // }, [])

  // useEffect(() => {
  //   // console.log(puzzles);
  // }, [puzzles, pIdx])
  useEffect(() => {
    
  })

  useEffect(() => {
    if (session && !isPro && dailyPuzzles >= 5) {
      trigRef.current?.click();
    }
  }, [session,  dailyPuzzles, isPro])

  return (
    <div className="flex flex-col h-full justify-center">
      <Dialog>
        <DialogTrigger className="hidden" ref={trigRef} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Daily puzzle limit reached
            </DialogTitle>
            <DialogDescription>
              Want more? Claim your free trial now!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link href="/subscribe" target="_blank" className={`w-full text-xl ${buttonVariants({ size: "lg", variant: "default" })}`}>
              Claim Free Trial
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Navbar />
      <BottomNav />
      <ChatPopupTrigger hideMobile={true} />

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-16 h-full justify-center sm:h-min">
        <div
          className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:space-y-0"
          ref={chessRef}
        >
          {/* <EvalBar /> */}
          <div className="flex flex-col space-y-2">
            <div>
              <PuzzleBoard freeze={compPuzzlesLoaded && !!session && !isPro && dailyPuzzles >= 5} />
            </div>
          </div>
        </div>
        <div ref={divRef}>
          <Card className="w-full sm:w-96 flex flex-col items-center">
            <CardHeader className="flex items-center">
              {puzzles.length > 0 && !wrongMove && !puzzleComplete && <span className="font-semibold text-xl">{orientation.at(0)?.toUpperCase() + orientation.slice(1)} to move</span>}
              {puzzles.length > 0 && puzzleComplete && <span className="font-semibold text-xl">Puzzle Complete</span>}
              {puzzles.length > 0 && wrongMove && <span className="font-semibold text-xl">Incorrect Move</span>}
              {puzzles.length === 0 && <span className="font-semibold text-xl">Select a type of puzzles to play</span>}
            </CardHeader>
            <CardFooter className="w-full">
              {(puzzles.length === 0 || (puzzleComplete && puzzles.length - 1 === pIdx)) && (
                <div className="w-full">
                  <Button className="w-full"  onClick={async () => {
                    if (dailyPuzzles < 5 || isPro) {
                      await getDailyPuzzles();
                      await getCustomPuzzles();
                    } else {
                      trigRef.current?.click();
                    }
                  }}>Personalized Puzzles</Button>
                </div>
              )}
              {(puzzles.length > 0 && (!puzzleComplete || puzzles.length - 1 > pIdx)) && (
                <div className="w-full flex flex-row space-x-2">
                  {/* <Button onClick={async () => await embed()}>embed</Button> */}
                  {wrongMove && (<Button className="w-full" onClick={retryPuzzle}>Retry</Button>)}
                  {!puzzleComplete && !wrongMove && <Button className="w-full" onClick={() => { hint(hintNum);  }}>{hintNum === 1 ? "Hint" : "Move" }</Button>}
                  {puzzleComplete && (<Button className="w-full" onClick={restartPuzzle}>Restart</Button>)}
                  {(puzzleComplete || wrongMove) && (
                    <Button className="w-full" onClick={async() => { 
                      if (dailyPuzzles < 5 || isPro) {
                        await getDailyPuzzles();

                        setPuzzle(puzzles[pIdx + 1].id); 
                        setPIdx(pIdx + 1);
                      } else {
                        trigRef.current?.click();
                      }
                    }}>Next</Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}