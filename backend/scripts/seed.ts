import "dotenv/config";
import { supabase } from "../lib/db/supabase";
import { hotelData } from "../lib/db/hotelData";
import { carData } from "../lib/db/carData";

async function seed() {
  console.log("🌱 Starting Supabase multi-domain database seed...");

  // 1. Seed Hotels
  console.log(`   Inserting ${hotelData.length} hotels into 'hotels' table...`);
  const { data: hotelRes, error: hotelErr } = await supabase
    .from("hotels")
    .upsert(hotelData, { onConflict: "id" })
    .select();

  if (hotelErr) {
    console.error("❌ Hotel seed failed:", hotelErr.message);
  } else {
    console.log(`✅ Successfully seeded ${hotelRes.length} hotels into Supabase!`);
  }

  // 2. Seed Cars
  console.log(`   Inserting ${carData.length} vehicles into 'cars' table...`);
  const { data: carRes, error: carErr } = await supabase
    .from("cars")
    .upsert(carData, { onConflict: "id" })
    .select();

  if (carErr) {
    console.error("❌ Car seed failed:", carErr.message);
  } else {
    console.log(`✅ Successfully seeded ${carRes.length} cars into Supabase!`);
  }

  console.log("\n🎉 Database seeding complete!");
}

seed();
