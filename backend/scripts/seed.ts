import "dotenv/config";
import { supabase } from "../lib/db/supabase";
import { hotelData } from "../lib/db/hotelData";
import { carData } from "../lib/db/carData";
import { wellnessData } from "../lib/db/wellnessData";

async function seed() {
  console.log("Starting Supabase multi-domain database seed...");

  // 1. Seed Hotels
  console.log(`   Inserting ${hotelData.length} hotels into 'hotels' table...`);
  const { data: hotelRes, error: hotelErr } = await supabase
    .from("hotels")
    .upsert(hotelData, { onConflict: "id" })
    .select();

  if (hotelErr) {
    console.error("[ERROR] Hotel seed failed:", hotelErr.message);
  } else {
    console.log(`[SUCCESS] Seeded ${hotelRes.length} hotels into Supabase.`);
  }

  // 2. Seed Cars
  console.log(`   Inserting ${carData.length} vehicles into 'cars' table...`);
  const { data: carRes, error: carErr } = await supabase
    .from("cars")
    .upsert(carData, { onConflict: "id" })
    .select();

  if (carErr) {
    console.error("[ERROR] Car seed failed:", carErr.message);
  } else {
    console.log(`[SUCCESS] Seeded ${carRes.length} cars into Supabase.`);
  }

  // 3. Seed Wellness
  console.log(`   Inserting ${wellnessData.length} wellness items into 'wellness' table...`);
  const { data: wellRes, error: wellErr } = await supabase
    .from("wellness")
    .upsert(wellnessData, { onConflict: "id" })
    .select();

  if (wellErr) {
    console.error("[ERROR] Wellness seed failed:", wellErr.message);
  } else {
    console.log(`[SUCCESS] Seeded ${wellRes.length} wellness items into Supabase.`);
  }

  console.log("\nDatabase seeding complete!");
}

seed();


