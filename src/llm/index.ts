import { OpenAI } from "openai";
import { config } from "../config/config";
import { logger } from "../logger/logger";

class LLM {
  private openai: OpenAI;
  private embedModel = "text-embedding-3-small";
  private chatCompletionModel = "gpt-3.5-turbo-16k";

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_TOKEN });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embedModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error("Error embedding text:", error);
      throw new Error("Failed to embed text");
    }
  }

  async completeChat(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.chatCompletionModel,
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      logger.error("Error completing chat:", error);
      throw new Error("Failed to complete chat");
    }
  }
}

export const llm = new LLM();
