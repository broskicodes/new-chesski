import { CreateMessage, Message } from "ai";
import { createContext, useContext } from "react";

export interface Query {
  title: string;
  query: string;
}

export interface CoachProviderContext {
  processing: boolean;
  gameMessages: Message[];
  insights: string;
  phases: string;
  lastExp: string;
  expProc: boolean;
  // queries: Query[];
  addGameMessage: (msg: Message) => void;
  appendGameMessage: (msg: Message | CreateMessage) => void;
  clearGameMessages: () => void;
  setGameMessages: (msgs: Message[]) => void;
  getExplantion: (msg: Message | CreateMessage) => void;
  reqGameAnalysis: (msg: Message | CreateMessage) => void;
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
  appendGameMessage: (_msg) => {
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
