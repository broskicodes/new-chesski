import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Classification, useEvaluation } from "./EvaluationProvider/context";
import { Player, useChess } from "./ChessProvider/context";
import { getClassColor } from "@/utils/clientHelpers";
import { useStockfish } from "./StockfishProvider/context";
import { Chess } from "chess.js";
import { useCoach } from "./CoachProvider/context";

export interface AnalysisProviderContext {
  gamePgn: string | null;
  color: string | null;
  moves: string [];
  moveIdx: number;
  classifications: Classification[];
  setMoveIdx: Dispatch<SetStateAction<number>>;
  setGamePgn: (pgn: string, color: string) => boolean;
  nextMove: () => void;
  prevMove: () => void;
  getMoveComments: () => void;
}

export const AnalysisContext = createContext<AnalysisProviderContext>({
  gamePgn: null,
  color: null,
  moves: [],
  moveIdx: -1,
  classifications: [],
  setMoveIdx: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  setGamePgn: (_pgn) => {
    throw new Error("AnalysisProvider not initialized");
  },
  nextMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  prevMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  getMoveComments: () => {
    throw new Error("AnalysisProvider not initialized");
  }
});

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }: PropsWithChildren) => {
  const [gamePgn, setGamePgnState] = useState<string |null>(null);
  const [color, setColor] = useState<string |null>(null)

  const [moves, setMoves] = useState<string[]>([]);
  const [moveIdx, setMoveIdx] = useState(-1);
  const [classifications, setClassifications] = useState<Classification[]>([]);

  const [analyzed, setAnalyzed] = useState(false);
  const [classified, setClassified] = useState(false);

  const { reqGameAnalysis } = useCoach();
  const { isReady, initEngine, startSearch } = useStockfish();
  const { evals, evaluateMoveQuality, clearEvaluations } = useEvaluation();
  const { game, gameOver, orientation, setLastMoveHighlightColor, makeMove, undo, swapOrientation, reset } = useChess();

  const setGamePgn = useCallback((pgn: string, color: string) => {
    const tempGame = new Chess();
    try {
      tempGame.loadPgn(pgn)
    } catch (e) {
      return false;
    }

    setColor(color);
    setGamePgnState(pgn);
    return true;
  }, []);

  const nextMove = useCallback(() => {
    if (!analyzed) return;

    if (makeMove(moves[moveIdx + 1])) {
      setLastMoveHighlightColor(getClassColor(classifications[moveIdx + 1]))
      setMoveIdx(moveIdx + 1);
    }
  }, [makeMove, moveIdx, moves, analyzed, classifications, setLastMoveHighlightColor]);

  const prevMove = useCallback(() => {
    if (!analyzed) return;

    if (undo()) {
      setLastMoveHighlightColor(getClassColor(classifications[moveIdx - 1]))
      setMoveIdx(moveIdx - 1);
    }
  }, [undo, moveIdx, analyzed, classifications, setLastMoveHighlightColor]);

  const getMoveComments = useCallback(() => {
    const userPrompt = `Please analyze this game:
<moves>
${
  moves.map((m, i) => {
    return `<entry><san>${m}</san> <class>${classifications[i]}</class> <eval>${evals[i].evaluation}</eval>\n`
  })
}
</moves>
<result>1-0</result>
<player>${orientation}</player>

Be sure to analyze the game from ${orientation}'s perspective. Closely follow all instructions in the system prompt.`;

    reqGameAnalysis({
      role: "user",
      content: userPrompt
    });
  }, [reqGameAnalysis, evals, classifications, orientation])


  useEffect(() => {
    if (!gamePgn) return;

    const tempGame = new Chess();
    try {
      tempGame.loadPgn(gamePgn)  
    } catch (e) {
      return;
    }

    reset();
    setGamePgnState(null);
    setAnalyzed(false);
    setClassified(false);
    setMoves(tempGame.history());
    setMoveIdx(-1);
    setClassifications([]);
    clearEvaluations()
  }, [gamePgn, reset, clearEvaluations]);

  useEffect(() => {
    if (color && color !== orientation) {
      setColor(null);
      swapOrientation();
    }
  }, [color, orientation, swapOrientation]);

  useEffect(() => {
    initEngine(false);
  }, [initEngine])

  useEffect(() => {
    if (analyzed && !classified) {
      // console.log(evals)
      const classis = evals.slice(1)
        .map((ev, i) => {
          const qual = evaluateMoveQuality(evals[i], ev, moves[i], i % 2 === 0 ? Player.White : Player.Black);

          return qual;
        })
        .filter((c) => !!c);
      
      setClassified(true);
      // @ts-ignore
      setClassifications(classis)
    }
  }, [analyzed, evals, evaluateMoveQuality, moves, classified])

  useEffect(() => {
    if (
      moves.length > 0 &&
      isReady &&
      game.fen() !== evals.at(-1)?.evaledFen &&
      !analyzed
    ) {
      startSearch();
    }
  }, [game, evals, isReady, moves, analyzed, startSearch]);

  useEffect(() => {
    if (analyzed) return;

    if (gameOver) {
      const customEvent = new CustomEvent("setEval", {
        detail: {
          multiPv: 1,
          pv: [],
          cp: 0,
          mate: 0,
          fen: game.fen(),
        },
      });

      window.dispatchEvent(customEvent);
    }
  }, [gameOver, analyzed])

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { multiPv } = (event as CustomEvent).detail;
      // console.log(game.isGameOver())

      if (multiPv === 1) {
        if (moveIdx + 1 < moves.length) {
          makeMove(moves[moveIdx + 1])
          setMoveIdx(moveIdx + 1);

        } else {
          setAnalyzed(true);
          setMoveIdx(-1);
          reset();
        }
      }
    };

    window.addEventListener("setEval", evalHandler);

    return () => {
      window.removeEventListener("setEval", evalHandler);
    };
  }, [makeMove, reset, moves, moveIdx]);

  const value: AnalysisProviderContext = useMemo(() => ({
    gamePgn,
    color,
    moves: moves,
    moveIdx,
    classifications,
    setMoveIdx,
    setGamePgn,
    nextMove,
    prevMove,
    getMoveComments
  }), [
    gamePgn,
    color,
    moves,
    moveIdx,
    classifications,
    setGamePgn,
    nextMove,
    prevMove,
    getMoveComments
  ])

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
} 
