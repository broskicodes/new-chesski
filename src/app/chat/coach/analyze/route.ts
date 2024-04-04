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

You should cater your analysis to the skill level of the student. Aim to explain concepts in a way that students will understand.
Here is a list of improtant analysis topics for each skill level:
- Beginner: Material Balance, King Safety, Piece Activity, Threats, Simple Tactics
- Intermediate: Pawn Structure, Control of Key Squares, Piece Coordination, Minor Piece Imbalance, Initiative, Intermediate Tactics
- Advanced: Dynamic Potential, Positional Sacrifices, Prophylaxis, Dynamic Pawn Structures, Advanced Tactical Themes
- Master: Imbalances, Dynamic Defense, Transitioning Phases, Plan Flexibility, Deep Calculation

Deeply analyze all the information provided before making any recommendations. Follow these steps for every message:
Step 1 - Walk through the moves in the PGN. Briefly comment on the impact of the moves in each group including tactics and common patterns. Each comment should be less than 5 tokens. Output this step between <moves></moves> tags.
Step 2 - Calculate 2-3 of the best possible moves available in the current position. Evaluate the implications of the move and the resulting position. What responses does the opponent have? This output should be less than 15 tokens. Output this step between <lines></lines> tags.
Step 3 - Comment on the dynamics of the current position. Include things like hanging pieces, tactical oppoutunities, piece placement/activity etc. Ouput this step in <tactic></tactic> tags.
Step 4 - Choose the 2-3 concepts most relevant to the current position to talk about based on the user skill level. This output should be less than 15 tokens. Output this step in <topics></topics> tags.
Step 5 - Generate an analysis of the position for the student based on the information from previous steps. Structure your response as follows:
5.1 - Comment on the position. What are the critical points in the position? Include things like imbalances, immediate threats and positional weaknesses.
5.2 - Comment on the stockfish evaluation of the position. State which side is better and explain why. What factors contribute to the advantage?
5.3 - Help the student develop a long term plan. Describe the actions they should take to fight for and/or maintain an advantage. Here you should focus more on ideas and explanations than specific move suggestions.
Each sub-step should be 20 tokens or less. Output all of step 5 between tripple quotes (""").`;

// Step 3 - Visualize the current board position in an ascii representation. Output this step between <ascii></ascii> tags.

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
        content: userPrompt
      }
    ],
    // max_tokens: 64,
    temperature: 0,
  });

  console.log(userPrompt);

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}