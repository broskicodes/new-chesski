import { Experience, SkillLevel, SkillLevelMap } from "./types";

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