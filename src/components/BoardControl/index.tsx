import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback, useState } from "react";
import { useCoach } from "@/providers/CoachProvider/context";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { getChessRatingCategory } from "@/utils/clientHelpers";
import { useEvaluation } from "@/providers/EvaluationProvider/context";
import { Sidebar } from "../Sidebar";

export const BoardControl = () => {
  const [engineSkill, setEngineSkill] = useState(1200);

  const { undo, swapOrientation, reset } = useChess();
  const { updateEngine, skillLvl } = useStockfish();
  const { clearGameMessages } = useCoach();
  const { clearEvaluations } = useEvaluation();

  const handleFlip = useCallback(() => {
    swapOrientation();
  }, [swapOrientation]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleReset = useCallback(() => {
    reset();
    clearEvaluations();
    clearGameMessages();
  }, [reset, clearGameMessages, clearEvaluations]);

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row space-x-2">
        <Tooltip content="Flip Board">
          <Button size="icon" onClick={handleFlip}>
            <FontAwesomeIcon icon={faRetweet} />
          </Button>
        </Tooltip>
        <Tooltip content="Reset Game">
          <Button size="icon" onClick={handleReset}>
          <FontAwesomeIcon icon={faRefresh} />
          </Button>
        </Tooltip>
        <Tooltip content="Undo Move">
          <Button size="icon" onClick={handleUndo}>
            <FontAwesomeIcon icon={faReply} />
          </Button>
        </Tooltip>
        {/* <div className={`${}`}>
        <Tooltip content="Next Move">
          <Button size="icon" onClick={handleUndo}>
            <FontAwesomeIcon icon={faRightLong} />
          </Button>
        </Tooltip>
        </div> */}
      </div>
      <div className="flex flex-row space-x-2">
        <div className="sm:hidden">
          <Sidebar>
            <Button size="icon">
              <FontAwesomeIcon icon={faUser} />
            </Button>
          </Sidebar>
        </div>
        <Popover>
          <PopoverTrigger>
            <Tooltip content="Gameplay Settings">
              <Button size="icon">
                <FontAwesomeIcon icon={faGear} />
              </Button>
            </Tooltip>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col space-y-1 mb-3">
              <CardTitle>Gameplay Settings</CardTitle>
              <CardDescription>{"Edit Chesski's behaviour and skill"}</CardDescription>
            </div>
            <div>
              <div className="flex flex-row space-x-2">
                <Label htmlFor="skill-slider" className="whitespace-nowrap">Skill Level</Label>
                  <Slider 
                    id="skill-slider"
                    max={2800}
                    min={1200}
                    defaultValue={[1200]}
                    step={100}
                    value={[engineSkill]}
                    onValueChange={(arr) => {
                      setEngineSkill(arr[0]);
                      updateEngine(true, getChessRatingCategory(arr[0]));
                    }}
                    />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}