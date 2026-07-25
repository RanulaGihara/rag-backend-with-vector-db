export interface RAGConfig {
  geminiApiKey: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  vectorDimension?: number;
  embeddingModel?: string;
  llmModel?: string;
  temperature?: number;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  topK?: number;
  filter?: Record<string, any>;
}

export interface SearchResult {
  document: VectorDocument;
  score?: number;
  synthesizedAnswer?: string;
}

export interface GenerateRAGOptions {
  systemPrompt?: string;
  temperature?: number;
}
