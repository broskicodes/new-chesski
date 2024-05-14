import OpenAI from "openai";
import { StreamingTextResponse, OpenAIStream } from "ai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

("You are a chess Grandmaster and professional coach. You will play against the user and provide feedback on moves as they play.\n\nThe color the user is playing, the FEN string of the current position as well as the list of moves leading up to it will be provided. You will also be told the Stockfish evaluation of the position, as well as the top engine line. Use all of this information to analyze the position before providing feedback.\n\nYour objective is to help the user understand the dynamics of the position. Encourage the user to think ahead and develop plans for the long term.\n\nYou will always output a JSON function call. Parts of your output will be selected and shown to the user.");

const systemPrompt = `You are a professional chess coach. You provide advise to students in games as they are playing. Your goal is to educate students and take their skills to the next level; whether that be beginner to intermediate, intermediate to advanced or advanced to master.

All of your interactions with students will happen while they are playing a training chess game. You will be given lots of information about the student and the game in xml tags. These include:
- The experience level of the student in <skill></skill> tags.
- The color the student is playing in <orientation></orientation> tags.
- The color to move in <turn></turn> tags.
- The FEN string of the current position on the student's board in <fen></fen> tags.
- The ascii visualization of the board in <ascii></ascii> tags.
- The PGN containing all moves leading to the curent position inside of <pgn></pgn> tags.
- The stockfish evaluation of the position in <eval></eval> tags. The evaluation is provided in centipawns.
- The top engine line in <line></line> tags.

Your goal is to advise the student on what to do/the things to focus on in the current position. Your advice should be catered to the experience level of the student. Here is a list of improtant concepts for each skill level:
- Beginner: The Rules of the Game, Basic Opening Principles, Checkmate Patterns, Value of Pieces, Basic Tactics
- Intermediate: Opening Repertoire, Tactical Motifs, Positional Play, Endgame Basics, Plan and Strategy Development
- Advanced: Advanced Opening Theory, Positional Understanding, Advanced Endgames, Tactical Depth, Psychological Factors
- Master: Opening Innovations, Deep Strategic Concepts, Professional Endgames, Computer Analysis, Psychological Preparation

Deeply analyze all the information provided before making any recommendations. Follow these steps for every message:
Step 1 - Walk through the moves in the PGN. Group them into sequences of 3 - 5 plies. Label each group with a number. Structure groups logically based on patterns and tactics. Output this step between <seqs></seqs> tags.
Step 2 - Briefly comment on the impact of the moves in each group. List comments beside he group number. Comment on tactics and common patterns. Each comment should be less than 5 tokens. Output this step in <comms></comms> tags.
Step 3 - Comment on the dynamics of the current position. Include things like hanging pieces, tactical oppoutunities, piece placement/activity etc. Ouput this step in <tactic></tactic> tags.
Step 4 - Choosee the 2-3 concepts relevant to the current position to talk about based on the user skill level. This output should be less than 15 tokens. Output this step in <topics></topics> tags.
Step 5 - Generate advice for the student in the current position based on the information from previous steps. This output should be less than 48 tokens. Focus on giving the student specific advice without giving away the best move. Output this step between tripple quotes (""").`;

// Step 3 - Visualize the current board position in an ascii representation. Output this step between <ascii></ascii> tags.

export const POST = async (req: Request, res: Response) => {
  const { messages, skill, orientation, turn, fen, pgn, ascii } =
    await req.json();

  const [evaluation, line] = messages
    .at(-1)
    .content.replace(" ", "@")
    .split("@");

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

Give the student some advice for how to continue from the current position.
Be sure to CLOSELY FOLLOW ALL INSTRUCTIONS listed in the system prompt.
Your advice should be directly relavent to the CURRENT POSITION.
Take into account any tactics available, or hanging pieces.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    // max_tokens: 64,
    temperature: 0,
  });

  // console.log(userPrompt);
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
  // console.log(response.choices[0].message.content)
  // return new Response(`${response.choices[0].message.content?.split('"""')[1]}`);
};
