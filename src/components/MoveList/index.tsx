import { Classification, useEvaluation } from "@/providers/EvaluationProvider/context";
import { Card } from "../ui/card"
import { useChess } from "@/providers/ChessProvider/context";
import { getClassColor } from "@/utils/clientHelpers";
import { Dispatch, SetStateAction } from "react";
import { useAnalysis } from "@/providers/AnalysisProvider";

export const MoveList = () => {
  const { evals } = useEvaluation();
  const { game, playContinuation, setLastMoveHighlightColor } = useChess();
  const { moves, classifications, setMoveIdx } = useAnalysis();

  return (
    <Card className="h-60 overflow-y-scroll">
      <div className="grid grid-cols-2 gap-4">
        {moves.map((move, i) => (
          <div 
            key={i}
            className={`cursor-pointer ${game.fen() === evals[i + 1]?.evaledFen ? "bg-indigo-100" : ""}`}
            onClick={() => {
              playContinuation(moves.slice(0, i+1), true);
              setLastMoveHighlightColor(getClassColor(classifications[i]))
              setMoveIdx(i);
            }}>
            <span style={{ color: getClassColor(classifications[i]) }}>{move}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}