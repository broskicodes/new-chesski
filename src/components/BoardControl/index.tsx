import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet, faGear, faRightLong } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback } from "react";
import { useCoach } from "@/providers/CoachProvider/context";
import { Button } from "../ui/button";

export const BoardControl = () => {
  const { undo, swapOrientation, reset } = useChess();
  const { clearGameMessages } = useCoach();

  const handleFlip = useCallback(() => {
    swapOrientation();
  }, [swapOrientation]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleReset = useCallback(() => {
    reset();
    clearGameMessages();
  }, [reset, clearGameMessages]);

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
      {/* <div>
        <Tooltip content="Gameplay Settings">
          <Button size="icon">
            <FontAwesomeIcon icon={faGear} />
          </Button>
        </Tooltip>
      </div> */}
    </div>
  )
}