import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { CoachContext, Query } from "./context";
import { useChat } from "ai/react";
import { CreateMessage, Message, ToolCall } from "ai";
import { useChess } from "../ChessProvider/context";

export const CoachProvider = ({ children }: PropsWithChildren) => {
  const [processing, setProcessing] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);

  const { orientation, game, turn } = useChess();

  const { append: findQueries } = useChat({
    api: "/chat/coach/queries",
    experimental_onToolCall: async (_msgs: Message[], toolCalls: ToolCall[]) => {
      if (toolCalls.length > 0) {
        const call = toolCalls.at(-1);

        if (call?.function.name !== "generate_user_queries") {
          return;
        }

        const args = JSON.parse(call?.function.arguments);
        setQueries(args.queries);
      }
    },
    onFinish: (msg: Message) => {
      setProcessing(false);
    }
  });

  const { messages: gameMessages, append, setMessages } = useChat({
    api: "/chat/coach/moves",
    // onFinish: (msg: Message) => {
    //   // setProcessing(false);
    //   findQueries(msg);
    // }
    experimental_onToolCall: async (_msgs: Message[], toolCalls: ToolCall[]) => {
      if (toolCalls.length > 0) {
        const call = toolCalls.at(-1);

        if (call?.function.name !== "advise") {
          return;
        }

        const args = JSON.parse(call?.function.arguments);
        setMessages([...gameMessages, {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: args.advice
        }]);
        setQueries(args.queries);
        setProcessing(false);

        // console.log(args)
      }
    },
  });
  
  const { append: appendExplanationContext, setMessages: addExplanationContext, reload } = useChat({
    api: "/chat/coach/explanations",
    onFinish: (msg: Message) => {
      // setProcessing(false);
      setMessages([...gameMessages, msg]);
      findQueries(msg);
    }
  });

  const addGameMessage = useCallback((msg: Message) => {
    setMessages([...gameMessages, msg]);
  }, [setMessages, gameMessages]);

  const appendGameMessage = useCallback((msg: Message | CreateMessage) => {
    setProcessing(true);
    append(msg);
  }, [append]);

  const clearGameMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const getExplantion = useCallback((query: string) => {
    setProcessing(true);

    const moves = game.history();
    const fen = game.fen();

    addExplanationContext([
      {
        id: Math.random().toString(36).substring(7),
        role: "user",
        content: `The user's query is in response to this message: ${gameMessages.at(-1)?.content}`
      },
      {
        id: Math.random().toString(36).substring(7),
        role: "user",
        content: `The user is playing as ${orientation}. The current position is ${fen}. The moves leading up to this position are ${moves.join(" ")}. ${turn === "white" ? "Black" : "White"} just played ${moves.at(-1)}.`
      },
      {
        id: Math.random().toString(36).substring(7),
        role: "user",
        content: `The user's query is: ${query}`
      }
    ]);

    reload();
  }, [gameMessages, game, orientation, turn, addExplanationContext, reload]);

  const value = useMemo(() => ({
    processing,
    queries,
    gameMessages: gameMessages,
    addGameMessage: addGameMessage,
    appendGameMessage: appendGameMessage,
    clearGameMessages: clearGameMessages,
    getExplantion: getExplantion,
  }), [processing, gameMessages, queries, appendGameMessage, addGameMessage, clearGameMessages, getExplantion]);

  return (
    <CoachContext.Provider value={value}>
      {children}
    </CoachContext.Provider>
  )
}