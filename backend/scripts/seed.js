require("dotenv").config();
const supabase = require("../config/supabase");
const hotelData = require("../data/hotelData");

async function seed() {
  console.log("🌱 Starting database seed...");
  console.log(`   Inserting ${hotelData.length} hotels into Supabase...\n`);

  // Upsert so the script is idempotent (safe to run multiple times)
  const { data, error } = await supabase
    .from("hotels")
    .upsert(hotelData, { onConflict: "id" })
    .select();

  if (error) {
    console.error(" Seed failed:", error.message);
    process.exit(1);
  }

  console.log(` Successfully seeded ${data.length} hotels into Supabase!\n`);
  data.forEach((h) => console.log(`   ${h.id} — ${h.title}`));
  console.log("\n🎉 Done!");
}

seed();
