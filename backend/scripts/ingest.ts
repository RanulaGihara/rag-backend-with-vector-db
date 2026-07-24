import "dotenv/config";
import { supabase } from "../lib/db/supabase";
import { hotelData } from "../lib/db/hotelData";
import { carData } from "../lib/db/carData";
import { wellnessData } from "../lib/db/wellnessData";
import { getRAGEngine } from "../services/ragService";
import { VectorDocument } from "@rag/core";

async function runIngest() {
  console.log(" Starting Multi-Domain Vector Ingestion CLI...");

  try {
    let hotels: any[] = [];
    const { data: hotelDbData, error: hotelErr } = await supabase.from("hotels").select("*");
    if (hotelErr || !hotelDbData || hotelDbData.length === 0) {
      console.warn("   Supabase hotel fetch failed or empty. Using local hotel dataset fallback.");
      hotels = hotelData;
    } else {
      hotels = hotelDbData;
    }

    let cars: any[] = [];
    const { data: carDbData, error: carErr } = await supabase.from("cars").select("*");
    if (carErr || !carDbData || carDbData.length === 0) {
      console.warn("   Supabase car fetch failed or empty. Using local car dataset fallback.");
      cars = carData;
    } else {
      cars = carDbData;
    }

    let wellness: any[] = [];
    const { data: wellnessDbData, error: wellnessErr } = await supabase.from("wellness").select("*");
    if (wellnessErr || !wellnessDbData || wellnessDbData.length === 0) {
      console.warn("   Supabase wellness fetch failed or empty. Using local wellness dataset fallback.");
      wellness = wellnessData;
    } else {
      wellness = wellnessDbData;
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

    const wellnessDocs: VectorDocument[] = wellness.map((item) => ({
      id: String(item.id),
      text: `Title: ${item.title}\nProduct & Experience Description: ${item.description}\nCategory: ${item.category}\nMindful Benefit: ${item.mindful_benefit}`,
      metadata: {
        id: item.id,
        title: item.title,
        image: item.image,
        type: "wellness_listing",
        category: item.category || "",
        price: item.price || 0,
        rating: item.rating || 0,
        mindful_benefit: item.mindful_benefit || "",
      },
    }));

    const allDocs = [...hotelDocs, ...carDocs, ...wellnessDocs];
    console.log(`  Formatting total ${allDocs.length} documents (${hotelDocs.length} hotels, ${carDocs.length} cars, ${wellnessDocs.length} wellness items)...`);

    const ragEngine = getRAGEngine();
    await ragEngine.ingest(allDocs);

    console.log(" Vector Ingestion process finished successfully!");
  } catch (err: any) {
    console.error(" Ingestion error:", err.message || err);
    process.exit(1);
  }
}

runIngest();

