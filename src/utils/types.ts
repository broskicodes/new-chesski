export interface Puzzle {
  id: number;
  starting_fen: string;
  moves: string[];
  rating: number;
  rating_deviation: number;
  themes: string[];
}