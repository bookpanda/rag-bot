import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { config } from "../config/config";
import { promptConfig } from "../config/promptConfig";
import { logger } from "../logger/logger";

class LLM {
  private openai: OpenAI;
  private chatCompletionModel_ = "gpt-3.5-turbo-16k";
  private embedModel: OpenAIEmbeddings;
  private chatCompletionModel: ChatOpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    this.chatCompletionModel = new ChatOpenAI({
      model: "gpt-3.5-turbo-16k",
      temperature: 0,
    });
    this.embedModel = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const res = await this.embedModel.embedQuery(text);

      return res;
    } catch (error) {
      logger.error("Error embedding text:", error);
      throw new Error("Failed to embed text");
    }
  }

  async completeChat(
    chatMessages: ChatCompletionMessageParam[]
  ): Promise<string> {
    try {
      const input: ChatCompletionMessageParam[] = chatMessages;
      if (config.ENABLE_PROMPT_CONFIG)
        input.unshift({ role: "system", content: promptConfig.translate });

      const response = await this.openai.chat.completions.create({
        model: this.chatCompletionModel_,
        messages: input,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      logger.error("Error completing chat:", error);
      throw new Error("Failed to complete chat");
    }
  }
}

export const llm = new LLM();
