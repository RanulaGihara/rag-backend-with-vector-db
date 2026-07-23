require("dotenv").config();
const supabase = require("../config/supabase");
const carData = require("../data/carData");

async function seedCars() {
  console.log(" Starting vehicle database seed...");
  console.log(`   Inserting ${carData.length} vehicles into Supabase 'cars' table...\n`);

  const { data, error } = await supabase
    .from("cars")
    .upsert(carData, { onConflict: "id" })
    .select();

  if (error) {
    console.error(" Vehicle seed failed:", error.message);
    console.error(" Note: Ensure the 'cars' table exists in your Supabase database schema.");
    console.error(" SQL to create 'cars' table if needed:");
    console.error(`
      CREATE TABLE IF NOT EXISTS cars (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        transmission TEXT,
        seats INT,
        fuel_type TEXT,
        range_or_mpg TEXT,
        price_per_day NUMERIC,
        image TEXT,
        description TEXT
      );
    `);
    process.exit(1);
  }

  console.log(` Successfully seeded ${data.length} vehicles into Supabase!\n`);
  data.forEach((c) => console.log(`   ${c.id} — ${c.title} (${c.category})`));
  console.log("\n🎉 Vehicle seeding complete!");
}

if (require.main === module) {
  seedCars();
}

module.exports = seedCars;
