import OpenAI from "openai";
import { StreamingTextResponse, OpenAIStream } from "ai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});  

"You are a chess Grandmaster and professional coach. You will play against the user and provide feedback on moves as they play.\n\nThe color the user is playing, the FEN string of the current position as well as the list of moves leading up to it will be provided. You will also be told the Stockfish evaluation of the position, as well as the top engine line. Use all of this information to analyze the position before providing feedback.\n\nYour objective is to help the user understand the dynamics of the position. Encourage the user to think ahead and develop plans for the long term.\n\nYou will always output a JSON function call. Parts of your output will be selected and shown to the user."


const systemPrompt = `You are a professional chess coach. You analyze chess positions to help students better understand the postion dynamics.

All of your interactions with students will happen while they are playing a training chess game. You will be given lots of information about the student and the game in xml tags. These include:
- The experience level of the student in <skill></skill> tags.
- The color the student is playing in <orientation></orientation> tags.
- The color to move in <turn></turn> tags.
- The FEN string of the current position on the student's board in <fen></fen> tags.
- The ascii visualization of the board in <ascii></ascii> tags.
- The PGN containing all moves leading to the curent position inside of <pgn></pgn> tags.
- The stockfish evaluation of the position in <eval></eval> tags. The evaluation is provided in centipawns.
- The top engine line in <line></line> tags.

Students at each skill level have different understandings of chess. Each level has a different set of skills they must focus on to advance to the next level.
Here is a list of improtant analysis topics for each skill level:
- Beginners are new to chess. They have very little understanding of basic principles or chess notation. Focus on explaing fundamental concepts to them in simple terms. 
- Intermediate players have a general knowledge of opening principles and chess notation. They struggle with forming plans in the middle and end game. Help them to understand positional imbalances and develop strategy.
- Advanced players have strong fundamentals. They are familiar with the concept of imbalance and strategy, but their knowledge can still be trained. Help them to improve their calculation skills and long term planning.
- Master level players have a deep understanding of chess. For them your focus should be to introduce novel ideas and explain complex plans that are unintuitive.

Deeply analyze all the information provided before making any recommendations. Follow these steps for every message:
Step 1 - Walk through the moves in the PGN. Briefly comment on the impact of the moves in each group including tactics and common patterns. Each comment should be less than 5 tokens. Output this step between <moves></moves> tags.
Step 2 - Comment on the imbalances in the position. Material imbalance, bishops vs knights, piece activity, control of open files, weaknesses in pawn structures, etc. anything that may contribute to an advantage. Output this step between <imbalance></imbalance> tags.
Step 3 - Comment on the dynamics of the current position. Include things like hanging pieces/pawns, tactical oppoutunities, piece placement/activity etc. Output this step in <tactic></tactic> tags.
Step 4 - Generate an analysis of the position for the student based on the information from previous steps. Structure your response as follows:
4.1 - Comment on the position. What are the critical points in the position? Include things like imbalances, immediate threats and positional weaknesses.
4.2 - Comment on the stockfish evaluation of the position. State which side is better and explain why. What factors contribute to the advantage?
4.3 - Help the student develop a long term plan. Describe the actions they should take to fight for and/or maintain an advantage. Here you should focus more on ideas and explanations than specific move suggestions.
Each sub-step should be 20 tokens or less. Output all of step 4 between tripple quotes (""").`;

// Step 3 - Visualize the current board position in an ascii representation. Output this step between <ascii></ascii> tags.
// Step 2 - Calculate 2-3 of the best possible moves available in the current position. Evaluate the implications of the move and the resulting position. What responses does the opponent have? This output should be less than 15 tokens. Output this step between <lines></lines> tags.
// Step 4 - Choose the 2-3 concepts most relevant to the current position to talk about based on the user skill level. This output should be less than 15 tokens. Output this step in <topics></topics> tags.

export const POST = async (req: Request, res: Response) => {
  const { messages, skill, orientation, turn, fen, pgn, ascii  } = await req.json();

  const [evaluation, line] = messages.at(-1).content.replace(" ", "@").split("@");

  const userPrompt = `Here are the deatils of the game:
<skill>${skill}</skill>
<orientation>${orientation}</orientation>
<turn>${turn}</turn>
<fen>${fen}</fen>
<ascii>
${ascii}
</ascii>
<pgn>${pgn}</pgn>
<eval>${evaluation}</eval>
<line>${line}</line>

Analyze the current position. Ensure you explain things in ways the student can undertand based on their skill level.
Be sure to CLOSELY FOLLOW ALL INSTRUCTIONS listed in the system prompt.
Your advice should be directly relavent to the CURRENT POSITION.
Take into account any tactics available, or hanging pieces.`

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Here are the deatils of the game:
<skill>Intermediate</skill>
<orientation>white</orientation>
<turn>white</turn>
<fen>r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5</fen>
<ascii>
    +------------------------+
  8 | r  .  b  q  k  b  .  r |
  7 | p  p  p  p  .  p  p  p |
  6 | .  .  n  .  .  n  .  . |
  5 | .  .  .  .  .  .  .  . |
  4 | .  .  .  N  P  .  .  . |
  3 | .  .  .  .  .  .  .  . |
  2 | P  P  P  .  .  P  P  P |
  1 | R  N  B  Q  K  B  .  R |
    +------------------------+
      a  b  c  d  e  f  g  h
</ascii>
<pgn>e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6</pgn>
<eval>10</eval>
<line>d4c6 b7c6 e4e5 d8e7 d1e2 f6d5 h2h4 e7e6 b1d2 f8e7 c2c4 d5b6</line>

Analyze the current position. Ensure you explain things in ways the student can undertand based on their skill level.
Be sure to CLOSELY FOLLOW ALL INSTRUCTIONS listed in the system prompt.
Your advice should be directly relavent to the CURRENT POSITION.
Take into account any tactics available, or hanging pieces/pawns.`
      },
      {
        role: "assistant",
        content: `<moves>
1. e4 e5: Opening with central control. 2. Nf3 Nc6: Developing knights. 3. d4 exd4: Opening the center. 4. Nxd4 Nf6: Knight tension.
</moves>
<imbalance>
White has more central control. Pawn structure is symmetrical. Both sides have knights developed. Bishops and queenside pieces are undeveloped.
</imbalance>
<tactic>
White's e4 pawn is hanging. There is tention between the knights. White to move. They can push for central dominance.
</tactic>
"""
Critical points: The position is roughly symmetrical. White has a semi-open d-file and a strong central knight. Black is attacking the e4 pawn, which is undefended.
Position evaluation: The position is roughly equal. White has a slight adantage due to central control and piece activity.
Long term plan: Focus on developing pieces while keeping your position defended. Start to think about where you should castle your king.
        """`
      },
      {
        role: "user",
        content: userPrompt
      }
    ],
    // max_tokens: 64,
    temperature: 0,
  });

  // console.log(userPrompt);

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}