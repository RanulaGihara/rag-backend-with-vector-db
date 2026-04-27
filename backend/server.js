require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pinecone } = require("@pinecone-database/pinecone");
const {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} = require("@langchain/google-genai");
const { PineconeStore } = require("@langchain/pinecone");
const { PromptTemplate } = require("@langchain/core/prompts");

// Initialize Express App
const app = express();
app.use(cors()); // Crucial for allowing our 3rd-party React widget to connect
app.use(express.json());

// 1. Initialize AI and DB Connections
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

// 2. The Semantic Search & RAG Endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    console.log(`\n🔍 Received Search Query: "${query}"`);

    // Step A: Vector Retrieval (Semantic Search)
    console.log("Searching Pinecone for the closest semantic matches...");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    // Retrieve the top 2 closest matches
    const searchResults = await vectorStore.similaritySearch(query, 2);

    if (searchResults.length === 0) {
      return res.json({
        ai_answer:
          "I couldn't find any experiences matching your request in our current catalog.",
        source_documents: [],
      });
    }

    // Step B: Prepare Context for RAG
    // We combine the descriptions of the found hotels so the AI can read them
    const contextText = searchResults
      .map((doc) => doc.pageContent)
      .join("\n\n---\n\n");
    const sourceDocuments = searchResults.map((doc) => doc.metadata); // The raw data for the React UI cards

    // Step C: The RAG Prompt Engineering
    // This is where we instruct the AI to act as an Experience Matchmaker
    const promptTemplate = PromptTemplate.fromTemplate(`
            You are a highly skilled Travel & Experience Matchmaker. 
            A user is looking for a specific type of experience. 
            
            Read the provided "Available Hotels" context carefully. 
            Write a short, engaging response explaining why these specific hotels are a perfect match for what they are looking for.
            
            STRICT RULES:
            - Answer ONLY based on the provided context.
            - Do not invent, hallucinate, or mention hotels that are not in the context.
            - If the context doesn't perfectly match the query, politely explain why it's the closest available option.
            
            User's Request: {query}
            
            Available Hotels (Context):
            {context}
            
            Your Matchmaker Response:
        `);

    // Step D: Generate the AI Response
    console.log("Generating RAG Matchmaker response via Gemini 1.5 Flash...");
    const formattedPrompt = await promptTemplate.format({
      context: contextText,
      query: query,
    });
    const aiResponse = await llm.invoke(formattedPrompt);

    // Step E: Send the Payload Back to the Widget
    console.log("✅ Successfully generated response!");
    res.json({
      ai_answer: aiResponse.content,
      source_documents: sourceDocuments,
    });
  } catch (error) {
    console.error("❌ Search API Error:", error);
    res
      .status(500)
      .json({ error: "An internal server error occurred during the search." });
  }
});

// ==========================================================
// TRADITIONAL KEYWORD SEARCH DEMO (For Presentation)
// ==========================================================

// Simulating a standard MySQL/PostgreSQL legacy database
const legacyDatabase = [
  {
    id: "HOTEL-001",
    title: "Zen Lakeside Retreat",
    description:
      "A quiet, disconnected cabin in the woods. Perfect for meditation, morning yoga on the dock, and painting by the water. No loud noises, just nature and tranquility.",
  },
  {
    id: "HOTEL-002",
    title: "Urban Nightlife Hub",
    description:
      "Located right in the middle of the downtown club district. Surrounded by street food, loud music, and vibrant nightlife. Perfect for night owls looking to party.",
  },
  {
    id: "HOTEL-003",
    title: "Family Splash Resort",
    description:
      "A massive, high-energy resort packed with water slides, kid's clubs, and daily entertainment programs. Great for energetic families who want non-stop activities.",
  },
  {
    id: "HOTEL-004",
    title: "Historic Mountain Inn",
    description:
      "Cozy rooms with giant stone fireplaces and thick blankets. Ideal for couples looking for a romantic, snowy getaway with hot chocolate and reading by the fire.",
  },
];

// Traditional Keyword Matching Endpoint
app.post("/api/keyword-search", (req, res) => {
  try {
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: "Query required" });

    console.log(`\n🔍 Received Legacy Keyword Query: "${query}"`);

    const lowerQuery = query.toLowerCase();

    // Simulating a basic exact-text match (The old way)
    const matches = legacyDatabase.filter(
      (hotel) =>
        hotel.title.toLowerCase().includes(lowerQuery) ||
        hotel.description.toLowerCase().includes(lowerQuery),
    );

    console.log(`Found ${matches.length} exact keyword matches.`);

    res.json({
      ai_answer: null, // Legacy search doesn't have an AI agent!
      source_documents: matches,
    });
  } catch (error) {
    res.status(500).json({ error: "Legacy DB Error" });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RAG API Server is running on http://localhost:${PORT}`);
  console.log(`Waiting for experience-based queries...`);
});
