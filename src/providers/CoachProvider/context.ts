import { CreateMessage, Message } from "ai";
import { createContext, useContext } from "react";

export interface Query {
  title: string;
  query: string;
}

export interface CoachProviderContext {
  processing: boolean;
  gameMessages: Message[];
  weaknesses: string;
  // queries: Query[];
  addGameMessage: (msg: Message) => void;
  appendGameMessage: (msg: Message | CreateMessage) => void;
  clearGameMessages: () => void;
  setGameMessages: (msgs: Message[]) => void;
  getExplantion: (query: string) => void;
  reqGameAnalysis: (msg: Message | CreateMessage) => void;
  clearInsights: () => void;
}

export const CoachContext = createContext<CoachProviderContext>({
  processing: false,
  gameMessages: [],
  weaknesses: "",
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
