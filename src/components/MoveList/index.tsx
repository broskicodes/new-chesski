import { Classification, useEvaluation } from "@/providers/EvaluationProvider/context";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useChess } from "@/providers/ChessProvider/context";
import { getClassColor } from "@/utils/clientHelpers";
import { useCallback, useEffect, useState } from "react";
import { useAnalysis } from "@/providers/AnalysisProvider";
import { ScrollArea } from "../ui/scroll-area";
import { GameSelect } from "../GameSelect";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "../Tooltip";
import { useCoach } from "@/providers/CoachProvider/context";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";

export const MoveList = () => {
  const { evals } = useEvaluation();
  const { weaknesses } = useCoach()
  const { game, playContinuation, setLastMoveHighlightColor } = useChess();
  const { moves, classifications, classified, setMoveIdx, nextMove, prevMove, firstMove, lastMove, getMoveExplaination } = useAnalysis();

  const [height, setHeight] = useState(1);
  const [qualMap, setQualMap] = useState<{ [key in Classification]: [number, number] } | null>(null);

  const getMoveMsg = useCallback((classif: Classification) => {
    let msg: string;

    switch (classif) {
      case Classification.Book:
        msg = "is a book move";
        break;
      case Classification.Best:
        msg = "is best";
        break;
      case Classification.Good:
        msg = "is good";
        break;
      case Classification.Inaccuracy:
        msg = "is an inaccuracy";
        break;
      case Classification.Mistake:
        msg = "is a mistake";
        break;
      case Classification.Blunder:
        msg = "is a blunder";
        break;
      default:
        msg = "is trash";
    }

    return msg;
  }, [])

  useEffect(() => {
    setQualMap((_) => {
      const prev: { [key in Classification]: [number, number] } = {
        [Classification.Best]: [0, 0],
        [Classification.Good]: [0, 0],
        [Classification.Book]: [0, 0],
        [Classification.Inaccuracy]: [0, 0],
        [Classification.Mistake]: [0, 0],
        [Classification.Blunder]: [0, 0],    
      }

      classifications.forEach((qual, i) => {
        prev[qual][i % 2] += 1;
      })

      // console.log(prev)
      return prev;
    })
  }, [classifications])

  useEffect(() => {    
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setHeight(0);
        return;
      } else if (window.innerWidth < 1024) {
        setHeight(480);
        return;
      }
      setHeight(window.innerHeight - 196);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card style={height ? { height } : {}} className={`w-full sm:w-96 py-2 sm:py-4 px-2 flex flex-col ${height ? "" : "h-full"}`}>
      {moves.length === 0 && (
        <CardHeader className="py-2 px-0 mb-2 text-center">
          <CardTitle className="text-xl">Choose a game to analyze</CardTitle>
          <GameSelect className="w-full text-lg font-semibold" />
        </CardHeader>
      )}
      {moves.length > 0 && (
        <CardHeader className="py-2 px-0 mb-2 text-center">
          <CardTitle className="text-xl">Analysis in progress</CardTitle>
          <GameSelect className="w-full text-lg font-semibold" />
        </CardHeader>
      )}
      <ScrollArea className="h-full px-2">
        {classified && (
          <div className="w-full flex flex-col mb-2">
            <span className="text-center text-xl font-bold">Game Review</span>
            <div className="flex flex-row justify-between w-full font-bold mb-1">
              <span>White</span>
              <span>Black</span>
            </div>
            {qualMap && Object.keys(qualMap).map((row) => {
              return (
                // @ts-ignore
                <div key={row} className="font-bold flex flex-row justify-between" style={{ color: getClassColor(row) }}>
                  <div>{
                    // @ts-ignore
                    qualMap[row][0]
                  }</div>
                  <span>{row}</span> 
                  <div>{
                    // @ts-ignore
                    qualMap[row][1]
                  }</div>
                </div>
              )
            })}
          </div>
        )}
        {moves.length > 0 && <span className="text-lg font-semibold">Moves</span>}
        <Table className="grid grid-cols-2 gap-y-1 gap-x-8 font-semibold">
          <TableBody>
            {Array.from({length: Math.ceil(moves.length / 2)}, (_, i) => i).map(i => [moves[2*i], moves[2*i + 1]]).map((movePair, i) => (
              <TableRow key={i} className="flex flex-col">
                <div>
                <TableCell className="text-gray-500">
                  {i+1}.
                </TableCell>
                <TableCell
                  className={`cursor-pointer rounded-sm hover:bg-indigo-100/25 ${game.fen() === evals[2*i + 1]?.evaledFen ? "bg-indigo-100/50" : ""}`}
                  onClick={() => {
                    playContinuation(moves.slice(0, 2*i + 1), true);
                    setLastMoveHighlightColor(getClassColor(classifications[2*i]))
                    setMoveIdx(2*i);
                  }}>
                    <span style={classifications[2*i] === Classification.Blunder || classifications[2*i] === Classification.Mistake || classifications[2*i] === Classification.Inaccuracy ? { color: getClassColor(classifications[2*i]) } : {}}>{movePair[0]}</span>
                  </TableCell>
                  <TableCell
                  className={`cursor-pointer rounded-sm hover:bg-indigo-100/25 ${game.fen() === evals[2*i + 2]?.evaledFen ? "bg-indigo-100/50" : ""}`}
                  onClick={() => {
                    playContinuation(moves.slice(0, 2*i + 2), true);
                    setLastMoveHighlightColor(getClassColor(classifications[2*i + 1]))
                    setMoveIdx(2*i + 1);
                  }}>
                    <span style={classifications[2*i + 1] === Classification.Blunder || classifications[2*i + 1] === Classification.Mistake || classifications[2*i + 1] === Classification.Inaccuracy ?  { color: getClassColor(classifications[2*i + 1]) } : {}}>{movePair[1]}</span>
                  </TableCell>
                  </div>
                  {[1, 2].map((num) => {
                    return (
                      <div className={`flex flex-col ${game.fen() === evals[2*i + num]?.evaledFen ? "" : "hidden"} `}>
                        <div>{movePair[num - 1]} {getMoveMsg(classifications[2*i + num - 1])}</div>
                        <div>{evals[2*i + num]?.mate ? `M${evals[2*i + num].evaluation}` : evals[2*i + num]?.evaluation /  100} </div>
                        <div className="flex flex-row">
                          <Button onClick={() => {
                              getMoveExplaination(evals[2*i + num - 1], moves.slice(0, 2*i + num), classifications[2*i + num - 1])
                            }}>
                            Explain
                          </Button>
                          {!(classifications[2*i + num - 1] === Classification.Best) && (
                            <Button 
                              onClick={() => {
                                const bestMove = evals[2*i + num - 1].bestMove;
                                playContinuation([...moves.slice(0, 2*i + num - 1), bestMove], true);
                                setLastMoveHighlightColor(getClassColor(Classification.Best));
                              }}>
                              Best Move
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {weaknesses && weaknesses.length > 0 && (
          <div className="flex flex-col mt-2 mb-1">
            <span className="font-bold text-lg">Weaknesses and Insights</span>
            <ReactMarkdown>
              {weaknesses}
            </ReactMarkdown>
          </div>
        )}
      </ScrollArea>
      <CardFooter className="py-0 px-0 flex justify-center">
        <div className="flex flex-row space-x-4">
          <Tooltip content="First Move"><FontAwesomeIcon size="xl" icon={faAnglesLeft} onClick={() => firstMove() } /></Tooltip>
          <Tooltip content="Previous Move"><FontAwesomeIcon size="xl" icon={faAngleLeft} onClick={() => prevMove() } /></Tooltip>
          <Tooltip content="Next Move"><FontAwesomeIcon size="xl" icon={faAngleRight} onClick={() => nextMove() } /></Tooltip>
          <Tooltip content="Last Move"><FontAwesomeIcon size="xl" icon={faAnglesRight} onClick={() => lastMove() } /></Tooltip>
        </div>
      </CardFooter>
    </Card>
  )
}