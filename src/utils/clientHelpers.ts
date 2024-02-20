export function pgnToList(pgn: string) {
  // Remove clock annotations and result
  const cleanedPgn = pgn.replace(/\{\[%clk [^\}]*\]\}/g, '').replace(/1-0|0-1|1\/2-1\/2/g, '').trim();

  // Split the moves by space, filtering out move numbers
  const moves = cleanedPgn.split(/\s+/).filter(move => !move.match(/^\d+\./));

  return moves;
}