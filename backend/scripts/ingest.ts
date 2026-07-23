import "dotenv/config";
import { supabase } from "../lib/db/supabase";
import { hotelData } from "../lib/db/hotelData";
import { carData } from "../lib/db/carData";
import { getRAGEngine } from "../services/ragService";
import { VectorDocument } from "@rag/core";

async function runIngest() {
  console.log("🚀 Starting Multi-Domain Vector Ingestion CLI...");

  try {
    let hotels: any[] = [];
    const { data: hotelDbData, error: hotelErr } = await supabase.from("hotels").select("*");
    if (hotelErr || !hotelDbData || hotelDbData.length === 0) {
      console.warn("  ⚠️ Supabase hotel fetch failed or empty. Using local hotel dataset fallback.");
      hotels = hotelData;
    } else {
      hotels = hotelDbData;
    }

    let cars: any[] = [];
    const { data: carDbData, error: carErr } = await supabase.from("cars").select("*");
    if (carErr || !carDbData || carDbData.length === 0) {
      console.warn("  ⚠️ Supabase car fetch failed or empty. Using local car dataset fallback.");
      cars = carData;
    } else {
      cars = carDbData;
    }

    const hotelDocs: VectorDocument[] = hotels.map((item) => ({
      id: String(item.id),
      text: `Title: ${item.title}\nExperience Description: ${item.description}`,
      metadata: {
        id: item.id,
        title: item.title,
        image: item.image,
        type: "hotel_listing",
      },
    }));

    const carDocs: VectorDocument[] = cars.map((item) => ({
      id: String(item.id),
      text: `Title: ${item.title}\nVehicle Specs & Vibe: ${item.description}\nCategory: ${item.category}\nTransmission: ${item.transmission}\nSeats: ${item.seats}\nFuel: ${item.fuel_type || ""}\nRange/MPG: ${item.range_or_mpg || ""}`,
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

    const allDocs = [...hotelDocs, ...carDocs];
    console.log(`  Formatting total ${allDocs.length} documents (${hotelDocs.length} hotels, ${carDocs.length} cars)...`);

    const ragEngine = getRAGEngine();
    await ragEngine.ingest(allDocs);

    console.log("✅ Vector Ingestion process finished successfully!");
  } catch (err: any) {
    console.error("❌ Ingestion error:", err.message || err);
    process.exit(1);
  }
}

runIngest();
