require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { PineconeStore } = require("@langchain/pinecone");
const hotelData = require("./data/hotelData");

async function ingestData() {
  console.log("Starting Data Ingestion Process...");

  try {
    console.log("Connecting to Pinecone...");
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME);

    console.log("Formatting legacy data into searchable documents...");
    const docs = hotelData.map((item) => ({
      pageContent: `Title: ${item.title}\nExperience Description: ${item.description}`,
      metadata: {
        id: item.id,
        title: item.title,
        image: item.image,
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
      ` Success! Gemini returned a vector with ${testVector.length} dimensions.`,
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

    console.log(" Ingestion Complete! Your semantic database is ready.");
  } catch (error) {
    console.error(" Error during ingestion:");
    console.error(error.message || error);
  }
}

ingestData();
