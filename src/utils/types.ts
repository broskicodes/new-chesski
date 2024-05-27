import { Move } from "chess.js";

export enum ChessSite {
  Chesscom = "Chess.com",
  Lichess = "Lichess",
  InPerson = "irl",
  Other = "Other"
}

export enum Experience {
  None = 0,
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
  Expert = 4,
}

export enum Goal {
  Casual = 0,
  Competent = 1,
  Curious = 2,
  Commited = 3,
  Serious = 4
}

export interface UserData {
  chesscom_name?: string;
  lichess_name?: string;
  learning_goal: Goal;
  chessSite: ChessSite;
  onboarded: boolean;
}

export enum SkillLevel {
  Newb = "Newb",
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  Master = "Master",
  InternationalMaster = "International Master",
  Grandmaster = "Grandmaster",
  SuperGrandmaster = "Super Grandmaster",
  Elite = "Elite",
}

export const SkillLevelMap: { [key in SkillLevel]: [number, number] } = {
  [SkillLevel.Newb]: [1, 500], // Assuming ratings start at 0 for simplicity
  [SkillLevel.Beginner]: [501, 1200],
  [SkillLevel.Intermediate]: [1201, 1800],
  [SkillLevel.Advanced]: [1801, 2000],
  [SkillLevel.Expert]: [2001, 2200],
  [SkillLevel.Master]: [2201, 2400],
  [SkillLevel.InternationalMaster]: [2401, 2500],
  [SkillLevel.Grandmaster]: [2501, 2700],
  [SkillLevel.SuperGrandmaster]: [2701, 2800],
  [SkillLevel.Elite]: [2801, Infinity], // Using Infinity for ratings above 2800
};

export interface Puzzle {
  id: number;
  starting_fen: string;
  moves: string[];
  rating: number;
  rating_deviation: number;
  themes: string[];
  opening_tags: string[] | null;
}

export interface Evaluation {
  fen: string;
  eval: number;
  // move: string | null;
  pv: Move[];
  mate: boolean;
}

export interface GameState {
  id: string;
  startingPos: string;
  moves: string[];
  orientation: "white" | "black";
  complete: boolean;
}

export enum SubType {
  Monthly,
  Yearly,
}

export enum RunType {
  Onboarding = 0,
  General = 1,
  Openings = 2,
}

export const RunStarterMsgMap: Record<RunType, string> = {
  [RunType.Onboarding]: "Hi! I'm Chesski. I'm here to help you get the most out of this app! First, I've got a few questions for you. Ready?",
  [RunType.General]: "Hey! This is Chesski. Have a question about the platform, or chess in general? Let me know!",
  [RunType.Openings]: "give me the data"
}


export const SanRegex =
  /(O-O(-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[\+#]?|([a-h]x)?[a-h][1-8](=[QRBN])?[\+#]?)/g;
export const ONBOARDING_UPDATE_DATE = new Date("2024-03-04 22:00:34.202959+00");
export const STRIPE_LINK = "https://donate.stripe.com/7sIaHVg9WbnLcla4gg";

export const CHESSKI_MONTHLY_PRICE = 10;
export const CHESSKI_YEARLY_PRICE = 80;
export const OPENAI_ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID!;
export const API_URL = process.env.NEXT_PUBLIC_ENV_API_URL!;