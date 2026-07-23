import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/db/supabase";
import { hotelData } from "../../../lib/db/hotelData";
import { carData } from "../../../lib/db/carData";
import { corsHeaders, handleOptions } from "../../../lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query, domain = "hotel" } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const isCarDomain = domain === "car" || domain === "vehicle";
    const tableName = isCarDomain ? "cars" : "hotels";

    console.log(`\nReceived Legacy Keyword Query [Domain: ${domain}]: "${query}"`);

    let items: any[] = [];
    const { data: dbItems, error } = await supabase.from(tableName).select("*");

    if (error || !dbItems || dbItems.length === 0) {
      console.warn(`Supabase '${tableName}' query issue or empty, using local dataset fallback.`);
      items = isCarDomain ? carData : hotelData;
    } else {
      items = dbItems;
    }

    const lowerQuery = query.toLowerCase();
    const matches = items.filter((item) => {
      const titleMatch = item.title && item.title.toLowerCase().includes(lowerQuery);
      const descMatch = item.description && item.description.toLowerCase().includes(lowerQuery);
      const catMatch = item.category && item.category.toLowerCase().includes(lowerQuery);
      const transMatch = item.transmission && item.transmission.toLowerCase().includes(lowerQuery);
      const fuelMatch = item.fuel_type && item.fuel_type.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch || catMatch || transMatch || fuelMatch;
    });

    console.log(`Found ${matches.length} exact keyword matches in ${tableName}.`);

    return NextResponse.json(
      {
        ai_answer: null,
        source_documents: matches,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Keyword search error:", error);
    return NextResponse.json(
      { error: "Legacy DB Error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
