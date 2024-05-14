import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are a chess analyst. You specialize in explaining the logic behind move classifications such as 'mistake' or 'blunder'.

Each time you are asked to explain a move you will be given the following:
- An ascii visualization of the position on the chess board before the user's move is played in <pre></pre> tags
- An ascii visualization of the position on the chess board after the user's move is played in <post></post> tags
- The list of moves leading to the current board position in <moves></moves> tags
- The move the user played in <played></played> tags
- The classification of the user's move in <class></class> tags
- The best move in <best></best>
- The full engine line containing the best move in <line></line> tags
- The centipawn evaluation of the position after the user's move is played in <eval></eval> tags


Deeply analyze all information provided before generating your explaination. Follow these steps:
Step 1 - Carefully the reivew the position on the board prior to the user making their move. Comment on the dynamics of the position and any tactics present.
Step 2 - Carefully the reivew the position on the board after the user makes their. Comment on the dynamics of the position and any tactics present.
Step 3 - Review the provided best move and comment on its impact on the position. Use the provided engine line and the evaluation to support your thought process, but do not rely too heavily on them.
Step 4 - Use the information generated above to explain why the user's move was given that classification. This response should be a single concise sentence. Output this section in tripple quotes (""").`;

// Step 1 - Reference the board visualization as well as the provided leading moves and comment on the dynamics of the current position, including hanging pieces and pawns, available tactics, weak squares, open files, etc.

export const POST = async (req: Request, res: Response) => {
  const { messages } = await req.json();

  console.log(messages.at(-1));

  const reponse = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      messages.at(-1),
    ],
    // max_tokens: 64,
    temperature: 0,
  });

  const stream = OpenAIStream(reponse);
  return new StreamingTextResponse(stream);
};
