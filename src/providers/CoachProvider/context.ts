import { CreateMessage, Message } from "ai";
import { createContext, useContext } from "react";


export interface Query {
  title: string;
  query: string;
}

export interface CoachProviderContext {
  processing: boolean;
  gameMessages: Message[];
  queries: Query[];  
  appendGameMessage: (msg: Message | CreateMessage) => void;
  clearGameMessages: () => void;
  getExplantion: (query: string) => void;
}

export const CoachContext = createContext<CoachProviderContext>({
  processing: false,
  gameMessages: [],
  queries: [],
  appendGameMessage: (_msg) => {
    throw new Error("CoachProvider not initialized");
  },
  clearGameMessages: () => {
    throw new Error("CoachProvider not initialized");
  },
  getExplantion: (_query) => {
    throw new Error("CoachProvider not initialized");
  }
});

export const useCoach = () => useContext(CoachContext);

