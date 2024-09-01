import { Message } from "discord.js";
import { llm } from "../../llm";
import { logger } from "../../logger/logger";

export const mentionHandler = async (message: Message) => {
  logger.info(`mentionHandler: ${message.content}`);

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  )
    return;

  const rawContent = message.content;
  const regex = /<@(.*?)>/g;
  const content = rawContent.replace(regex, "").trim();
  logger.info(`mentionHandler actual content: ${content}`);

  const reply = await llm.completeChat(content);
  await message.channel.send(reply);
};
