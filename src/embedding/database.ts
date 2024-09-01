import { Client } from "pg";
import { config } from "../config/config";
import { logger } from "../logger/logger";
import { TextEmbedding } from "../models";

class Database {
  private client: Client;

  constructor(connectionString: string) {
    this.client = new Client({
      connectionString,
    });

    this.client.connect();
    this.client.query("CREATE EXTENSION IF NOT EXISTS vector");
    this.client.query(`
        CREATE TABLE IF NOT EXISTS embedding (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        vector vector(1536) NOT NULL
        )`);
  }

  async saveEmbedding(embedding: TextEmbedding): Promise<number> {
    const query =
      "INSERT INTO embedding (text, source, vector) VALUES ($1, $2, $3) RETURNING id";
    try {
      const response = await this.client.query(query, [
        embedding.text,
        embedding.source,
        embedding.vector,
      ]);

      return response.rows[0].id;
    } catch (error) {
      logger.error("Error saving embedding:", error);
      throw new Error("Failed to save embedding");
    }
  }

  async getSimilar(
    embedding: TextEmbedding,
    limit: number = 1,
    maxDistance: number = 0.8
  ): Promise<TextEmbedding[]> {
    const query = `WITH dist as (SELECT text, source, vector, vector <=> %s as distance FROM embedding
    SELECT text, source, vector, distance FROM dist WHERE distance <= %s ORDER BY distance LIMIT %s`;
    try {
      const response = await this.client.query<TextEmbedding>(query, [
        embedding.vector,
        maxDistance,
        limit,
      ]);

      return response.rows;
    } catch (error) {
      logger.error("Error completing chat:", error);
      throw new Error("Failed to complete chat");
    }
  }
}

export const database = new Database(config.DB_URL);
