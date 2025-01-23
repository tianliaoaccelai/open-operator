/**
 * 🤘 Welcome to Stagehand!
 *
 * You probably DON'T NEED TO BE IN THIS FILE
 *
 * You're probably instead looking for the main() function in main.ts
 *
 * This is run when you do npm run start; it just calls main()
 *
 */

import chalk from "chalk";
import { sendPrompt } from "./llm.js";
import Browserbase from "@browserbasehq/sdk";
import { announce } from "./utils.js";

async function agentLoop(sessionID: string, goal: string) {
  const result = await sendPrompt({
    goal,
    sessionID,
  });

  console.log("TEXT:", result.text);
  console.log("REASONING:", result.reasoning);
  console.log("TOOL CALLS:", result.toolCalls);
  console.log("TOOL RESULTS:", result.toolResults);
  if (result.toolCalls.length > 0 && result.toolCalls[0].toolName !== "close") {
    return await agentLoop(sessionID, goal);
  }
}

async function run() {
  const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY!,
  });
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      context: {
        id: process.env.BROWSERBASE_CONTEXT_ID!,
      },
    },
  });
  console.log("SESSION", session);

  announce(
    `View this session live in the Browserbase dashboard: ${chalk.blue(
      `https://www.browserbase.com/sessions/${session.id}`
    )}`
  );

  await agentLoop(
    session.id,
    "find stagehand by browserbase on github and tell me who the top contributor is"
  );
}

run();
