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
import { announce } from "./utils.js";
import { CoreMessage } from "ai";
import { createSession } from "./bb.js";
import { runStagehand } from "./execute.js";

// ALEX: this is the main loop, which is called by the client
async function agentLoop(
  sessionID: string,
  goal: string,
  messages: CoreMessage[]
) {
  // ALEX: sendPrompt should be run server-side
  const { result, messages: newMessages } = await sendPrompt({
    goal,
    sessionID,
    messages,
  });
  //   ALEX: save this to react state + display in UI
  //   IF YOU WANT TO SEE THE THINGS IT'S GOING TO DO BEFORE DOING IT:
  // remove execute() from tools in llm.ts and use structured data outputs instead: https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data#structured-outputs-with-generatetext-and-streamtext
  console.log("SHOW IN UI:", {
    // NEW_MESSAGES: newMessages,
    TEXT: result.text,
    REASONING: result.reasoning,
    TOOL: result.tool,
    // TOOL_CALLS: result.toolCalls,
    // TOOL_RESULTS: result.toolResults,
  });
  await runStagehand({
    sessionID,
    method: result.tool,
    instruction: result.instruction,
  });
  if (result.tool !== "CLOSE") {
    return await agentLoop(sessionID, goal, newMessages);
  }
  return result;
}

// Make this like entry point for a prompt
async function run(prompt: string) {
  // ALEX: Run createSession server-side
  //   Save session to a react state
  const session = await createSession();
  console.log("SESSION", session);

  // ALEX: Display session in UI
  announce(
    `View this session live in the Browserbase dashboard: ${chalk.blue(
      `https://www.browserbase.com/sessions/${session.id}`
    )}`
  );

  // ALEX: Run agentLoop client-side
  await agentLoop(session.id, prompt, []);
}

run(
  "find stagehand by browserbase on github and tell me who the top contributor is"
);
