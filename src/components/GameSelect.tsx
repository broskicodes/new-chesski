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
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  className?: string;
}

interface PlayerData {
  rating: number;
  username: string;
}

interface GameData {
  class: string;
  pgn: string;
  black: PlayerData;
  white: PlayerData;
  result: string;
}

export const GameSelect = ({ className }: Props) => {
  const [pgnInput, setPgnInput] = useState("");
  const [pgnColor, setPgnColor] = useState("white");
  const [pgnRes, setPgnRes] = useState("1-0");

  const [badPgn, setBadPgn] = useState(false);
  const [currTab, setCurrTab] = useState("chesscom");

  const [chesscomEdit, setChesscomEdit] = useState(false);
  const [lichessEdit, setlichessEdit] = useState(false);

  const [chesscomArchives, setChesscomArchives] = useState<string[]>([]);
  const [caIdx, setCaIdx] = useState(0);
  const [chesscomGames, setChesscomGames] = useState<GameData[]>([]);
  const [chesscomMonth, setChesscomMonth] = useState("");

  const [lichessGames, setLichessGames] = useState<GameData[]>([]);

  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  const { setGamePgn, moves } = useAnalysis();
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
            pgn: res.pgn,
            result: res.status === "draw" ? "1/2-1/2" : res.winner === "white" ? "1-0" : "0-1"
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
            pgn: res.pgn,
            result: res.pgn.split(" ").at(-1)
          }
        })

      // console.log(games);
      setChesscomGames(games.reverse());
    })()
  }, [chesscomArchives, caIdx])

  return (
    <Dialog>
      <DialogTrigger>
        <Button className={className}>
          {moves.length === 0 ? "Select Game" : "Select New Game"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Game to Ananalyze</DialogTitle>
          {currTab === "chesscom" && <DialogDescription>{chesscomMonth}</DialogDescription>}
        </DialogHeader>
          <Tabs defaultValue="chesscom" className="w-full" onValueChange={(val) => { setSelectedGame(null); setCurrTab(val); }}>
            <TabsList className="w-full">
              <TabsTrigger value="chesscom" className="w-full">Chess.com</TabsTrigger>
              <TabsTrigger value="lichess" className="w-full">Lichess</TabsTrigger>
              <TabsTrigger value="pgn" className="w-full">PGN</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="chesscom">
              <Label>Username</Label>
              <div className="flex flex-row space-x-2">
                <Input 
                  value={chesscom ?? ""} 
                  disabled={!chesscomEdit} 
                  onChange={({ target }) => updateChesscom(target.value) } 
                  />
                {!chesscomEdit && (
                  <Button className="w-32" onClick={() => {
                    setChesscomEdit(true);
                  }}>
                    Edit
                  </Button>
                )}
                {chesscomEdit && (
                  <Button className="w-32" onClick={() => {
                    setChesscomEdit(false);
                    saveData();
                  }}>
                    Save
                  </Button>
                )}
              </div>
              <ScrollArea className="h-60 overflow-y-auto my-4">
                {chesscomGames.map((g, i) => {

                  return (
                    <div key={i} className={`flex flex-row justify-between space-y-1 cursor-pointer hover:bg-indigo-600/10 rounded-md ${g.pgn === selectedGame?.pgn ? "bg-indigo-600/25" : ""}`}
                      onClick={() => {
                        setSelectedGame(g);
                      }}>
                      <div>{g.class}</div>
                      <div>
                        <span>{g.white.username} ({g.white.rating})</span>{" vs. "}
                        <span>{g.black.username} ({g.black.rating})</span>
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
              <div className="w-full flex flex-row space-x-2">
                <Button className="w-full" disabled={caIdx === 0} onClick={() => { caIdx > 0 && setCaIdx(caIdx - 1); }}>
                  prev
                </Button>
                <Button className="w-full" disabled={caIdx >= chesscomArchives.length - 1} onClick={() => { caIdx < chesscomArchives.length - 1 && setCaIdx(caIdx + 1); }}>
                  next
                </Button>
              </div>
            </TabsContent>
            <TabsContent className="mt-4" value="lichess">
              <Label>Username</Label>
              <div className="flex flex-row space-x-2">
                <Input 
                  value={lichess ?? ""} 
                  disabled={!lichessEdit} 
                  onChange={({ target }) => updateLichess(target.value) } 
                  />
                {!lichessEdit && (
                  <Button className="w-32" onClick={() => {
                    setlichessEdit(true);
                  }}>
                    Edit
                  </Button>
                )}
                {lichessEdit && (
                  <Button className="w-32" onClick={() => {
                    setlichessEdit(false);
                    saveData();
                  }}>
                    Save
                  </Button>
                )}
              </div>
              <ScrollArea className="h-60 overflow-y-auto my-4">
                {lichessGames.map((g, i) => {

                  return (
                    <div key={i} className={`flex flex-row justify-between space-y-1 cursor-pointer hover:bg-indigo-600/10 rounded-md ${g.pgn === selectedGame?.pgn ? "bg-indigo-600/25" : ""}`}
                      onClick={() => {
                        setSelectedGame(g);
                      }}>
                      <div>{g.class}</div>
                      <div className="text-right">
                        <span>{g.white.username} ({g.white.rating})</span>{" vs. "}
                        <span>{g.black.username} ({g.black.rating})</span>
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
            </TabsContent>
            <TabsContent className="mt-4" value="pgn">
              <DialogTitle>Enter a PGN</DialogTitle>
                <div className="grid grid-cols-2 gap-y-2 my-4">
                  <Label>Board Orientation</Label>
                  <Select value={pgnColor} onValueChange={(val) => setPgnColor(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>Result</Label>
                  <Select value={pgnRes} onValueChange={(val) => setPgnColor(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-0">1-0</SelectItem>
                      <SelectItem value="0-1">0-1</SelectItem>
                      <SelectItem value="1/2-1/2">1/2-1/2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Label>PGN</Label>
                <Textarea 
                  value={pgnInput} 
                  onChange={({ target }) => { setPgnInput(target.value); setBadPgn(false); } } 
                  placeholder="Enter PGN string here"
                  className="h-32"
                  />
                {badPgn && (
                  <div className="text-red-600 mt-2">Invalid PGN</div>
                )}
                <DialogClose ref={dialogCloseRef} className="hidden"></DialogClose>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            {currTab !== "pgn" &&  (
              <DialogClose className="w-full">
                <Button disabled={!selectedGame} className="w-full" onClick={() => {
                  const color = selectedGame?.white.username === lichess || selectedGame?.white.username === chesscom ? "white" : "black";

                  setGamePgn(selectedGame!.pgn, color, selectedGame!.result);
                }}>
                  Select
                </Button>
              </DialogClose>
            )}
            {currTab === "pgn" && (
              <Button className="w-full" onClick={() => {
                if (pgnInput === "" || !setGamePgn(pgnInput, pgnColor, pgnRes)) {
                  setBadPgn(true);
                } else {
                  dialogCloseRef.current?.click();
                }
              }}>Confirm</Button>
            )}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}