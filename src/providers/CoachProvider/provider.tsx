import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { CoachContext, CoachProviderContext, Query } from "./context";
import { useChat } from "ai/react";
import { CreateMessage, Message, ToolCall } from "ai";
import { useChess } from "../ChessProvider/context";
import posthog from "posthog-js";
import { useUserData } from "../UserDataProvider/context";
import { useEvaluation } from "../EvaluationProvider/context";
import { Experience } from "@/utils/types";
import { experienceToTitle, setCurrMessages } from "@/utils/clientHelpers";
import { useAnalysis } from "../AnalysisProvider";

export const CoachProvider = ({ children }: PropsWithChildren) => {
  const [processing, setProcessing] = useState(false);
  const [weaknesses, setWeaknesses] = useState("");
  // const [queries, setQueries] = useState<Query[]>([]);

  const { experience } = useUserData();
  const { evals } = useEvaluation();
  const { orientation, game, turn } = useChess();

  const { append: appendAnal } = useChat({
    api: "/chat/coach/analysis",
    
    onFinish: (msg: Message) => {
      console.log(msg.content);
      setProcessing(false);
      setWeaknesses(msg.content.split('"""').at(-2)!)
    },
  });

  const {
    messages: gameMessages,
    append,
    setMessages,
  } = useChat({
    api: "/chat/coach/position",
    body: {
      skill: experienceToTitle(experience),
      orientation: orientation,
      turn: turn,
      fen: game.fen(),
      ascii: game.ascii(),
      pgn: game.history().join(" "),
    },
    onFinish: (msg: Message) => {
      console.log(msg.content);

      setCurrMessages([msg], false);
      posthog.capture("ai_msg_sent");
      setProcessing(false);
    },
    // experimental_onToolCall: async (_msgs: Message[], toolCalls: ToolCall[]) => {
    // if (toolCalls.length > 0) {
    //   const call = toolCalls.at(-1);

    //   if (call?.function.name !== "advise") {
    //     return;
    //   }

    //   const args = JSON.parse(call?.function.arguments);
    //   setMessages([...gameMessages, {
    //     id: Math.random().toString(36).substring(7),
    //     role: "assistant",
    //     content: args.advice
    //   }]);
    //   setQueries(args.queries);
    //   setProcessing(false);

    //   // console.log(args)
    // }
    // },
  });

  const {
    append: appendExplanationContext,
    setMessages: addExplanationContext,
    reload,
  } = useChat({
    api: "/chat/coach/explanations",
    onFinish: (msg: Message) => {
      posthog.capture("ai_msg_sent");
      setMessages([...gameMessages, msg]);
      // findQueries(msg);
    },
  });

  const clearInsights = useCallback(() => {
    setWeaknesses("");
  }, []);

  const reqGameAnalysis = useCallback((msg: Message | CreateMessage) => {
    setProcessing(true);
    appendAnal(msg);
  }, [appendAnal]);

  const addGameMessage = useCallback(
    (msg: Message) => {
      setMessages([...gameMessages, msg]);
    },
    [setMessages, gameMessages],
  );

  const appendGameMessage = useCallback(
    (msg: Message | CreateMessage) => {
      setProcessing(true);
      append(msg);
    },
    [append],
  );

  const clearGameMessages = useCallback(() => {
    setMessages([]);
    setCurrMessages([], true);
  }, [setMessages]);

  const getExplantion = useCallback(
    (query: string) => {
      setProcessing(true);

      const moves = game.history();
      const fen = game.fen();

      addExplanationContext([
        {
          id: Math.random().toString(36).substring(7),
          role: "user",
          content: `The user's query is in response to this message: ${gameMessages.at(-1)?.content}`,
        },
        {
          id: Math.random().toString(36).substring(7),
          role: "user",
          content: `The user is playing as ${orientation}. The current position is ${fen}. The moves leading up to this position are ${moves.join(" ")}. ${turn === "white" ? "Black" : "White"} just played ${moves.at(-1)}.`,
        },
        {
          id: Math.random().toString(36).substring(7),
          role: "user",
          content: `The user's query is: ${query}`,
        },
      ]);

      reload();
    },
    [gameMessages, game, orientation, turn, addExplanationContext, reload],
  );

  const value: CoachProviderContext = useMemo(
    () => ({
      processing,
      weaknesses,
      gameMessages: gameMessages,
      addGameMessage: addGameMessage,
      appendGameMessage: appendGameMessage,
      clearGameMessages: clearGameMessages,
      setGameMessages: setMessages,
      getExplantion: getExplantion,
      reqGameAnalysis,
      clearInsights
    }),
    [
      processing,
      gameMessages,
      weaknesses,
      appendGameMessage,
      addGameMessage,
      clearGameMessages,
      setMessages,
      getExplantion,
      reqGameAnalysis,
      clearInsights
    ],
  );

  return (
    <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
  );
};
