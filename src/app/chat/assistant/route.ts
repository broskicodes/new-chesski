import { RunType } from "@/utils/types";
import { AssistantResponse } from "ai";
import OpenAI from "openai"

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY
})

const runIxs: Record<RunType, string> = {
  [RunType.Onboarding]: `<run>
Your current task is to onboard a new user to the Chesski app. Ask them questions about their chess experience, goals, playstyle and weakness. Once you have an understanding of all that information, call the function to update the user's profile.

Be friendly about it. Don't barrage the user with a lot of information at once. Ask questions one at a time, but encourage them to provide lots of detail in their responses.
</run>`,
  [RunType.General]: ""
}

export const POST = async (req: Request) => {
  const { tid, message, assistantId, runType }: {
    tid: string | null;
    assistantId: string;
    message: string;
    runType: RunType;
  } = await req.json();

  const threadId = tid ?? (await openai.beta.threads.create({})).id;

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: assistantId,
        additional_instructions: runIxs[runType]
      });

      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
      while (
        runResult?.status === 'requires_action' &&
        runResult.required_action?.type === 'submit_tool_outputs'
      ) {
        const tool_outputs =
          runResult.required_action.submit_tool_outputs.tool_calls.map(
            (toolCall: any) => {
              const parameters = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                // TODO: configure your tool calls here
                case "update_user_profile": {
                  console.log(parameters);
                
                  return {
                    tool_call_id: toolCall.id,
                    output: "data updated successfully"
                  }
                }
                default:
                  throw new Error(
                    `Unknown tool call function: ${toolCall.function.name}`,
                  );
              }
            },
          );

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            { tool_outputs },
          ),
        );
      }
    },
  );
}