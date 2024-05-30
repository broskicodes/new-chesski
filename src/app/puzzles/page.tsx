"use client";
import "./styles.css";

import { BottomNav } from "@/components/BottomNav";
import { ChatPopupTrigger } from "@/components/ChatPopupTrigger";
import { Navbar } from "@/components/Navbar";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/providers/AuthProvider/context";
import { useChess } from "@/providers/ChessProvider/context";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { useUserData } from "@/providers/UserDataProvider/context";
import { experienceToTitle } from "@/utils/clientHelpers";
import { API_URL } from "@/utils/types";
import { Capacitor } from "@capacitor/core";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface PuzzleDescs {
  id: string;
  description: string;
}

export default function Puzzles() {
  const [puzzles, setPuzzles] = useState<PuzzleDescs[]>([]);
  const [pIdx, setPIdx] = useState(0);

  // const [dailyPuzzles, setDailyPuzzles] = useState(0);
  // const [compPuzzlesLoaded, setCompPuzzlesLoaded] = useState(false);

  const { session, supabase } = useAuth();
  const { orientation } = useChess();
  const { experienceText, weaknesses, experience, isPro } = useUserData();
  const { wrongMove, puzzleComplete, retryPuzzle, setPuzzle, restartPuzzle, hint, hintNum, puzzle } = usePuzzle();

  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const trigRef = useRef<HTMLButtonElement>(null);

  // const getDailyPuzzles = useCallback(async () => {
  //   if (!session || !supabase) {
  //     return;
  //   }

  //   setCompPuzzlesLoaded(false);

  //   const { data, error } = await supabase
  //     .from("completed_puzzles")
  //     .select("created_at")
  //     .eq("user_id", session.id);

  //   if (data) {
  //     const das = data.filter((a) => {
  //       const ad = new Date(a.created_at);
  //       const td = new Date();

  //       return ad.getDate() === td.getDate() && ad.getMonth() === td.getMonth();
  //     })
  //     setDailyPuzzles(das.length);
  //   } else {
  //     setDailyPuzzles(0);
  //   }

  //   setCompPuzzlesLoaded(true);
  // }, [session, supabase]);


  const getCustomPuzzles = useCallback(async () => {
    const platform = Capacitor.getPlatform();
    let ps: any;

    const res = await fetch(`${API_URL}/puzzles`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        experience: experienceText ? experienceText : experienceToTitle(experience),
        weaknesses
      })
    });

    ps = await res.json();
    
    setPIdx(0);
    setPuzzle(ps[0].id);
    setPuzzles(ps.map((p: any) => {
      return {
        id: p.id,
        description: p.content
      }
    }));

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

  // useEffect(() => {
  //   if (session && !isPro && dailyPuzzles >= 5) {
  //     trigRef.current?.click();
  //   }
  // }, [session,  dailyPuzzles, isPro])

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth < 640) {
        divRef.current!.style.height = `${window.innerHeight - chessRef.current!.offsetHeight - 8}px`;
        divRef.current!.style.width = `${window.innerWidth > 480 ? 480 : window.innerWidth}px`;
      } else {
      }
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [chessRef.current, divRef.current]);

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

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-16 h-full justify-center sm:h-min">
        <div
          className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:space-y-0"
          ref={chessRef}
        >
          {/* <EvalBar /> */}
          <div className="flex flex-col space-y-2">
            <div>
              <PuzzleBoard />
            </div>
          </div>
        </div>
        <div ref={divRef}>
          <Card className="w-full h-full sm:h-fit sm:w-96 flex flex-col items-center">
            <CardHeader className="flex items-center pb-2 pt-4">
              {puzzles.length > 0 && !wrongMove && !puzzleComplete && <span className="font-semibold text-xl sm:text-2xl">{orientation.at(0)?.toUpperCase() + orientation.slice(1)} to move</span>}
              {puzzles.length > 0 && puzzleComplete && <span className="font-semibold text-xl sm:text-2xl">Puzzle Complete</span>}
              {puzzles.length > 0 && wrongMove && <span className="font-semibold text-xl sm:text-2xl">Incorrect Move</span>}
              {puzzles.length === 0 && <span className="font-semibold text-xl sm:text-2xl">Find Puzzles</span>}
            </CardHeader>
            {puzzle && (
              // <CardContent className="pb-4 h-full">
                <ScrollArea className="px-6 pb-4 pt-0 h-full">
                  <span className="text-lg sm:text-xl">Rating: <span className="font-semibold">{puzzle?.rating}</span></span>
                  {/* <span>This puzzle trains: {puzzle?.themes.join(" ")}</span> */}
                  <div>
                    <span className="text-lg sm:text-xl font-semibold">Themes:</span>
                    <ul className="list-disc pl-6 text-sm sm:text-base">
                      {puzzles[pIdx].description.split("Weaknesses: ").at(-1)?.split(", ").map((w, i) => {
                        const out = w.startsWith("and ") ? w.slice(4) : w;

                        return (
                        <li key={i}>{out.at(0)?.toUpperCase() + out.slice(1)}</li>
                      )})}
                    </ul>
                  </div>
                </ScrollArea>
              // </CardContent>
            )}
            <CardFooter className="w-full">
            {/* <Button onClick={async () => await embed()}>embed</Button> */}

              {(puzzles.length === 0 || (puzzleComplete && puzzles.length - 1 === pIdx)) && (
                <div className="w-full">
                  <Button className="w-full"  onClick={async () => {
                    // if (dailyPuzzles < 5 || isPro) {
                      // await getDailyPuzzles();
                      await getCustomPuzzles();
                    // } else {
                      // trigRef.current?.click();
                    // }
                  }}>Custom Puzzles</Button>
                </div>
              )}
              {(puzzles.length > 0 && (!puzzleComplete || puzzles.length - 1 > pIdx)) && (
                <div className="w-full flex flex-row space-x-2">
                  {wrongMove && (<Button className="w-full" onClick={retryPuzzle}>Retry</Button>)}
                  {!puzzleComplete && !wrongMove && <Button className="w-full" onClick={() => { hint(hintNum);  }}>{hintNum === 1 ? "Hint" : "Move" }</Button>}
                  {puzzleComplete && (<Button className="w-full" onClick={restartPuzzle}>Restart</Button>)}
                  {(puzzleComplete || wrongMove) && (
                    <Button className="w-full" onClick={async() => { 
                      // if (dailyPuzzles < 5 || isPro) {
                        // await getDailyPuzzles();

                        setPuzzle(puzzles[pIdx + 1].id); 
                        setPIdx(pIdx + 1);
                      // } else {
                        // trigRef.current?.click();
                      // }
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