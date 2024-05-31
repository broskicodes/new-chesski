import { CreateMessage, Message } from "ai";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { PositionEval } from "../EvaluationProvider/context";
import { ChatCompletionMessage } from "openai/resources/index";

export interface Query {
  title: string;
  query: string;
}

export interface CoachProviderContext {
  processing: boolean;
  gameMessages: ChatCompletionMessage[];
  insights: string;
  phases: string;
  lastExp: string;
  expProc: boolean;
  // queries: Query[];
  addGameMessage: (msg: ChatCompletionMessage) => void;
  analyzePosition: (latestEval: PositionEval) => void;
  clearGameMessages: () => void;
  setGameMessages: Dispatch<SetStateAction<ChatCompletionMessage[]>>;
  getExplantion: (prompt: string) => void;
  reqGameAnalysis: (prompt: string) => void;
  clearInsights: () => void;
}

export const CoachContext = createContext<CoachProviderContext>({
  processing: false,
  gameMessages: [],
  insights: "",
  phases: "",
  lastExp: "",
  expProc: false,
  // queries: [],
  addGameMessage: (_msg) => {
    throw new Error("CoachProvider not initialized");
  },
  analyzePosition: (_eval) => {
    throw new Error("CoachProvider not initialized");
  },
  clearGameMessages: () => {
    throw new Error("CoachProvider not initialized");
  },
  setGameMessages: () => {
    throw new Error("CoachProvider not initialized");
  },
  getExplantion: (_query) => {
    throw new Error("CoachProvider not initialized");
  },
  reqGameAnalysis: (_msg) => {
    throw new Error("CoachProvider not initialized");
  },
  clearInsights: () => {
    throw new Error("CoachProvider not initialized");
  },
});

export const useCoach = () => useContext(CoachContext);
