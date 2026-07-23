# rg-rag-core

[![npm version](https://img.shields.io/npm/v/rg-rag-core.svg?style=flat-square)](https://www.npmjs.com/package/rg-rag-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)

A lightweight, domain-agnostic **Retrieval-Augmented Generation (RAG)** core engine for JavaScript and TypeScript applications. Encapsulates Google Gemini embeddings (`gemini-embedding-001`), Pinecone vector store operations, and LLM response synthesis via LangChain.

---

## 💡 Key Features

- **Gemini Embeddings**: Automatic 3072-dimensional vector embedding generation using `gemini-embedding-001`.
- **Pinecone Vector Database**: High-speed document vector upsert and metadata-filtered similarity retrieval.
- **LLM Response Synthesis**: Smart context injection and factual response generation using Google Gemini (`gemini-3-flash-preview`).
- **Fully Typed**: Written in 100% TypeScript with full type declarations included.

---

## 📦 Installation

```bash
npm install rg-rag-core
```

*Required peer dependencies: Ensure you have `dotenv` configured in your application environment.*

---

## 🚀 Quick Start

### 1. Configure Environment Variables

```env
GOOGLE_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

### 2. Basic Usage Example

```typescript
import { createRAGEngine } from "rg-rag-core";

// Initialize RAG Engine
const rag = createRAGEngine({
  geminiApiKey: process.env.GOOGLE_API_KEY!,
  pineconeApiKey: process.env.PINECONE_API_KEY!,
  pineconeIndexName: process.env.PINECONE_INDEX_NAME!,
});

// Ingest documents into vector storage
await rag.ingest([
  {
    id: "doc-101",
    text: "Title: Quantum Computing Overview\nDescription: Quantum computers leverage superposition and entanglement...",
    metadata: { category: "science", author: "Dr. Smith" },
  },
  {
    id: "doc-102",
    text: "Title: Deep Learning Basics\nDescription: Neural networks trained with backpropagation...",
    metadata: { category: "ai", author: "Jane Doe" },
  },
]);

// Perform semantic similarity search
const searchResults = await rag.semanticSearch("How do quantum algorithms work?", {
  topK: 2,
  filter: { category: "science" },
});

// Synthesize LLM answer grounded strictly in retrieved context
const answer = await rag.generateRAGResponse(
  "How do quantum algorithms work?",
  searchResults
);

console.log(answer);
```

---

## 📖 API Reference

### `createRAGEngine(config: RAGConfig): RAGEngine`
Factory function to instantiate a new `RAGEngine`.

#### `RAGConfig`
- `geminiApiKey` *(string)*: Google Gemini API Key.
- `pineconeApiKey` *(string)*: Pinecone Vector DB API Key.
- `pineconeIndexName` *(string)*: Target Pinecone index name.
- `embeddingModel` *(optional string)*: Default `"gemini-embedding-001"`.
- `llmModel` *(optional string)*: Default `"gemini-3-flash-preview"`.
- `temperature` *(optional number)*: Default `0.3`.

---

### `RAGEngine` Methods

#### 1. `ingest(documents: VectorDocument[]): Promise<void>`
Embeds document text into vectors and upserts into Pinecone.

#### 2. `semanticSearch(query: string, options?: SearchOptions): Promise<SearchResult[]>`
Queries Pinecone vector store with query embeddings.
- `options.topK` *(number)*: Number of results to return (default: `2`).
- `options.filter` *(Record<string, any>)*: Metadata filter query.

#### 3. `generateRAGResponse(query: string, context?: SearchResult[] | string, options?: GenerateRAGOptions): Promise<string>`
Synthesizes a factual AI response strictly grounded in context.
- `options.systemPrompt` *(optional string)*: Custom system prompt template.

---

## 📄 License

[MIT](LICENSE) © Ranula Gihara
