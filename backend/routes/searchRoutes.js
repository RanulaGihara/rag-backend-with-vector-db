const express = require("express");
const { PineconeStore } = require("@langchain/pinecone");
const { PromptTemplate } = require("@langchain/core/prompts");
const { pineconeIndex, embeddings, llm } = require("../config/ai");

const router = express.Router();

// The Multi-Domain Semantic Search & RAG Endpoint
router.post("/search", async (req, res) => {
  try {
    const { query, domain = "hotel" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const isCarDomain = domain === "car" || domain === "vehicle";
    const targetType = isCarDomain ? "car_listing" : "hotel_listing";

    console.log(`\n Received Multi-Domain Search Query [Domain: ${domain}]: "${query}"`);

    // Step A: Vector Retrieval with Pinecone Metadata Filter
    console.log(`Searching Pinecone for closest semantic matches with filter { type: "${targetType}" }...`);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    // Retrieve top 2 closest matches filtered by domain type
    let searchResults = [];
    try {
      searchResults = await vectorStore.similaritySearch(query, 2, {
        type: targetType,
      });
    } catch (filterErr) {
      console.warn("  ⚠️ Pinecone filter query issue, falling back to unfiltered search:", filterErr.message);
      const allResults = await vectorStore.similaritySearch(query, 5);
      searchResults = allResults.filter((doc) => doc.metadata?.type === targetType).slice(0, 2);
    }

    if (searchResults.length === 0) {
      return res.json({
        ai_answer: isCarDomain
          ? "I couldn't find any rental vehicles matching your request in our fleet catalog."
          : "I couldn't find any experiences matching your request in our current hotel catalog.",
        source_documents: [],
      });
    }

    // Step B: Prepare Context for RAG
    const contextText = searchResults
      .map((doc) => doc.pageContent)
      .join("\n\n---\n\n");
    const sourceDocuments = searchResults.map((doc) => doc.metadata);

    // Step C: Multi-Domain Prompt Engineering
    const promptTemplate = isCarDomain
      ? PromptTemplate.fromTemplate(`
            You are a highly skilled Car & Vehicle Mobility Specialist. 
            A user is looking for a rental vehicle matching their specific travel vibe and requirements. 
            
            Read the provided "Available Vehicles" context carefully. 
            Write a short, engaging response explaining why these specific vehicles are a perfect match for what they are looking for (highlight specs like category, seats, transmission, range/fuel, or driving vibe).
            
            STRICT RULES:
            - Answer ONLY based on the provided context.
            - Do not invent, hallucinate, or mention vehicles that are not in the context.
            - If the context doesn't perfectly match the query, politely explain why it's the closest available option.
            
            User's Request: {query}
            
            Available Vehicles (Context):
            {context}
            
            Your Vehicle Specialist Response:
        `)
      : PromptTemplate.fromTemplate(`
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
    console.log(`Generating RAG response via Gemini for ${domain} domain...`);
    const formattedPrompt = await promptTemplate.format({
      context: contextText,
      query: query,
    });
    const aiResponse = await llm.invoke(formattedPrompt);

    // Step E: Send Payload Back
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
