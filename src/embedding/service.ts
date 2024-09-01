import { config } from "../config/config";
import { llm } from "../llm";
import { TextEmbedding } from "../models";
import { database } from "./database";

export const saveText = async (
  text: string,
  source: string
): Promise<number> => {
  const vector = await llm.embed(text);
  const embedding: TextEmbedding = {
    text,
    source,
    vector,
  };

  const embedID = await database.saveEmbedding(embedding);
  return embedID;
};

export const getRelevantText = async (
  text: string,
  limit: number = 1
): Promise<TextEmbedding[]> => {
  const vector = await llm.embed(text);
  const embedding: TextEmbedding = {
    text,
    source: "query",
    vector,
  };

  const similarTexts = await database.getSimilar(
    embedding,
    limit,
    config.MAX_EMBED_DIST
  );
  return similarTexts;
};
