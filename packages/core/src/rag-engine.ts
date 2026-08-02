import { Pinecone, Index as PineconeIndex } from "@pinecone-database/pinecone";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RAGConfig,
  VectorDocument,
  SearchOptions,
  SearchResult,
  GenerateRAGOptions,
} from "./types.js";

export class RAGEngine {
  private config: RAGConfig;
  private pineconeClient: Pinecone;
  private pineconeIndex: PineconeIndex;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private llm: ChatGoogleGenerativeAI;

  constructor(config: RAGConfig) {
    if (!config.geminiApiKey) {
      throw new Error("RAGEngine Error: geminiApiKey is required.");
    }
    if (!config.pineconeApiKey) {
      throw new Error("RAGEngine Error: pineconeApiKey is required.");
    }
    if (!config.pineconeIndexName) {
      throw new Error("RAGEngine Error: pineconeIndexName is required.");
    }

    this.config = config;

    this.pineconeClient = new Pinecone({ apiKey: config.pineconeApiKey });
    this.pineconeIndex = this.pineconeClient.index(config.pineconeIndexName);

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiApiKey,
      model: config.embeddingModel || "gemini-embedding-001",
    });

    this.llm = new ChatGoogleGenerativeAI({
      apiKey: config.geminiApiKey,
      model: config.llmModel || "gemini-3-flash-preview",
      temperature: config.temperature ?? 0.3,
    });
  }

  /**
   * Ingest documents into the vector index.
   */
  async ingest(documents: VectorDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    const pageContents = documents.map((doc) => doc.text);
    const embeddingsArray = await this.embeddings.embedDocuments(pageContents);

    const vectorsToUpsert = documents.map((doc, i) => ({
      id: String(doc.id),
      values: embeddingsArray[i],
      metadata: {
        ...(doc.metadata || {}),
        text: doc.text,
      },
    }));

    await this.pineconeIndex.upsert(vectorsToUpsert);
  }

  /**
   * Perform vector similarity search.
   */
  async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const topK = options.topK || 2;
    const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: this.pineconeIndex,
    });

    let langchainDocs = [];
    try {
      langchainDocs = await vectorStore.similaritySearch(
        query,
        topK,
        options.filter
      );
    } catch (filterErr: any) {
      if (options.filter) {
        const allResults = await vectorStore.similaritySearch(query, topK * 4);
        langchainDocs = allResults
          .filter((doc: any) => {
            if (!doc.metadata) return false;
            return Object.entries(options.filter || {}).every(
              ([key, val]) => doc.metadata[key] === val
            );
          })
          .slice(0, topK);
      } else {
        throw filterErr;
      }
    }

    return langchainDocs.map((doc: any) => ({
      document: {
        id: String(doc.metadata.id || ""),
        text: doc.pageContent,
        metadata: doc.metadata || {},
      },
    }));
  }

  /**
   * Generate a response using LLM given a query and context documents.
   */
  async generateRAGResponse(
    query: string,
    context: SearchResult[] | string = [],
    options: GenerateRAGOptions = {}
  ): Promise<string> {
    let contextText = "";
    if (typeof context === "string") {
      contextText = context;
    } else {
      contextText = context
        .map((item) => item.document.text)
        .join("\n\n---\n\n");
    }

    const defaultTemplate = `
You are a helpful AI assistant.
Answer the user's request based ONLY on the provided context.

STRICT RULES:
- Answer ONLY based on the provided context.
- Do not invent, hallucinate, or mention details not present in the context.
- If the context doesn't answer the query, politely inform the user.

User Request: {query}

Context:
{context}

Response:
`;

    const templateStr = options.systemPrompt || defaultTemplate;
    const promptTemplate = PromptTemplate.fromTemplate(templateStr);
    const formattedPrompt = await promptTemplate.format({
      context: contextText,
      query: query,
    });

    const response = await this.llm.invoke(formattedPrompt);
    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  }
}

export function createRAGEngine(config: RAGConfig): RAGEngine {
  return new RAGEngine(config);
}
