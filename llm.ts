import { z } from "zod";
import { CoreMessage, generateObject, generateText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { runStagehand } from "./execute.js";

const LLMClient = anthropic("claude-3-5-sonnet-latest");

export async function sendPrompt({
  goal,
  sessionID,
  messages = [],
}: {
  goal: string;
  sessionID: string;
  messages?: CoreMessage[];
}) {
  const newMessage: CoreMessage = {
    role: "user",
    content: [
      {
        type: "text",
        text: `Consider the following screenshot of a web page, with the goal being "${goal}". 
			Determine the immediate next step to take to achieve the goal. 
			If the goal has been achieved, return "close".`,
      },
      {
        type: "image",
        image: (await runStagehand({
          sessionID,
          method: "SCREENSHOT",
        })) as string,
      },
    ],
  };
  const result = await generateObject({
    model: LLMClient,
    schema: z.object({
      text: z.string().describe("The text to display"),
      reasoning: z.string().describe("The reasoning to display"),
      tool: z.enum(["GOTO", "ACT", "EXTRACT", "OBSERVE", "CLOSE"]),
      instruction: z
        .string()
        .describe(
          "The instruction to display, i.e. the url to navigate to, the action to perform, the data to extract, the observation to make, etc. If the tool is 'CLOSE', this should be an empty string."
        ),
    }),
    messages: [...messages, newMessage],
  });
  console.log("RESULT", result);
  return {
    result: result.object,
    messages: [...messages, newMessage],
  };
}
