const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

// Traditional Keyword Matching Endpoint — now powered by Supabase
router.post("/keyword-search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: "Query required" });

    console.log(`\n  Received Legacy Keyword Query: "${query}"`);

    // Query Supabase with case-insensitive LIKE matching on title and description
    const { data: hotels, error } = await supabase
      .from("hotels")
      .select("*");

    if (error) {
      console.error("Supabase query error:", error.message);
      return res.status(500).json({ error: "Database query failed" });
    }

    // Simulating a basic exact-text match (The old way)
    const lowerQuery = query.toLowerCase();
    const matches = hotels.filter(
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
    console.error("Keyword search error:", error);
    res.status(500).json({ error: "Legacy DB Error" });
  }
});

module.exports = router;
