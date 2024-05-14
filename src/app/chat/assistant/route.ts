import { getSupabaseCilent } from "@/utils/serverHelpers";
import { RunStarterMsgMap, RunType } from "@/utils/types";
import { AssistantResponse } from "ai";
import OpenAI from "openai"

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_ASSISTANT_API_KEY
})


export const POST = async (req: Request) => {
  const { tid, message, assistantId, runType, threadEmpty, experience, playstyle, weaknesses, goals }: {
    tid: string | null;
    assistantId: string;
    message: string;
    runType: RunType;
    threadEmpty: boolean;
    experience: string;
    goals: string;
    playstyle: string;
    weaknesses: string;
  } = await req.json();

  const runIxs: Record<RunType, string> = {
    [RunType.Onboarding]: `<run>
Your current task is to onboard a new user to the Chesski app. Ask them questions about their chess experience, goals, playstyle and weakness. Once you have an understanding of all that information, call the function to update the user's profile.

Be friendly about it. Ask questions one at a time, and encourage them to provide lots of detail in their responses.
</run>`,
  [RunType.General]: `<run>
Your current task is to assist the user with anything to do with chess or the Chesski app.

Here is some information about the user:
- Experience: ${experience}
- Playstyle: ${playstyle}
- Goals: ${goals}
- Weaknesses: ${weaknesses}

Try to personalize your responses as much as possible. Encourage them to use features of the Chesski app when relevant.
</run>`
  }

  const threadId = tid ?? (await openai.beta.threads.create({})).id;

  if (threadEmpty) {
    await openai.beta.threads.messages.create(threadId, {
      role: "assistant",
      content: RunStarterMsgMap[runType]
    })
  }

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  const supabase = getSupabaseCilent();
  const { data: { user }} = await supabase.auth.getUser();

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage, sendMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: assistantId,
        additional_instructions: runIxs[runType],
      });

      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
      while (
        runResult?.status === 'requires_action' &&
        runResult.required_action?.type === 'submit_tool_outputs'
      ) {
        const tool_outputs =
          await Promise.all(runResult.required_action.submit_tool_outputs.tool_calls.map(
            async (toolCall: any) => {
              const parameters = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                // TODO: configure your tool calls here
                case "update_user_profile": {
                  // console.log(parameters);

                  const { data, error } = await supabase.from("user_profiles")
                    .upsert({
                      ...parameters,
                      user_id: user?.id
                    });

                  sendDataMessage({
                    role: "data",
                    data: { type: "onboarding_complete", newRunType: RunType.General }
                  })

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
          ));

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