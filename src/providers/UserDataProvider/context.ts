import { Experience } from "@/utils/types";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

export interface UserDataProviderContext {
  chesscom: string | null;
  lichess: string | null;
  experience: Experience;
  name: string;
  pfp: string;
  isPro: boolean;
  subId: string | null;
  saveData: () => Promise<void>;
  getData: () => Promise<void>;
  updateChesscom: Dispatch<SetStateAction<string | null>>;
  updateLichess: Dispatch<SetStateAction<string | null>>;
  updateExperience: Dispatch<SetStateAction<Experience>>;
}

export const UserDataContext = createContext<UserDataProviderContext>({
  chesscom: null,
  lichess: null,
  experience: Experience.Beginner,
  name: "",
  pfp: "",
  isPro: false,
  subId: null,
  getData: () => {
    throw new Error("UserDataProvider not initialized");
  },
  saveData: () => {
    throw new Error("UserDataProvider not initialized");
  },
  updateChesscom: () => {
    throw new Error("UserDataProvider not initialized");
  },
  updateLichess: () => {
    throw new Error("UserDataProvider not initialized");
  },
  updateExperience: () => {
    throw new Error("UserDataProvider not initialized");
  },
});

export const useUserData = () => useContext(UserDataContext);
