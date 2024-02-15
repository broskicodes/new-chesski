import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet, faGear, faRightLong } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback } from "react";
import { useCoach } from "@/providers/CoachProvider/context";

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
          <button className="button" onClick={handleFlip}>
            <FontAwesomeIcon icon={faRetweet} />
          </button>
        </Tooltip>
        <Tooltip content="Reset Game">
          <button className="button" onClick={handleReset}>
          <FontAwesomeIcon icon={faRefresh} />
          </button>
        </Tooltip>
        <Tooltip content="Undo Move">
          <button className="button" onClick={handleUndo}>
            <FontAwesomeIcon icon={faReply} />
          </button>
        </Tooltip>
        {/* <div className={`${}`}>
        <Tooltip content="Next Move">
          <button className="button" onClick={handleUndo}>
            <FontAwesomeIcon icon={faRightLong} />
          </button>
        </Tooltip>
        </div> */}
      </div>
      {/* <div>
        <Tooltip content="Gameplay Settings">
          <button className="button">
            <FontAwesomeIcon icon={faGear} />
          </button>
        </Tooltip>
      </div> */}
    </div>
  )
}