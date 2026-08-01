import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─────────────────────────────────────────────────────────────
// Custom Metrics  (these appear in the k6 summary table)
// ─────────────────────────────────────────────────────────────
const ragLatency = new Trend("rag_search_latency", true); // milliseconds
const keywordLatency = new Trend("keyword_search_latency", true);
const ragFailRate = new Rate("rag_search_failures");
const keywordFailRate = new Rate("keyword_search_failures");

// ─────────────────────────────────────────────────────────────
// Test Configuration
// ─────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:5001";

// A pool of diverse, natural-language queries that exercise
// both the Pinecone vector search and the Gemini LLM generation.
const QUERIES = [
  "I want a peaceful place near a lake for meditation",
  "Looking for a hotel with great nightlife and parties",
  "Family-friendly resort with water slides and kids activities",
  "Romantic getaway with a fireplace in the mountains",
  "Beach villa with snorkeling and private sand",
  "Luxury penthouse with city views and rooftop pool",
  "Safari lodge in Africa with wildlife sightings",
  "Traditional Japanese inn with hot springs",
  "Co-working space for digital nomads with fast WiFi",
  "Ski chalet near lifts with sauna and mountain views",
  "Quiet retreat for yoga and painting by the water",
  "A place surrounded by street food and live music",
  "Hotel with elephant sightings and bush walks",
  "Cozy hotel with hot chocolate and reading by fire",
  "Beachfront accommodation with sunset walks",
];

// ─────────────────────────────────────────────────────────────
// Load Stages — Rate-Limit Compliant Research Benchmark
// Ramps to max 5 VUs over ~55 seconds to strictly prevent
// hitting LLM API tier rate limits while evaluating latency.
// ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "10s", target: 2 },  // Warm-up: ramp to 2 VUs
    { duration: "15s", target: 5 },  // Scale-up: ramp to 5 VUs
    { duration: "20s", target: 5 },  // Sustained peak: hold at 5 VUs
    { duration: "10s", target: 0 },  // Cool-down: ramp back to 0
  ],
};

// ─────────────────────────────────────────────────────────────
// Helper — pick a random query from the pool
// ─────────────────────────────────────────────────────────────
function randomQuery() {
  return QUERIES[Math.floor(Math.random() * QUERIES.length)];
}

// ─────────────────────────────────────────────────────────────
// Main Test Function (executed per VU iteration)
// ─────────────────────────────────────────────────────────────
export default function () {
  const headers = { "Content-Type": "application/json" };
  const query = randomQuery();
  const payload = JSON.stringify({ query });

  // ── 1. RAG Semantic Search (POST /api/search) ────────────
  //    This exercises: Embedding API → Pinecone → Gemini LLM
  const ragRes = http.post(`${BASE_URL}/api/search`, payload, {
    headers,
    tags: { endpoint: "rag_search" },
    timeout: "120s", // LLM calls may take time under load
  });

  ragLatency.add(ragRes.timings.duration);
  ragFailRate.add(ragRes.status !== 200);

  check(ragRes, {
    "RAG: status is 200": (r) => r.status === 200,
    "RAG: has ai_answer": (r) => {
      try {
        return JSON.parse(r.body).ai_answer !== undefined;
      } catch {
        return false;
      }
    },
    "RAG: has source_documents": (r) => {
      try {
        return Array.isArray(JSON.parse(r.body).source_documents);
      } catch {
        return false;
      }
    },
  });

  // Brief pause between the two API calls (simulates real user)
  sleep(0.5);

  // ── 2. Keyword Search (POST /api/keyword-search) ────────
  //    This exercises: Supabase DB query → in-memory filtering
  const kwRes = http.post(`${BASE_URL}/api/keyword-search`, payload, {
    headers,
    tags: { endpoint: "keyword_search" },
    timeout: "15s",
  });

  keywordLatency.add(kwRes.timings.duration);
  keywordFailRate.add(kwRes.status !== 200);

  check(kwRes, {
    "Keyword: status is 200": (r) => r.status === 200,
    "Keyword: returns source_documents": (r) => {
      try {
        return Array.isArray(JSON.parse(r.body).source_documents);
      } catch {
        return false;
      }
    },
  });

  // Think-time between iterations (2–5 seconds, randomized)
  // Spreads requests to avoid hitting API rate limits
  sleep(Math.random() * 3 + 2);
}

// ─────────────────────────────────────────────────────────────
// Summary Handler — pretty-prints a recap at test end
// ─────────────────────────────────────────────────────────────
export function handleSummary(data) {
  const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : "N/A");

  const ragVals = data.metrics.rag_search_latency
    ? data.metrics.rag_search_latency.values
    : {};
  const kwVals = data.metrics.keyword_search_latency
    ? data.metrics.keyword_search_latency.values
    : {};

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        PERFORMANCE BENCHMARK — RAG BACKEND SUMMARY       ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  RAG Search  (min):  ${fmt(ragVals.min).padStart(10)} ms              ║`);
  console.log(`║  RAG Search  (avg):  ${fmt(ragVals.avg).padStart(10)} ms              ║`);
  console.log(`║  RAG Search  (med):  ${fmt(ragVals.med).padStart(10)} ms              ║`);
  console.log(`║  RAG Search  (max):  ${fmt(ragVals.max).padStart(10)} ms              ║`);
  console.log(`║  RAG Search  (p95):  ${fmt(ragVals["p(95)"]).padStart(10)} ms              ║`);
  console.log("║──────────────────────────────────────────────────────────║");
  console.log(`║  Keyword     (min):  ${fmt(kwVals.min).padStart(10)} ms              ║`);
  console.log(`║  Keyword     (avg):  ${fmt(kwVals.avg).padStart(10)} ms              ║`);
  console.log(`║  Keyword     (med):  ${fmt(kwVals.med).padStart(10)} ms              ║`);
  console.log(`║  Keyword     (max):  ${fmt(kwVals.max).padStart(10)} ms              ║`);
  console.log(`║  Keyword     (p95):  ${fmt(kwVals["p(95)"]).padStart(10)} ms              ║`);
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Return the default stdout summary + an optional JSON file
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "load-test-results.json": JSON.stringify(data, null, 2),
  };
}

// k6 built-in helper for the text summary
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";
