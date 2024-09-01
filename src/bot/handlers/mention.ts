import { Message } from "discord.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getRelevantText } from "../../embedding/service";
import { llm } from "../../llm";
import { logger } from "../../logger/logger";
import { TextEmbedding } from "../../models";

export const mentionHandler = async (message: Message) => {
  logger.info(`mentionHandler: ${message.content}`);
  if (!message.guildId) return;

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  )
    return;

  const rawContent = message.content;
  const regex = /<@(.*?)>/g;
  const content = rawContent.replace(regex, "").trim();
  logger.info(`mentionHandler actual content: ${content}`);

  const relevantTexts = await getRelevantText(content, message.guildId, 10);
  const chatMessages = buildConversation([...relevantTexts]);
  chatMessages.push({
    role: "user",
    content: content,
  });

  logger.info(`mentionHandler chatMessages: ${JSON.stringify(chatMessages)}`);

  const reply = await llm.completeChat(chatMessages);
  await message.channel.send(reply);
};

const buildConversation = (
  messages: TextEmbedding[]
): ChatCompletionMessageParam[] => {
  return messages.map((message) => {
    return {
      role: message.source === "RAG-bot" ? "assistant" : "user",
      content: message.text,
    };
  });
};
