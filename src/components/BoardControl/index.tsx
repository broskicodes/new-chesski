import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback } from "react";
import { useChat } from "ai/react";

interface BoardControlProps {
  setMessages?: (messages: any[]) => void;
}

export const BoardControl = ({ setMessages }: BoardControlProps) => {
  const { undo, swapOrientation, reset } = useChess();

  const handleFlip = useCallback(() => {
    swapOrientation();
  }, [swapOrientation]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleReset = useCallback(() => {
    reset();
    setMessages && setMessages([]);
  }, [reset, setMessages]);

  return (
    <div className="flex flex-row space-x-2">
      <Tooltip content="Flip Board">
        <button className="button" onClick={handleFlip}>
          <FontAwesomeIcon icon={faRetweet} />
        </button>
      </Tooltip>
      <Tooltip content="Undo Move">
        <button className="button" onClick={handleUndo}>
          <FontAwesomeIcon icon={faReply} />
        </button>
      </Tooltip>
      <Tooltip content="Reset Game">
        <button className="button" onClick={handleReset}>
        <FontAwesomeIcon icon={faRefresh} />
        </button>
      </Tooltip>
    </div>
  )
}