require("dotenv").config();
const supabase = require("../config/supabase");
const hotelData = require("../data/hotelData");
const seedCars = require("./seedCars");

async function seed() {
  console.log(" Starting hotel database seed...");
  console.log(`   Inserting ${hotelData.length} hotels into Supabase 'hotels' table...\n`);

  // Upsert so the script is idempotent
  const { data, error } = await supabase
    .from("hotels")
    .upsert(hotelData, { onConflict: "id" })
    .select();

  if (error) {
    console.error(" Hotel seed failed:", error.message);
  } else {
    console.log(` Successfully seeded ${data.length} hotels into Supabase!\n`);
    data.forEach((h) => console.log(`   ${h.id} — ${h.title}`));
  }

  // Also trigger car seed automatically
  console.log("\n----------------------------------------");
  try {
    await seedCars();
  } catch (err) {
    console.error("Car seed error:", err.message);
  }

  console.log("\nAll database seeding complete!");
}

seed();
