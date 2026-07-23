require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const supabase = require("./config/supabase");
const localHotelData = require("./data/hotelData");
const localCarData = require("./data/carData");

async function ingestData() {
  console.log("Starting Multi-Domain Data Ingestion Process...");

  try {
    // 1. Fetch Hotel Data (Supabase with local fallback)
    console.log("Fetching hotel data from Supabase...");
    let hotels = [];
    const { data: hotelDbData, error: hotelErr } = await supabase
      .from("hotels")
      .select("*");

    if (hotelErr || !hotelDbData || hotelDbData.length === 0) {
      console.warn("  ⚠️ Supabase hotel fetch failed or returned empty. Using local hotel dataset fallback.");
      hotels = localHotelData;
    } else {
      hotels = hotelDbData;
      console.log(`  Fetched ${hotels.length} hotels from Supabase.`);
    }

    // 2. Fetch Car Data (Supabase with local fallback)
    console.log("Fetching vehicle data from Supabase...");
    let cars = [];
    const { data: carDbData, error: carErr } = await supabase
      .from("cars")
      .select("*");

    if (carErr || !carDbData || carDbData.length === 0) {
      console.warn("  ⚠️ Supabase vehicle fetch failed or returned empty. Using local vehicle dataset fallback.");
      cars = localCarData;
    } else {
      cars = carDbData;
      console.log(`  Fetched ${cars.length} vehicles from Supabase.`);
    }

    console.log("Connecting to Pinecone...");
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME);

    console.log("Formatting multi-domain data into searchable documents...");
    
    // Format Hotels
    const hotelDocs = hotels.map((item) => ({
      pageContent: `Title: ${item.title}\nExperience Description: ${item.description}`,
      metadata: {
        id: item.id,
        title: item.title,
        image: item.image,
        type: "hotel_listing",
      },
    }));

    // Format Vehicles
    const carDocs = cars.map((item) => ({
      pageContent: `Title: ${item.title}\nVehicle Specs & Vibe: ${item.description}\nCategory: ${item.category}\nTransmission: ${item.transmission}\nSeats: ${item.seats}\nFuel: ${item.fuel_type || ""}\nRange/MPG: ${item.range_or_mpg || ""}`,
      metadata: {
        id: item.id,
        title: item.title,
        image: item.image,
        type: "car_listing",
        category: item.category || "",
        transmission: item.transmission || "",
        seats: item.seats || 5,
        fuel_type: item.fuel_type || "",
        range_or_mpg: item.range_or_mpg || "",
        price_per_day: item.price_per_day || 0,
      },
    }));

    const docs = [...hotelDocs, ...carDocs];
    console.log(`  Total searchable documents: ${docs.length} (${hotelDocs.length} hotels, ${carDocs.length} vehicles).`);

    // Initializing Gemini Embeddings
    console.log("Initializing Gemini gemini-embedding-001...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-embedding-001",
    });

    console.log("Testing Gemini API connection...");
    const testVector = await embeddings.embedQuery("Connection test");
    console.log(` Success! Gemini returned vector with ${testVector.length} dimensions.`);

    if (testVector.length !== 3072) {
      throw new Error(`Dimension mismatch! Expected 3072 but got ${testVector.length}.`);
    }

    console.log("Generating embeddings and uploading to Pinecone...");
    const pageContents = docs.map((doc) => doc.pageContent);
    const embeddingsArray = await embeddings.embedDocuments(pageContents);

    const vectorsToUpsert = docs.map((doc, i) => ({
      id: doc.metadata.id.toString(),
      values: embeddingsArray[i],
      metadata: {
        ...doc.metadata,
        text: doc.pageContent,
      },
    }));

    await pineconeIndex.upsert(vectorsToUpsert);

    console.log(" Ingestion Complete! Multi-domain semantic database (Hotels & Vehicles) is ready.");
  } catch (error) {
    console.error(" Error during ingestion:");
    console.error(error.message || error);
  }
}

ingestData();
