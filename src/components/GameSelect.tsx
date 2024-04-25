import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useUserData } from "@/providers/UserDataProvider/context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { useAnalysis } from "@/providers/AnalysisProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

interface PlayerData {
  rating: number;
  username: string;
}

interface GameData {
  class: string;
  pgn: string;
  black: PlayerData;
  white: PlayerData;
}

export const GameSelect = () => {
  const [pgnInput, setPgnInput] = useState("");
  const [pgnColor, setPgnColor] = useState("white");

  const [chesscomEdit, setChesscomEdit] = useState(false);
  const [lichessEdit, setlichessEdit] = useState(false);

  const [chesscomArchives, setChesscomArchives] = useState<string[]>([]);
  const [caIdx, setCaIdx] = useState(0);
  const [chesscomGames, setChesscomGames] = useState<GameData[]>([]);
  const [chesscomMonth, setChesscomMonth] = useState("");

  const [lichessGames, setLichessGames] = useState<GameData[]>([]);

  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  const { setGamePgn } = useAnalysis();
  const { chesscom, lichess, updateChesscom, updateLichess, saveData } = useUserData();

  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lichess && !lichessEdit) {
      (async () => {
        const lichessGameRes = await fetch(
          `https://lichess.org/api/games/user/${lichess}?max=50&pgnInJson=true`,
          { 
            headers: {
              Accept: "application/x-ndjson"
            }
          }
        );
        try {
          var lichessGameData = (await lichessGameRes.text()).split("\n").slice(0, -1).map((obj) => JSON.parse(obj));
        } catch (e) {
          setLichessGames([]);
          return;
        }

        const games = lichessGameData.map((res) => {
          return {
            class: res.perf,
            black: {
              rating: res.players.black.rating,
              username: res.players.black.user.name
            },
            white: {
              rating: res.players.white.rating,
              username: res.players.white.user.name
            },
            pgn: res.pgn
          }
        })
      
        setLichessGames(games);
        // console.log(lichessGameData)

      })();
    }
  }, [lichess, lichessEdit])

  useEffect(() => {
    if (chesscom && !chesscomEdit) {
      (async () => {
        const chesscomarchiveRes = await fetch(
          `https://api.chess.com/pub/player/${chesscom}/games/archives`,
        );
        const chesscomarchiveData = await chesscomarchiveRes.json();

        // console.log(chesscomarchiveData);
        setChesscomArchives(chesscomarchiveData.archives);
        setCaIdx(chesscomarchiveData.archives.length - 1);
      })()
    }
  }, [chesscom, chesscomEdit]);

  useEffect(() => {
    if (!chesscomArchives || chesscomArchives.length === 0) {
      setChesscomMonth("");
      setChesscomGames([]);
      return;
    }

    (async () => {
      const month = chesscomArchives[caIdx].split("/").slice(-2).reverse().join("/")
      setChesscomMonth(month);

      const chesscomarchiveRes = await fetch(
        chesscomArchives[caIdx],
      );
      const chesscomarchiveData = await chesscomarchiveRes.json();


      const games = chesscomarchiveData.games
        .filter((res: any) => res.rules === "chess")
        .map((res: any) => {
          return {
            class: res.time_class,
            black: {
              rating: res.black.rating,
              username: res.black.username
            },
            white: {
              rating: res.white.rating,
              username: res.white.username
            },
            pgn: res.pgn
          }
        })

      // console.log(games);
      setChesscomGames(games.reverse());
    })()
  }, [chesscomArchives, caIdx])

  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          Select Game
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Game to Ananalyze</DialogTitle>
          <DialogDescription>{chesscomMonth}</DialogDescription>
        </DialogHeader>
          <Tabs defaultValue="chesscom" className="w-full" onValueChange={() => setSelectedGame(null)}>
            <TabsList className="w-full">
              <TabsTrigger value="chesscom" className="w-full">Chess.com</TabsTrigger>
              <TabsTrigger value="lichess" className="w-full">Lichess</TabsTrigger>
              <TabsTrigger value="pgn" className="w-full">PGN</TabsTrigger>
            </TabsList>
            <TabsContent value="chesscom">
              <div className="flex flex-row space-x-2">
                <Input 
                  value={chesscom ?? ""} 
                  disabled={!chesscomEdit} 
                  onChange={({ target }) => updateChesscom(target.value) } 
                  />
                {!chesscomEdit && (
                  <Button onClick={() => {
                    setChesscomEdit(true);
                  }}>
                    Edit
                  </Button>
                )}
                {chesscomEdit && (
                  <Button onClick={() => {
                    setChesscomEdit(false);
                    saveData();
                  }}>
                    Save
                  </Button>
                )}
              </div>
              <div className="h-60 overflow-y-auto">
                {chesscomGames.map((g, i) => {

                  return (
                    <div key={i} className={`flex flex-row space-x-4 cursor-pointer ${g.pgn === selectedGame?.pgn ? "bg-gray-100" : ""}`}
                      onClick={() => {
                        setSelectedGame(g);
                      }}>
                      <div>{g.class}</div>
                      <div>
                        <span>{g.white.username} ({g.white.rating})</span> vs.
                        <span>{g.black.username} ({g.black.rating})</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div>
                <Button onClick={() => { caIdx > 0 && setCaIdx(caIdx - 1); }}>
                  prev
                </Button>
                <Button onClick={() => { caIdx < chesscomArchives.length - 1 && setCaIdx(caIdx + 1); }}>
                  next
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="lichess">
              <div className="flex flex-row space-x-2">
                <Input 
                  value={lichess ?? ""} 
                  disabled={!lichessEdit} 
                  onChange={({ target }) => updateLichess(target.value) } 
                  />
                {!lichessEdit && (
                  <Button onClick={() => {
                    setlichessEdit(true);
                  }}>
                    Edit
                  </Button>
                )}
                {lichessEdit && (
                  <Button onClick={() => {
                    setlichessEdit(false);
                    saveData();
                  }}>
                    Save
                  </Button>
                )}
              </div>
              <div className="h-60 overflow-y-auto">
                {lichessGames.map((g, i) => {

                  return (
                    <div key={i} className={`flex flex-row space-x-4 cursor-pointer ${g.pgn === selectedGame?.pgn ? "bg-gray-100" : ""}`}
                      onClick={() => {
                        setSelectedGame(g);
                      }}>
                      <div>{g.class}</div>
                      <div>
                        <span>{g.white.username} ({g.white.rating})</span> vs.
                        <span>{g.black.username} ({g.black.rating})</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
            <TabsContent value="pgn">
              <DialogTitle>Enter a PGN</DialogTitle>
                <div className="flex flex-row space-x-1">
                  <Label>Set Board Orientation</Label>
                  <Select value={pgnColor} onValueChange={(val) => setPgnColor(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea 
                  value={pgnInput} 
                  onChange={({ target }) => setPgnInput(target.value) } 
                  />
                <DialogClose ref={dialogCloseRef} className="hidden"></DialogClose>
                <Button onClick={() => {
                  if (pgnInput === "" || !setGamePgn(pgnInput, pgnColor)) {
                    console.log("bad pgn")
                  } else {
                    dialogCloseRef.current?.click();
                  }
                }}>Confirm</Button>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            {selectedGame && (
              <DialogClose>
                <Button onClick={() => {
                  const color = selectedGame.white.username === lichess || selectedGame.white.username === chesscom ? "white" : "black";

                  setGamePgn(selectedGame.pgn, color);
                }}>
                  Select
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}