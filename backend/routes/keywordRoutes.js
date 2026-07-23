const express = require("express");
const supabase = require("../config/supabase");
const localHotelData = require("../data/hotelData");
const localCarData = require("../data/carData");

const router = express.Router();

// Multi-Domain Keyword Matching Endpoint — powered by Supabase & Local Fallbacks
router.post("/keyword-search", async (req, res) => {
  try {
    const { query, domain = "hotel" } = req.body;

    if (!query) return res.status(400).json({ error: "Query required" });

    const isCarDomain = domain === "car" || domain === "vehicle";
    const tableName = isCarDomain ? "cars" : "hotels";

    console.log(`\n Received Legacy Keyword Query [Domain: ${domain}]: "${query}"`);

    // Query Supabase table for target domain
    let items = [];
    const { data: dbItems, error } = await supabase
      .from(tableName)
      .select("*");

    if (error || !dbItems || dbItems.length === 0) {
      console.warn(` Supabase '${tableName}' query issue/empty, using local dataset fallback.`);
      items = isCarDomain ? localCarData : localHotelData;
    } else {
      items = dbItems;
    }

    // Exact text substring matching (The legacy way)
    const lowerQuery = query.toLowerCase();
    const matches = items.filter((item) => {
      const titleMatch = item.title && item.title.toLowerCase().includes(lowerQuery);
      const descMatch = item.description && item.description.toLowerCase().includes(lowerQuery);
      const catMatch = item.category && item.category.toLowerCase().includes(lowerQuery);
      const transMatch = item.transmission && item.transmission.toLowerCase().includes(lowerQuery);
      const fuelMatch = item.fuel_type && item.fuel_type.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch || catMatch || transMatch || fuelMatch;
    });

    console.log(`Found ${matches.length} exact keyword matches in ${tableName}.`);

    res.json({
      ai_answer: null, // Legacy search has no AI
      source_documents: matches,
    });
  } catch (error) {
    console.error("Keyword search error:", error);
    res.status(500).json({ error: "Legacy DB Error" });
  }
});

module.exports = router;
