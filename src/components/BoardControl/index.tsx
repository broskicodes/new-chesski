import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faRefresh, faRetweet, faGear, faUser, faCheck, faFlag, faLeftLong, faRightLong } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "@/components/Tooltip";
import { useChess } from "@/providers/ChessProvider/context";
import { useCallback, useState } from "react";
import { useCoach } from "@/providers/CoachProvider/context";
import { Button, buttonVariants } from "../ui/button";
import { useStockfish } from "@/providers/StockfishProvider/context";
import { useEvaluation } from "@/providers/EvaluationProvider/context";
import { Sidebar } from "../Sidebar";
import { useSetup } from "@/providers/SetupProvider";
import { StreakIcon } from "../StreakIcon";
import { useGame } from "@/providers/GameProvider";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


export const BoardControl = ({ className }: { className?: string }) => {
  const { undo, swapOrientation, reset, doubleUndo } = useChess();
  const { clearGameMessages } = useCoach();
  const { clearEvaluations } = useEvaluation();
  const { settingUp, setSettingUp, toggleModal } = useSetup();
  const { gameId, complete, resign, clearGame, nextMove, prevMove, moveIdx, moves } = useGame();

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
      {!gameId && (
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
      )}
      {gameId && (
        !complete 
          ? (
            <div className="flex flex-row space-x-2">
              <Dialog>
                <Tooltip content="Resign">
                  <DialogTrigger className={buttonVariants({ size: "icon"})}>              
                    <FontAwesomeIcon icon={faFlag} />
                  </DialogTrigger>
                </Tooltip>
                <DialogContent>
                  <DialogHeader className="flex flex-col items-center">
                    <DialogTitle>Resign?</DialogTitle>
                    <DialogDescription>{"You'll still be able to review it"}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row space-x-2 w-full">
                    <DialogClose asChild className="w-full">
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose className="w-full">
                      <Button 
                        variant="default"
                        className="w-full"
                        onClick={resign}
                        >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Tooltip content="Undo Move">
                <Button size="icon" onClick={doubleUndo}>
                  <FontAwesomeIcon icon={faReply} />
                </Button>
              </Tooltip>
            </div>
          )
          : (
            <div className="flex flex-row space-x-2">
              <Tooltip content="Play Again">
                <Button size="icon" onClick={() => {
                  handleReset();
                  clearGame();
                }}>
                  <FontAwesomeIcon icon={faRefresh} />
                </Button>
              </Tooltip>
              <Tooltip content="Previous Move">
                <Button size="icon" onClick={prevMove} disabled={moveIdx === -1}>
                  <FontAwesomeIcon icon={faLeftLong} />
                </Button>
              </Tooltip>
              <Tooltip content="Next Move">
                <Button size="icon" onClick={nextMove}disabled={moveIdx === moves.length - 1} >
                  <FontAwesomeIcon icon={faRightLong} />
                </Button>
              </Tooltip>
            </div>
          )
      )}
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