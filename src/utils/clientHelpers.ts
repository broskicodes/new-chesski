import { Message } from "ai";
import { Experience, GameState, SkillLevel, SkillLevelMap } from "./types";

export const getChessRatingCategory = (rating: number): SkillLevel => {
  for (const category of Object.entries(SkillLevelMap)) {
      const [key, [min, max]] = category;
      if (rating >= min && rating <= max) {
          return SkillLevel[key as keyof typeof SkillLevel];
      }
  }
  return SkillLevel.Elite; // Default to Elite for any rating not explicitly covered
};

export const experienceToTitle = (experienceValue: Experience): string => {
  switch (experienceValue) {
    case Experience.Beginner:
      return 'Beginner';
    case Experience.Intermediate:
      return 'Intermediate';
    case Experience.Advanced:
      return 'Advanced';
    case Experience.Master:
      return 'Master';
    default:
      return 'Unknown';
  }
}

export const setCurrGameState = (props: Partial<GameState>) => {
  const oldState = JSON.parse(localStorage.getItem("currGameState")!);

  localStorage.setItem("currGameState", JSON.stringify({
    ...oldState,
    ...props
  }));
}

export const setCurrMessages = (msgs: Message[], reset: boolean) => {
  if (reset) {
    localStorage.setItem("currMessages", JSON.stringify(msgs));
  } else {
    const oldState = JSON.parse(localStorage.getItem("currMessages")!);
    if (oldState) {
      localStorage.setItem("currMessages", JSON.stringify([...oldState, ...msgs]));
    } else {
      localStorage.setItem("currMessages", JSON.stringify(msgs));
    }
  }
}