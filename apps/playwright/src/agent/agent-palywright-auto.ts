import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import {
  gotoUrlTool,
  extractPageStateTool,
  executePlaywrightActionsTool,
} from "../tools/tool-playwright.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const model = new ChatOpenAI({
  modelName: "deepseek-chat",
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: "https://api.deepseek.com" },
  temperature: 0,
});

// Define system prompt
const promptPath = path.join(__dirname, "../prompts/playwright-prompt.md");
const systemPrompt = fs.readFileSync(promptPath, "utf-8");

const agent = createAgent({
  model: model,
  tools: [executePlaywrightActionsTool],
  systemPrompt: systemPrompt,
});

export async function invokeAgent(content: string) {
  return agent.invoke({
    messages: [{ role: "user", content }],
  });
}
