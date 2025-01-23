import { z } from "zod";
import { CoreMessage, generateText, tool } from "ai";
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
  const result = await generateText({
    model: LLMClient,
    tools: {
      goto: tool({
        description: "Navigate to a website",
        parameters: z.object({
          url: z.string().describe("The URL to navigate to"),
        }),
        execute: async ({ url }) => {
          return await runStagehand({
            sessionID,
            method: "GOTO",
            instruction: url,
          });
        },
      }),
      act: tool({
        description:
          "Act on the current page, like clicking a button or filling out a textbox. This should be a very simple, one-step instruction.",
        parameters: z.object({
          action: z.string().describe("The action to perform"),
        }),
        execute: async ({ action }) => {
          return await runStagehand({
            sessionID,
            method: "ACT",
            instruction: action,
          });
        },
      }),
      extract: tool({
        description:
          "Extract data from the current page assuming the data is already visible to an end user. ONLY USE THIS IF YOU ARE SURE THE DATA IS VISIBLE.",
        parameters: z.object({
          data: z.string().describe("The data to extract"),
        }),
        execute: async ({ data }) => {
          return await runStagehand({
            sessionID,
            method: "EXTRACT",
            instruction: data,
          });
        },
      }),
      close: tool({
        description: "Close the current session",
        parameters: z.object({}),
        execute: async () => {
          return await runStagehand({
            sessionID,
            method: "CLOSE",
          });
        },
      }),
    },
    messages: [
      ...messages,
      {
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
      },
    ],
  });
  console.log("RESULT", result);
  return result;
}
