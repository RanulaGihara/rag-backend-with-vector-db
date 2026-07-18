const { Pinecone } = require("@pinecone-database/pinecone");
const {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} = require("@langchain/google-genai");

// Initialize Pinecone Vector DB
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME);

// Embeddings model for semantic search (must match what we used in ingest.js)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

// The generative LLM for the RAG response
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3-flash-preview",
  temperature: 0.3, // Low temperature keeps the AI factual and prevents hallucination
});

module.exports = { pc, pineconeIndex, embeddings, llm };
