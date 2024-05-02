import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Classification, PositionEval, useEvaluation } from "./EvaluationProvider/context";
import { Player, useChess } from "./ChessProvider/context";
import { getClassColor } from "@/utils/clientHelpers";
import { useStockfish } from "./StockfishProvider/context";
import { Chess } from "chess.js";
import { useCoach } from "./CoachProvider/context";
import { useToast } from "@/components/ui/use-toast";
import posthog from "posthog-js";
import { useAuth } from "./AuthProvider/context";

export interface AnalysisProviderContext {
  analyzed: boolean;
  classified: boolean;
  gamePgn: string | null;
  color: string | null;
  result: string | null;
  moves: string [];
  moveIdx: number;
  classifications: Classification[];
  setMoveIdx: Dispatch<SetStateAction<number>>;
  setGamePgn: (id: string, pgn: string, color: string, result: string) => boolean;
  firstMove: () => void;
  lastMove: () => void;
  nextMove: () => void;
  prevMove: () => void;
  analyzeGame: () => void;
  getMoveExplaination: (evl: PositionEval, lm: string[], classif: Classification) => void;
}

export const AnalysisContext = createContext<AnalysisProviderContext>({
  analyzed: false,
  classified: false,
  gamePgn: null,
  color: null,
  result: null,
  moves: [],
  moveIdx: -1,
  classifications: [],
  setMoveIdx: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  setGamePgn: (_pgn) => {
    throw new Error("AnalysisProvider not initialized");
  },
  firstMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  lastMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  nextMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  prevMove: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  analyzeGame: () => {
    throw new Error("AnalysisProvider not initialized");
  },
  getMoveExplaination: (_e, _lm) => {
    throw new Error("AnalysisProvider not initialized");
  }
});

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }: PropsWithChildren) => {
  const [id, setId] = useState<string | null>(null);
  const [gamePgn, setGamePgnState] = useState<string |null>(null);
  const [color, setColor] = useState<string |null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [moves, setMoves] = useState<string[]>([]);
  const [moveIdx, setMoveIdx] = useState(-1);
  const [classifications, setClassifications] = useState<Classification[]>([]);

  const [analyzed, setAnalyzed] = useState(false);
  const [classified, setClassified] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(false);


  const { toast } = useToast();

  const { session, supabase } = useAuth();
  const { reqGameAnalysis, clearInsights, getExplantion, processing, insights, phases } = useCoach();
  const { isReady, initEngine, startSearch } = useStockfish();
  const { evals, evaluateMoveQuality, clearEvaluations } = useEvaluation();
  const { game, gameOver, orientation, setLastMoveHighlightColor, makeMove, undo, swapOrientation, reset, playContinuation } = useChess();

  const setGamePgn = useCallback((id: string, pgn: string, color: string, result: string) => {
    const tempGame = new Chess();
    try {
      tempGame.loadPgn(pgn)
    } catch (e) {
      return false;
    }

    setId(id);
    setColor(color);
    setResult(result);
    setGamePgnState(pgn);
    return true;
  }, []);

  const nextMove = useCallback(() => {
    if (!analyzed) return;

    if (moveIdx + 1 < moves.length && playContinuation(moves.slice(0, moveIdx + 2), true)) {
      setLastMoveHighlightColor(getClassColor(classifications[moveIdx + 1]))
      setMoveIdx(moveIdx + 1);
    }
  }, [playContinuation, moveIdx, moves, analyzed, classifications, setLastMoveHighlightColor]);

  const prevMove = useCallback(() => {
    if (!analyzed) return;

    if (undo()) {
      setLastMoveHighlightColor(getClassColor(classifications[moveIdx - 1]))
      setMoveIdx(moveIdx - 1);
    }
  }, [undo, moveIdx, analyzed, classifications, setLastMoveHighlightColor]);

  const firstMove = useCallback(() => {
    if (!analyzed) return;

    reset();
    setLastMoveHighlightColor("")
    setMoveIdx(-1);
  }, [reset, analyzed, setLastMoveHighlightColor]);

  const lastMove = useCallback(() => {
    if (!analyzed) return;

    playContinuation(moves.slice(0, moves.length), true);
    setLastMoveHighlightColor(getClassColor(classifications[moves.length - 1]))
    setMoveIdx(moves.length - 1);
  }, [playContinuation, moves, analyzed, classifications, setLastMoveHighlightColor]);

  const analyzeGame = useCallback(() => {
    const userPrompt = `Please analyze this game:
<moves>
${
  moves.map((m, i) => {
    return `<entry><san>${m}</san> <class>${classifications[i]}</class> <eval>${evals[i].evaluation}</eval>\n`
  })
}
</moves>
<result>${result}</result>
<player>${orientation}</player>

Be sure to analyze the game from ${orientation}'s perspective. 
Closely follow all instructions in the system prompt. 
Be sure to use the correct delimitres for relevant sections and pay careful attention to where to use apostrophes vs quotes.`;

    reqGameAnalysis({
      role: "user",
      content: userPrompt
    });
  }, [reqGameAnalysis, evals, classifications, orientation, result, moves]);

  const getMoveExplaination = useCallback((evl: PositionEval, lm: string[], classif: Classification) => {
    const m = lm.slice(0, -1).join(" ");
    const pre = new Chess();
    pre.loadPgn(m);

    const post = new Chess();
    post.loadPgn(lm.join(" "))


    const userPrompt = `Here is some information about the position:
<pre>${pre.ascii()}</pre>
<post>${post.ascii()}</post>
<moves>${m}</moves>
<played>${lm.at(-1)}</played>
<class>${classif}</class>
<best>${evl.bestMove}</best>
<line>${evl.pv.join(" ")}</line>
<eval>${evl.mate ? `mate in ${evl.evaluation}` : evl.evaluation}</eval>

Please explain why ${lm.at(-1)} is a ${classif}`;

    getExplantion({
      role: "user",
      content: userPrompt
    })
  }, [getExplantion]);

  useEffect(() => {
    if (analyzed && classified) {
      posthog.capture("game_analyzed");

      toast({
        title: "Game Analyzed.",
        description: "Now generating insights"
      });
    }
  }, [analyzed, classified, toast]);

  useEffect(() => {
    if (analyzed && classified && !saved) {
      if (!session || !supabase) return;

      (async () => {
        const { data, error } = await supabase.from("analyzed_games")
          .insert({
            id,
            pgn: gamePgn,
            color: color,
            result,
            moves,
            classifications,
            evals
          })

          console.log(data, error);
      })();

      setSaved(true);
    }
  }, [session, supabase, analyzed, classified, saved, id, gamePgn, color, result, moves, classifications, evals])

  useEffect(() => {
    if (!gamePgn) return;

    const tempGame = new Chess();
    try {
      tempGame.loadPgn(gamePgn)  
    } catch (e) {
      return;
    }

    reset();
    // setGamePgnState(null);
    setAnalyzed(false);
    setClassified(false);
    setGenerated(false);
    setMoves(tempGame.history());
    setMoveIdx(-1);
    setClassifications([]);
    clearEvaluations();
    clearInsights();

    toast({
      title: "Analyzing your game",
      description: "This may take a minute."
    });
  }, [gamePgn, reset, clearEvaluations, toast, clearInsights]);

  useEffect(() => {
    if (color && color !== orientation) {
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
      
      // @ts-ignore
      setClassifications(classis);
      setClassified(true);
    }
  }, [analyzed, evals, evaluateMoveQuality, moves, classified]);

  useEffect(() => {
    if (analyzed && classified && !generated) {
      setGenerated(true);
      analyzeGame();
    }
  }, [analyzed, classified, generated, analyzeGame]);

  useEffect(() => {
    if (generated && !processing) {
      toast({
        title: "Insights Generated",
      });
    }
  }, [generated, processing, toast]);

  useEffect(() => {
    if (generated && !processing) {
      if (!session || !supabase) return;

      (async () => {
        const { data, error } = await supabase.from("analyzed_games")
          .update({
            insights,
            phase_rev: phases
          })
          .eq("id", id)

          console.log(data, error);
      })();

      setSaved(true);
    }
  }, [session, supabase, generated, processing, insights, phases])

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
  }, [gameOver, analyzed, game])

  useEffect(() => {
    const evalHandler = (event: Event) => {
      const { multiPv } = (event as CustomEvent).detail;

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
    classified,
    analyzed,
    gamePgn,
    color,
    result,
    moves: moves,
    moveIdx,
    classifications,
    setMoveIdx,
    setGamePgn,
    firstMove,
    lastMove,
    nextMove,
    prevMove,
    analyzeGame,
    getMoveExplaination
  }), [
    classified,
    analyzed,
    gamePgn,
    color,
    result,
    moves,
    moveIdx,
    classifications,
    firstMove,
    lastMove,
    setGamePgn,
    nextMove,
    prevMove,
    analyzeGame,
    getMoveExplaination
  ])

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
} 
