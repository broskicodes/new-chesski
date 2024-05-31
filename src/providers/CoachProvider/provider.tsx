import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { CoachContext, CoachProviderContext, Query } from "./context";
import { useChat } from "ai/react";
import { CreateMessage, Message, ToolCall } from "ai";
import { useChess } from "../ChessProvider/context";
import posthog from "posthog-js";
import { useUserData } from "../UserDataProvider/context";
import { PositionEval, useEvaluation } from "../EvaluationProvider/context";
import { API_URL, Experience } from "@/utils/types";
import { experienceToTitle, setLocalMessages } from "@/utils/clientHelpers";
import { useAnalysis } from "../AnalysisProvider";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

export const CoachProvider = ({ children }: PropsWithChildren) => {
  const [processing, setProcessing] = useState(false);
  const [insights, setInsights] = useState("");
  const [phases, setPhases] = useState("");
  const [lastExp, setLastExp] = useState("");
  const [expProc, setExpProc] = useState(false);

  const [gameMessages, setGameMessages] = useState<ChatCompletionMessage[]>([]);
  // const [queries, setQueries] = useState<Query[]>([]);

  const { experienceText } = useUserData();
  const { orientation, game, turn } = useChess();

  const clearInsights = useCallback(() => {
    setInsights("");
  }, []);


  const getExplantion = useCallback(
    async (prompt: string) => {
      setExpProc(true);

      const res = await fetch(`${API_URL}/coach/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        }),
      });
  
      const msg = await res.json();

      setExpProc(false);
      setLastExp(msg.content.split('"""').at(-2)!);
    },
    [],
  );

  const reqGameAnalysis = useCallback(
    async (prompt: string) => {
      setProcessing(true);

      const res = await fetch(`${API_URL}/coach/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        }),
      });
  
      const msg = await res.json();

      setInsights(msg.content.split('"""').at(-2)!);
      setPhases(msg.content.split("'''").at(-2)!);
      setProcessing(false);
    },
    [],
  );

  const analyzePosition = useCallback(async (latestEval: PositionEval) => {
    setProcessing(true);

    const res = await fetch(`${API_URL}/coach/position`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eval: latestEval.evaluation,
        engineLine: latestEval.pv.join(" "),
        skill: experienceText,
        orientation: orientation,
        turn: turn,
        fen: game.fen(),
        ascii: game.ascii(),
        pgn: game.history().join(" "),
      }),
    });

    const msg = await res.json();

    setGameMessages([...gameMessages, msg]);
    setLocalMessages([msg], false);
    setProcessing(false);
  }, [experienceText, orientation, turn, game]);

  const addGameMessage = useCallback(
    (msg: ChatCompletionMessage) => {
      setGameMessages([...gameMessages, msg]);
    },
    [gameMessages],
  );

  const clearGameMessages = useCallback(() => {
    setGameMessages([]);
    setLocalMessages([], true);
  }, []);

  const value: CoachProviderContext = useMemo(
    () => ({
      processing,
      insights,
      phases,
      gameMessages: gameMessages,
      lastExp,
      expProc,
      analyzePosition,
      addGameMessage: addGameMessage,
      clearGameMessages: clearGameMessages,
      setGameMessages,
      getExplantion: getExplantion,
      reqGameAnalysis,
      clearInsights,
    }),
    [
      processing,
      expProc,
      lastExp,
      gameMessages,
      insights,
      phases,
      analyzePosition,
      addGameMessage,
      clearGameMessages,
      getExplantion,
      reqGameAnalysis,
      clearInsights,
    ],
  );

  return (
    <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
  );
};
