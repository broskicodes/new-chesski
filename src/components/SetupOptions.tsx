import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useChess } from "@/providers/ChessProvider/context";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Color, PieceSymbol, validateFen } from "chess.js";
import { useToast } from "./ui/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useSetup } from "@/providers/SetupProvider";
import Image from "next/image";
import { useDrag } from "react-dnd";
import { DragablePiece } from "./DragablePiece";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";

export const SetupOptions = () => {
  const [height, setHeight] = useState(1);
  const [fen, setFen] = useState("");
  const [pgn, setPgn] = useState("");
  const [toMove, setToMove] = useState<"w" | "b">("w");
  const [bkc, setBkc] = useState(true);
  const [bqc, setBqc] = useState(true);
  const [wkc, setWkc] = useState(true);
  const [wqc, setWqc] = useState(true);

  const { game, setPosition, setCastling, setTurn, clear, swapOrientation, reset } = useChess();
  const { removing, setRemoving, setSettingUp, toggleModal } = useSetup();
  const { toast } = useToast()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setHeight(0);
        return;
      } else if (window.innerWidth < 1024) {
        setHeight(480);
        return;
      }
      setHeight(window.innerHeight - 164);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setFen(game.fen());
  }, [game]);

  // useEffect(() => {
    // setCastling(wkc, wqc, bkc, bqc);
  // }, [wkc, wqc, bkc, bqc, setCastling])

  return (
    <div className="h-full">
      <Card
        style={height ? { height } : {}}
        className={`w-full sm:w-[420px] py-2 sm:py-4 px-2 flex flex-col ${height ? "" : "h-full"}`}
      >
        <CardHeader className="py-1">
          <CardTitle className="text-xl sm:text-2xl">Setup Position</CardTitle>
        </CardHeader>
        <ScrollArea>
          <div className="flex flex-col items-center">
            <div className="mb-2">
              {["w", "b"].map((c) => (
                <div className="flex flex-row">
                  {["p", "n", "b", "r", "q", "k"].map((p) => (
                    <DragablePiece p={{ color: c as Color, type: p as PieceSymbol}} />
                  ))}
                </div>
              ))}
            </div>
            <div className="w-full pl-1 flex flex-row space-x-1 items-center mb-2">
              <Label>Remove Pieces</Label>
              <Switch checked={removing} onCheckedChange={(c) => setRemoving(c) } />
            </div>
            <Select value={toMove} onValueChange={(val) => setToMove(val as ("w" | "b"))}>
              <SelectTrigger>
                <SelectValue placeholder="Turn" />
              </SelectTrigger> 
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Turn</SelectLabel>
                  <SelectItem value="w">White to move</SelectItem>
                  <SelectItem value="b">Black to move</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="mt-4 grid grid-cols-2 px-2 w-full">
              <div className="flex flex-col space-y-1">
                <Label>White</Label>
                <span className="flex flex-row space-x-1 items-center">
                  <Checkbox checked={wkc} onCheckedChange={(val) => setWkc(!!val)} /><Label>{"(O-O)"}</Label>
                </span>
                <span className="flex flex-row space-x-1 items-center">
                  <Checkbox checked={wqc} onCheckedChange={(val) => setWqc(!!val)} /><Label>{"(O-O-O)"}</Label>
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Black</Label>
                <span className="flex flex-row space-x-1 items-center">
                  <Checkbox checked={bkc} onCheckedChange={(val) => setBkc(!!val)} /><Label>{"(O-O)"}</Label>
                </span>
                <span className="flex flex-row space-x-1 items-center">
                  <Checkbox checked={bqc} onCheckedChange={(val) => setBqc(!!val)} /><Label>{"(O-O-O)"}</Label>
                </span>
              </div>
            </div>
            <Input className="mt-3" placeholder="Enter FEN" value={fen} onChange={({ target: { value } }) => { setFen(value); setPosition(value) }} />
            <div className="mt-4 flex flex-row space-x-2 w-full">
              <Button className="w-full" size="default" onClick={swapOrientation}>
                Flip
              </Button>
              <Button className="w-full" size="default" onClick={reset}>
                Reset
              </Button>
              <Button className="w-full" size="default" onClick={clear}>
                Clear
              </Button>
            </div>
            <Button
                size="default"
                className="mt-3 w-full"
                onClick={() => {
                  const res = validateFen(game.fen());
                  

                  if (res.ok) {
                    const turn = game.turn();
                    const kings = game.board()
                      .flat()
                      .filter((obj) => obj?.type === "k");

                    for (const k of kings) {
                      if (k?.color !== turn && game.isAttacked(k!.square, turn)) {
                        toast({
                          title: "Position is invalid",
                          description: `${turn === "b" ? "White" : "Black"} king can be taken`
                        });

                        return;
                      }
                    }

                    setCastling(wkc, wqc, bkc, bqc);
                    setTurn(toMove)
                    setSettingUp(false);
                    toggleModal(true);
                  } else {
                    toast({
                      title: "Position is invalid",
                      description: res.error
                    })
                  }
                }}
              >
                Finish
              </Button>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}