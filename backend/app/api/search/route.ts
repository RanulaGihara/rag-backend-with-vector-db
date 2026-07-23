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
    const targetType = isCarDomain ? "car_listing" : "hotel_listing";

    console.log(`\nReceived Multi-Domain Search Query [Domain: ${domain}]: "${query}"`);

    const ragEngine = getRAGEngine();

    // 1. Retrieve vector search results using core RAG engine
    const searchResults = await ragEngine.semanticSearch(query, {
      topK: 2,
      filter: { type: targetType },
    });

    if (searchResults.length === 0) {
      return NextResponse.json(
        {
          ai_answer: isCarDomain
            ? "I couldn't find any rental vehicles matching your request in our fleet catalog."
            : "I couldn't find any experiences matching your request in our current hotel catalog.",
          source_documents: [],
        },
        { headers: corsHeaders() }
      );
    }

    // 2. Application-layer Domain Prompt Engineering
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

    const systemPrompt = isCarDomain ? carSystemPrompt : hotelSystemPrompt;

    // 3. Synthesize RAG response using core engine
    const aiAnswer = await ragEngine.generateRAGResponse(query, searchResults, {
      systemPrompt,
    });

    const sourceDocuments = searchResults.map((item) => item.document.metadata);

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
