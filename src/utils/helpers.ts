import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SkillLevel, SkillLevelMap } from "./types";

export const getSupabaseCilent = () => {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  return supabase;
}

// export const getChessRatingCategory = (rating: number): string => {
//   switch (true) {
//       case rating < 500:
//           return "Newb"; // Assuming ratings start at 500
//       case rating <= 1199:
//           return "Beginner";
//       case rating <= 1799:
//           return "Intermediate";
//       case rating <= 1999:
//           return "Advanced";
//       case rating <= 2199:
//           return "Expert";
//       case rating <= 2399:
//           return "Master";
//       case rating <= 2499:
//           return "International Master";
//       case rating <= 2699:
//           return "Grandmaster";
//       case rating <= 2799:
//           return "Super Grandmaster";
//       default:
//           return "Elite"; // For ratings above 3000
//   }
// }

export const getChessRatingCategory = (rating: number): SkillLevel => {
  for (const category of Object.entries(SkillLevelMap)) {
      const [key, [min, max]] = category;
      if (rating >= min && rating <= max) {
          return SkillLevel[key as keyof typeof SkillLevel];
      }
  }
  return SkillLevel.Elite; // Default to Elite for any rating not explicitly covered
};