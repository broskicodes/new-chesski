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
  [SkillLevel.Newb]: [0, 499], // Assuming ratings start at 0 for simplicity
  [SkillLevel.Beginner]: [500, 1199],
  [SkillLevel.Intermediate]: [1200, 1799],
  [SkillLevel.Advanced]: [1800, 1999],
  [SkillLevel.Expert]: [2000, 2199],
  [SkillLevel.Master]: [2200, 2399],
  [SkillLevel.InternationalMaster]: [2400, 2499],
  [SkillLevel.Grandmaster]: [2500, 2699],
  [SkillLevel.SuperGrandmaster]: [2700, 2799],
  [SkillLevel.Elite]: [2800, Infinity], // Using Infinity for ratings above 2800
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