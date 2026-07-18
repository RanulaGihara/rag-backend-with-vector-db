const express = require("express");
const { PineconeStore } = require("@langchain/pinecone");
const { PromptTemplate } = require("@langchain/core/prompts");
const { pineconeIndex, embeddings, llm } = require("../config/ai");

const router = express.Router();

// The Semantic Search & RAG Endpoint
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    console.log(`\n Received Search Query: "${query}"`);

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
    console.log("Successfully generated response!");
    res.json({
      ai_answer: aiResponse.content,
      source_documents: sourceDocuments,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    res
      .status(500)
      .json({ error: "An internal server error occurred during the search." });
  }
});

module.exports = router;
