import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogOverlay, DialogTrigger } from '@/components/ui/dialog';
import { useChess } from '@/providers/ChessProvider/context';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { useCoach } from '@/providers/CoachProvider/context';
import { useEvaluation } from '@/providers/EvaluationProvider/context';
import { useAuth } from '@/providers/AuthProvider/context';

enum GameResult {
  Win = 0,
  Loss = 1,
  Draw = 2
}

enum DrawType {
  Stalemate = 0,
  Repetition = 1,
  MoveRule = 2,
  InsufficientMaterial = 3
}

export const GameModal = () => {
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [drawType, setDrawType] = useState<DrawType | null>(null);

  
  const { clearEvaluations } = useEvaluation();
  const { clearGameMessages } = useCoach();
  const { session, signInWithOAuth } = useAuth();
  const { game, gameOver, turn, orientation, reset } = useChess();

  const gameModalTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(()=> {
    if (gameOver && game.isGameOver()) {
      gameModalTriggerRef.current?.click();

      if (game.isCheckmate()) {
        if (turn === orientation) {
          setGameResult(GameResult.Loss)
        } else {
          setGameResult(GameResult.Win);
        }
      } else if (game.isDraw()) {
        setGameResult(GameResult.Draw);

        if (game.isStalemate()) {
          setDrawType(DrawType.Stalemate)
        } else if (game.isThreefoldRepetition()) {
          setDrawType(DrawType.Repetition)
        } else if (game.isInsufficientMaterial()) {
          setDrawType(DrawType.InsufficientMaterial)
        }
      }
    }
  }, [game, gameOver, turn, orientation]);

  return (
    <Dialog >
      <DialogTrigger ref={gameModalTriggerRef} className='hidden' />
      <DialogContent>
        <DialogHeader className='flex flex-col items-center space-y-0'>
          <DialogTitle className='text-2xl'>Game Over</DialogTitle>
          <DialogDescription>{(() => {
            let desc: string;

            switch (gameResult) {
              case GameResult.Win:
                desc = "Congradulations, you won!";
                break;
              case GameResult.Loss:
                desc = "You lost. Better luck next time!";
                break;
              case GameResult.Draw:
                switch (drawType) {
                  case DrawType.Stalemate:
                    desc = "Draw. The game ended in stalemate.";
                    break;
                  case DrawType.Repetition:
                    desc = "Draw by threefold repetition.";
                    break;
                  case DrawType.InsufficientMaterial:
                    desc = "Draw, insufficient material";
                    break;
                  default: 
                    desc = "The game ended in a draw."
                }
                break;
              default:
                desc = "The game came to a magical ending!"
            }

            return desc;
          })()}</DialogDescription>
        </DialogHeader>
        {session && (
          <DialogClose className='w-full'>
            <Button className='w-full' onClick={() => { 
              reset();
              clearEvaluations();
              clearGameMessages();
            }}>
              Play Again
            </Button>
          </DialogClose>
        )}
        {!session && (
          <div className='flex flex-col space-y-2'>
            <div className='flex flex-col '>
              <DialogTitle>Learn something?</DialogTitle>
              <DialogDescription className='text-black'>Sign up to get more out of Chesski!</DialogDescription>
            </div>
            <Button onClick={signInWithOAuth}>
              Sign in with Google
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}