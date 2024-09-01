import { Client } from "pg";
import { config } from "../config/config";

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

  //   async embed(text: string): Promise<number[]> {
  //     try {
  //       const response = await this.openai.embeddings.create({
  //         model: this.embedModel,
  //         input: text,
  //       });

  //       return response.data[0].embedding;
  //     } catch (error) {
  //       logger.error("Error embedding text:", error);
  //       throw new Error("Failed to embed text");
  //     }
  //   }

  //   async completeChat(prompt: string): Promise<string> {
  //     try {
  //       const response = await this.openai.chat.completions.create({
  //         model: this.chatCompletionModel,
  //         messages: [{ role: "user", content: prompt }],
  //       });

  //       return response.choices[0].message.content || "";
  //     } catch (error) {
  //       logger.error("Error completing chat:", error);
  //       throw new Error("Failed to complete chat");
  //     }
  //   }
}

export const database = new Database(config.DB_URL);
