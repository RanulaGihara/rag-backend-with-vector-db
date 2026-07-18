require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Route Modules
const searchRoutes = require("./routes/searchRoutes");
const keywordRoutes = require("./routes/keywordRoutes");

// Initialize Express App
const app = express();
app.use(cors()); // Crucial for allowing our 3rd-party React widget to connect
app.use(express.json());

// Mount Routes
app.use("/api", searchRoutes);
app.use("/api", keywordRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` RAG API Server is running on http://localhost:${PORT}`);
  console.log(`Waiting for experience-based queries...`);
});
