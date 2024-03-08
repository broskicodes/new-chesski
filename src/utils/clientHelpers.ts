import { SkillLevel, SkillLevelMap } from "./types";

export const getChessRatingCategory = (rating: number): SkillLevel => {
  for (const category of Object.entries(SkillLevelMap)) {
      const [key, [min, max]] = category;
      if (rating >= min && rating <= max) {
          return SkillLevel[key as keyof typeof SkillLevel];
      }
  }
  return SkillLevel.Elite; // Default to Elite for any rating not explicitly covered
};