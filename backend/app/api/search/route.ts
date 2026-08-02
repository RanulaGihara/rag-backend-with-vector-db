import { NextRequest, NextResponse } from "next/server";
import { getRAGEngine } from "../../../services/ragService";
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
    const isWellnessDomain = domain === "wellness";
    
    let targetType = "hotel_listing";
    if (isCarDomain) {
      targetType = "car_listing";
    } else if (isWellnessDomain) {
      targetType = "wellness_listing";
    }

    console.log(`\nReceived Multi-Domain Search Query [Domain: ${domain}]: "${query}"`);

    const ragEngine = getRAGEngine();

    const searchResults = await ragEngine.semanticSearch(query, {
      topK: 2,
      filter: { type: targetType },
    });

    if (searchResults.length === 0) {
      let noResultAnswer = "I couldn't find any experiences matching your request in our current hotel catalog.";
      if (isCarDomain) {
        noResultAnswer = "I couldn't find any rental vehicles matching your request in our fleet catalog.";
      } else if (isWellnessDomain) {
        noResultAnswer = "I couldn't find any wellness products, spa packages, or retreats matching your request in our mindfulness catalog.";
      }

      return NextResponse.json(
        {
          ai_answer: noResultAnswer,
          source_documents: [],
        },
        { headers: corsHeaders() }
      );
    }

    const wellnessSystemPrompt = `
You are a highly empathetic Holistic Wellness Concierge & Mindful Living Specialist. 
A user is seeking wellness products, therapeutic spa packages, or mindful retreat experiences to improve their physical, emotional, and mental well-being.

Read the provided "Available Wellness Offerings" context carefully. 
Write a warm, compassionate, and inspiring response explaining why these specific wellness offerings are perfectly aligned with their desire for stress relief, deep relaxation, energy restoration, or mindful living (highlight mindful benefits, natural ingredients, and therapeutic features).

STRICT RULES:
- Answer ONLY based on the provided context.
- Do not invent, hallucinate, or mention wellness offerings that are not in the context.
- If the context doesn't perfectly match the query, gently explain why it's the closest holistic recommendation.

User's Request: {query}

Available Wellness Offerings (Context):
{context}

Your Holistic Wellness Concierge Response:
`;

    const carSystemPrompt = `
You are a highly skilled Car & Vehicle Mobility Specialist. 
A user is looking for a rental vehicle matching their specific travel vibe and requirements. 

Read the provided "Available Vehicles" context carefully. 
Write a short, engaging response explaining why these specific vehicles are a perfect match for what they are looking for (highlight specs like category, seats, transmission, range/fuel, or driving vibe).

STRICT RULES:
- Answer ONLY based on the provided context.
- Do not invent, hallucinate, or mention vehicles that are not in the context.
- If the context doesn't perfectly match the query, politely explain why it's the closest available option.

User's Request: {query}

Available Vehicles (Context):
{context}

Your Vehicle Specialist Response:
`;

    const hotelSystemPrompt = `
You are a highly skilled Travel & Experience Matchmaker. 
A user is looking for a specific type of experience. 

Read the provided "Available Hotels" context carefully. 
Write a short, engaging response explaining why these specific hotels are a perfect match for what they are looking for.

STRICT RULES:
- Answer ONLY based on the provided context.
- Do not invent, hallucinate, or mention hotels that are not in the context.
- If the context doesn't perfectly match the query, politely explain why it's the closest available option.

User's Request: {query}

Available Hotels (Context):
{context}

Your Matchmaker Response:
`;

    let systemPrompt = hotelSystemPrompt;
    if (isWellnessDomain) {
      systemPrompt = wellnessSystemPrompt;
    } else if (isCarDomain) {
      systemPrompt = carSystemPrompt;
    }

    const aiAnswer = await ragEngine.generateRAGResponse(query, searchResults, {
      systemPrompt,
    });

    const sourceDocuments = searchResults.map((item: any) => item.document.metadata);

    return NextResponse.json(
      {
        ai_answer: aiAnswer,
        source_documents: sourceDocuments,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Search API Route Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred during the search." },
      { status: 500, headers: corsHeaders() }
    );
  }
}

