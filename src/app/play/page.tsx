"use client";
import './styles.css';

import { BoardControl } from "@/components/BoardControl";
import { Chessboard } from '@/components/Chessboard';
import { EvalBar } from "@/components/EvalBar";
import { GameLogs } from "@/components/GameLogs";
import { SignUpModal } from '@/components/SignUpModal';
import { Tooltip } from "@/components/Tooltip";
import { useAuth } from '@/providers/AuthProvider/context';
import { useChess } from '@/providers/ChessProvider/context';
import { useStockfish } from '@/providers/StockfishProvider/context';
import { SkillLevel } from '@/utils/types';
import { useEffect, useRef, useState } from 'react';

export default function Play() {
  const [gameStateChanged, setGameStateChanged] = useState(0);
  const [pastFen, setPastFen] = useState("");
  const [disabled, setDisabled] = useState(false);

  const { session, supabase } = useAuth();
  const { initEngine } = useStockfish();
  const { game } = useChess();

  const contentRef = useRef<HTMLDivElement>(null);
  const chessRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      const item = localStorage.getItem('userData');

      if (item) {
        const userData = JSON.parse(item);

        (async () => {
          const { data } = await supabase!.from('user_data')
            .select()
            .eq("uuid", session.id);

          const prevData = data && data[0] ? data[0] : {}
          const { error, data: d } = await supabase!.from("user_data")
            .upsert({
              uuid: session.id,
              ...prevData,
              ...userData,
              updated_at: new Date()
            })
            .select();
            
          if (!error) {
            localStorage.removeItem("userData")
          }
        })();
      }
    }
  }, [session, supabase])

  useEffect(() => {
    if (!session && game.fen() !== pastFen) {
      setGameStateChanged(gameStateChanged + 1);
      setPastFen(game.fen())
    }
  }, [game, session, gameStateChanged, pastFen])

  useEffect(() => {
    if (!session && gameStateChanged > 5) {
      setDisabled(true);
    }
  }, [gameStateChanged, session]);

  useEffect(() => {
    if (session) {
      setDisabled(false)
    }
  }, [session]);

  useEffect(() => {
    initEngine(true, SkillLevel.Beginner, 2000);
  }, [initEngine]);

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth < 640) {
        divRef.current!.style.height = `${window.innerHeight - chessRef.current!.offsetHeight - 8}px`;
        divRef.current!.style.width = `${window.innerWidth > 480 ? 480 : window.innerWidth}px`
      } else {

      }
    }

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [contentRef.current, chessRef.current, divRef.current])

  return (
    <div className="sm:pt-20">
      <SignUpModal disabled={disabled} />      
      <div className="page-content" ref={contentRef}>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0" ref={chessRef}>
          <Tooltip content="Evaluation Bar">
            <EvalBar />
          </Tooltip>
          <div className="flex flex-col space-y-2">
            <div className='relative'>
              <Chessboard showMoveStrength={true} />
            </div>
            <BoardControl />
          </div>
        </div>
        <div className='sm:w-fit sm:h-fit' ref={divRef}>
          <GameLogs />
        </div>
      </div>
    </div>
  )
}