import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet, faGear, faUser, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback, useState } from "react";
import { useCoach } from "@/providers/CoachProvider/context";
import { Button } from "../ui/button";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useEvaluation } from "@/providers/EvaluationProvider/context";
import { Sidebar } from "../Sidebar";
import { useSetup } from "@/providers/SetupProvider";
import { StreakIcon } from "../StreakIcon";

export const BoardControl = ({ className }: { className?: string }) => {
  const { undo, swapOrientation, reset } = useChess();
  const { clearGameMessages } = useCoach();
  const { clearEvaluations } = useEvaluation();
  const { settingUp, setSettingUp, toggleModal } = useSetup();

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
    <div className={`flex flex-row justify-between items-center ${className}`}>
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
      </div>
      <StreakIcon />
      {!settingUp && (
        <div className="flex flex-row space-x-2 items-center">
          <div className="sm:hidden">
            <Sidebar>
              <Button size="icon">
                <FontAwesomeIcon icon={faUser} />
              </Button>
            </Sidebar>
          </div>
          <Tooltip content="Gameplay Settings">
            <Button 
              size="icon"
              onClick={() => {
                toggleModal(true);
              }}>
              <FontAwesomeIcon icon={faGear} />
            </Button>
          </Tooltip>
        </div>
      )}
      {settingUp && (
        <div className="flex flex-row space-x-2">
          <Tooltip content="Confirm">
            <Button
              size="icon"
              onClick={() => {
                setSettingUp(false);
                toggleModal(true);
              }}>
              <FontAwesomeIcon icon={faCheck} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}