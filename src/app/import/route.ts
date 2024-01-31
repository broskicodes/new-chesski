import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";


const parsePGN = (pgn: string) => {
  const metaDataRegex = /\[([A-Za-z]+)\s"([^"]*)"\]/g;
  const pgnData: any = {};
  let match;

  while ((match = metaDataRegex.exec(pgn)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2];
    pgnData[key] = value;
  }

  // Convert UTCDate and UTCTime to a played_at timestamp
  const playedAt = `${pgnData['utcdate']}T${pgnData['utctime']}Z`;

  const dbObject = {
    played_at: playedAt,
    white: pgnData['white'],
    black: pgnData['black'],
    result: pgnData['result'],
    white_elo: parseInt(pgnData['whiteelo']),
    black_elo: parseInt(pgnData['blackelo']),
    time_control: pgnData['timecontrol'],
    moves: pgn.split('\n\n')[1],
  };

  return dbObject;
}

export const POST = async (req: Request, res: Response) => {
  const cookieStore = cookies()

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

  const { data, error } = await supabase.auth.getUser();

  if(error) {
    console.log(error)
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.from('user_chess_accounts').select().eq('uuid', data.user.id);

  if (userError) {
    console.log(userError)
    return new Response(JSON.stringify({ userError }), { status: 500 });
  }

  if (!userData[0]) {
    return new Response(JSON.stringify(0), { status: 200 });
  }

  const { chesscom_name: chesscom, lichess_name: lichess } = userData[0];

  const lichessGameRes = await fetch(`https://lichess.org/api/games/user/${lichess}?max=50`);
  const lichessGameData = await lichessGameRes.text();

  const lichessGames = lichessGameData.split('\n\n\n').slice(0, -1);

  const chesscomarchiveRes = await fetch(`https://api.chess.com/pub/player/${chesscom}/games/archives`);
  const chesscomarchiveData = await chesscomarchiveRes.json();

  const chesscomGames = (await Promise.all(
    chesscomarchiveData['archives'] 
      ? chesscomarchiveData['archives'].slice(-3).map(async (archive: string) => {
          const res = await fetch(archive);
          const data = await res.json();

          const pgns = data['games'].map((game: any) => {
            return game['pgn'];
          });
          
          return pgns;
        })
      : []
  )).flat();

  const dbRows = lichessGames.concat(chesscomGames).map((game: string) => {
    return parsePGN(game);
  });

  
  const { data: insertData, error: insertError } = await supabase
    .from('game_pgns')
    .upsert(dbRows)
    .select();
        
  if (insertError) { 
    console.log(insertError);
    return new Response(JSON.stringify({ insertError }), { status: 500 });
  }

  return new Response(JSON.stringify(insertData.length), { status: 200 });
}