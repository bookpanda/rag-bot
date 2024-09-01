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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        vector vector(1536) NOT NULL
        )`);
  }

  async saveEmbedding(embedding: TextEmbedding): Promise<number> {
    const query = `INSERT INTO embedding ("text", source, vector, expires_at) VALUES ($1, $2, $3, $4) RETURNING id`;
    try {
      const expiry = new Date(
        new Date().getTime() + config.MSG_EXPIRY_SEC * 1000
      );
      expiry.setDate(expiry.getDate() + 7);

      const response = await this.client.query(query, [
        embedding.text,
        embedding.source,
        "[" + embedding.vector.toLocaleString() + "]",
        expiry,
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
    const query = `WITH dist as (
      SELECT text, source, vector, vector <=> $1 as distance 
      FROM embedding
      WHERE expires_at > current_timestamp
    )
    SELECT text, source, vector, distance FROM dist WHERE distance <= $2 ORDER BY distance LIMIT $3`;
    try {
      const response = await this.client.query<TextEmbedding>(query, [
        "[" + embedding.vector.toLocaleString() + "]",
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
