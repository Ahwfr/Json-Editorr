import { db } from "./db";
import { documents, type InsertDocument, type Document } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(insertDoc).returning();
    return doc;
  }
}

export const storage = new DatabaseStorage();
