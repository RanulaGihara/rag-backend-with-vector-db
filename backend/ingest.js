require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { PineconeStore } = require("@langchain/pinecone");

const mockHotelData = [
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

async function ingestData() {
  console.log("🚀 Starting Data Ingestion Process...");

  try {
    console.log("Connecting to Pinecone...");
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME);

    console.log("Formatting legacy data into searchable documents...");
    const docs = mockHotelData.map((item) => ({
      pageContent: `Title: ${item.title}\nExperience Description: ${item.description}`,
      metadata: {
        id: item.id,
        title: item.title,
        type: "hotel_listing",
      },
    }));

    // UPGRADE: Using the new gemini-embedding-001 model
    console.log("Initializing Gemini gemini-embedding-001...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-embedding-001",
    });

    // SANITY CHECK: Expecting 3072 dimensions now
    console.log("Testing Gemini API connection...");
    const testVector = await embeddings.embedQuery(
      "Just testing the connection",
    );
    console.log(
      `✅ Success! Gemini returned a vector with ${testVector.length} dimensions.`,
    );

    if (testVector.length !== 3072) {
      throw new Error(
        `Dimension mismatch! Expected 3072 but got ${testVector.length}.`,
      );
    }

    console.log(
      "Generating embeddings and uploading to Pinecone. This may take a few seconds...",
    );
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    console.log("✅ Ingestion Complete! Your semantic database is ready.");
  } catch (error) {
    console.error("❌ Error during ingestion:");
    console.error(error.message || error);
  }
}

ingestData();
