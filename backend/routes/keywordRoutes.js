const express = require("express");
const legacyDatabase = require("../data/legacyDatabase");

const router = express.Router();

// Traditional Keyword Matching Endpoint
router.post("/keyword-search", (req, res) => {
  try {
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: "Query required" });

    console.log(`\n  Received Legacy Keyword Query: "${query}"`);

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

module.exports = router;
