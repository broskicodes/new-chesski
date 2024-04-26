import { StreamingTextResponse, OpenAIStream } from "ai";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const functions: ChatCompletionTool[] = [
//   {
//     type: "function",
//     function: {
//       name: "generate_user_queries",
//       description:
//         "Generate up to 3 possible queries about the provided message that will help the user deepen their understanding of the content.",
//       parameters: {
//         type: "object",
//         properties: {
//           queries: {
//             type: "array",
//             description: "An array of the generated queries the user can ask.",
//             items: {
//               type: "object",
//               properties: {
//                 query: {
//                   type: "string",
//                   description:
//                     "The query the user can ask. These should be short and consise questions. Should be a maximum of 10 words.",
//                 },
//                 title: {
//                   type: "string",
//                   description:
//                     "The title of the query. Should be a maximum of 3 words.",
//                 },
//               },
//             },
//             minItems: 1,
//             maxItems: 3,
//           },
//         },
//         required: ["queries", "query_titles"],
//       },
//     },
//   },
// ];

const systemPrompt = `You are a chess analyst. You analyze completed games and attempt to identify the weaknesses in the play of one of the players.

For each game that you analyze, you will be given the list of moves that were played. You will find this between <moves></moves> tags. The list will also contain some metadata about each move.

Each entry will be provided in <entry></entry> tags and will have the following format:
- The move that was played in SAN notation provided in <san></san> tags.
- The classification of the move as one of the following: Best, Good, Book, Inaccuracy, Mistake, Blunder. This indicates the strength of the move relative to the position it was played in. This will be provided in <class></class> tags.
- The evaluation of the position after the move is played according to stockfish. The value will be provided in centipawns between <eval></eval> tags.

The result of the game will also be provided in <result></result> tags.
The color of the player that you should analyze will be provided in <player></player> tags.

Deeply consider all the provided information when generating your analysis. Analyze in these steps:
Step 1 - Seperate the game into the opening, middle game and endgame (if applicable). Briefly comment on the player's play in each section individually in 2-3 sentences. 
Step 2 - Identify 3-5 key moments in the game and how the player reacted. For each, comment on what happened and the significance of it on the position and overall game. Each of these comments should be 20 tokens or less.
Step 3 - Based on the data generated above, try to point out what weaknesses the player has in their game. Try to categorize these weaknesses into common chess themes. Only point out 1 or 2 weaknesses per game. Output results of this section in tripple quotes (""").`

// limit reasoning to 15 tokens or fewer
// Step 1 - Walk through each move of the game and briefly comment on it in the context of the position. Consider the stockfish evaluation and the move's classification, but do not list them as part of the comment. For each move, your comment should be less than 10 tokens. Be sure to label the comment with the SAN.

export const POST = async (req: Request) => {
  const { messages } = await req.json();

  console.log(messages.at(-1));
  // const userPrompt = ``

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt
      }, 
      messages.at(-1)
    ],
    temperature: 0,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
};
