"use client";

import { Chessboard } from "@/components/Chessboard"
import { useStockfish } from "@/providers/StockfishProvider/context";
import { ReactNode, use, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider/context";
import { PgnData, SkillLevel } from "@/utils/types";
import { pgnToList } from "@/utils/clientHelpers";
import { useChess } from "@/providers/ChessProvider/context";
import { Chess } from "chess.js";

import "./styles.css"

interface Position {
  fen: string;
  eval: number;
  move: string | null;
  moveIdx: number;
  bestMove: string;
  strength?: string;
  mate: boolean;
}

export default function Home() {
  const [pgn, setPgn] = useState<PgnData | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [moveIdx, setMoveIdx] = useState(0);
  const [evals, setEvals] = useState<Position[]>([]);

  const [analyzed, setAnalyzed] = useState(false);

  const { session, supabase } = useAuth();
  const { initEngine, isReady, evaluated, startSearch } = useStockfish();
  const { makeMove, game, turn, setPosition, swapOrientation } = useChess();

  const updatePosition = useCallback((pos: Position) => {
    console.log(pos.strength, pos.eval, pos.moveIdx)
    setPosition(pos.fen);
    setMoveIdx(pos.moveIdx);
  }, [setPosition]);

  const evaluateMoveQuality = useCallback((prevPosition: Position, currentPosition: Position): string => {
    let evalDiff = currentPosition.eval - prevPosition.eval;

    const chess = new Chess(prevPosition.fen);
    const moveComp = chess.move(prevPosition.bestMove);

    if (currentPosition.move === moveComp.san) {
      return 'Best';
    }

    if (turn == "black") {
      evalDiff = -evalDiff;
    }

    if (evalDiff <= -150) {
      return 'Blunder';
    } else if (evalDiff <= -50) {
      return 'Mistake';
    } else if (evalDiff < -25) {
      return 'Inaccuracy';
    } else {
      return 'Good';
    }
  }, [turn]);

  const renderList = useCallback(() => {
    const rows: ReactNode[] = [];
    for (let i = 0; i < evals.slice(1).length / 2; i++) {
      rows.push(
        <tr key={i}>
          <th className="bg-slate-200 w-12">{i + 1}.</th>
          {evals.slice(1).slice(2 * i, 2 * i + 2).map((m) => (
            <td
              key={m.fen}
              className={`move ${m.strength?.toLowerCase()}`}
              onClick={() => updatePosition(m)}
            >
              {m.move}
            </td>
          ))}
        </tr>,
      );
    }

    return (
      <table className={""}>
        <tbody>{rows}</tbody>
      </table>
    );
  }, [evals, game, setPosition]);


  useEffect(() => {
    if (session) {
      initEngine(false);
    }
  }, [session, initEngine]);

  useEffect(() => {
    if (!supabase || !session) {
      return
    }

    if (pgn) return;

    (async () => {
      const { data, error } = await supabase
        .from('user_chess_accounts')
        .select('chesscom_name, lichess_name')
        .eq('uuid', session.id)

        if (error) {
          console.error('Error fetching user chess accounts', error);
          return;
        }
      
        const account = data[0];

        if (account) {
          const { data: pgns, error: pgnError} = await supabase
            .from('game_pgns')
            .select('*')
            .or(`white.eq.${account.chesscom_name},white.eq.${account.lichess_name},black.eq.${account.chesscom_name},black.eq.${account.lichess_name}`)
            .order('played_at', { ascending: false })
            .limit(1);

          if (pgnError) {
            console.log(pgnError);
            return;
          }

          if (pgns[0]) {
            setPgn({ ...pgns[0], played_at: new Date(pgns[0].played_at)})
            if (pgns[0].black === account.chesscom_name || pgns[0].black === account.lichess_name)
              swapOrientation();
          }
        }
    })();
  }, [supabase, session, pgn, swapOrientation]);

  useEffect(() => {
    if (!pgn) return;

    if (moves.length > 0) return;

    setMoves(pgnToList(pgn.moves))
  }, [pgn, moves]);

  useEffect(() => {
    if (evaluated) return;
    console.log("hi")
    startSearch();
  }, [moves, isReady]);

  // useEffect(() => {
  //   if (analyzed) return;

  //   if (evaluated && evals.at(-1)?.fen !== game.fen()) {
  //     // console.log(cp);
  //     setEvals([...evals, { fen: game.fen(), eval: cp, move: moves.at(moveIdx - 1) ?? null, bestMove: bestMove!, mate: mate > 0  }]);
      // if (moveIdx < moves.length) {
      //   makeMove(moves[moveIdx]);
      //   setMoveIdx(moveIdx + 1);
      //   startSearch();
      // }
  //   }
  // }, [game, analyzed, evals, moves, moveIdx, cp, evaluated, bestMove]);

  const [shouldSearch, setShouldSearch] = useState(false);
  useEffect(() => {
    if (shouldSearch) {
      if (startSearch()) {
        setShouldSearch(false);
      };
    }
  }, [shouldSearch, startSearch])

  useEffect(() => {
    if (evals.length > 1) {
      setEvals([
        ...evals.slice(0, -1),
        {
          ...evals.at(-1)!,
          strength: evaluateMoveQuality(evals.at(-2)!, evals.at(-1)!)
        }
      ])

    }
  }, [evals.length, evaluateMoveQuality]);

  useEffect(() => {
    if (evals.length === moves.length + 1 && evals.length > 0)
      setAnalyzed(true);
  }, [evals, moves]);

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { bestMove, cp, mate } = (event as CustomEvent).detail;


      setEvals([...evals, { fen: game.fen(), eval: mate ? mate : cp, move: moves[moveIdx - 1] ?? null, moveIdx: moveIdx, bestMove: bestMove!, mate: mate > 0  }]);

      if (moveIdx < moves.length) {
        makeMove(moves[moveIdx]);
        setMoveIdx(moveIdx + 1);
        setShouldSearch(true);
      }
    }

    window.addEventListener("setEval", evalHandler);

    return () => {
      window.removeEventListener("setEval", evalHandler);
    }
  }, [game, evals, moves, moveIdx, makeMove])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && moveIdx < moves.length) {
        updatePosition(evals[moveIdx + 1]);
      } else if (event.key === 'ArrowLeft' && moveIdx > 0) {
        updatePosition(evals[moveIdx - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveIdx, moves, evals, setPosition]);

  return (
    <div className="flex flex-row space-x-8 items-center">
      <div>
        <Chessboard />
      </div>
      <div className="move-list">
        <div className="content">
          {renderList()}
        </div>
      </div>
      <button onClick={() => {
        fetch("/import", {
          method: "POST"
        });
      }}>
        get
      </button>
    </div>
  )
}