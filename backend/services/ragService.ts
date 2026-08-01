import { createRAGEngine, RAGEngine } from "rg-rag-core";

let ragEngineInstance: RAGEngine | null = null;

export function getRAGEngine(): RAGEngine {
  if (!ragEngineInstance) {
    const geminiApiKey = process.env.GOOGLE_API_KEY || "";
    const pineconeApiKey = process.env.PINECONE_API_KEY || "";
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME || "";

    if (!geminiApiKey || !pineconeApiKey || !pineconeIndexName) {
      console.warn(
        "[WARNING] Missing GOOGLE_API_KEY, PINECONE_API_KEY, or PINECONE_INDEX_NAME in environment variables."
      );
    }

    ragEngineInstance = createRAGEngine({
      geminiApiKey,
      pineconeApiKey,
      pineconeIndexName,
      embeddingModel: "gemini-embedding-001",
      llmModel: "gemini-3-flash-preview",
      temperature: 0.3,
    });
  }

  return ragEngineInstance;
}
