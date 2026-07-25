# RAG-Powered Hotel Recommendation Engine

> **MSc Research Project** — A Retrieval-Augmented Generation (RAG) backend with a vector database for semantic hotel search, compared against traditional keyword-based matching.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                    │
│                     http://localhost:5173                        │
└──────────────┬───────────────────────────┬──────────────────────┘
               │                           │
       POST /api/search            POST /api/keyword-search
               │                           │
┌──────────────▼───────────────────────────▼──────────────────────┐
│                   Express.js Backend (Node.js)                  │
│                     http://localhost:5001                        │
├─────────────────────────┬───────────────────────────────────────┤
│    RAG Search Pipeline  │        Keyword Search Pipeline        │
│                         │                                       │
│  1. Embed query         │  1. Fetch all hotels from Supabase    │
│     (Gemini Embedding)  │  2. Filter by keyword match           │
│  2. Pinecone vector     │     (case-insensitive includes)       │
│     similarity search   │  3. Return matched documents          │
│  3. Gemini LLM          │                                       │
│     (RAG generation)    │                                       │
│  4. Return AI answer    │                                       │
│     + source documents  │                                       │
└────────┬────────┬───────┴───────────┬───────────────────────────┘
         │        │                   │
    ┌────▼──┐ ┌───▼────┐        ┌────▼────┐
    │Gemini │ │Pinecone│        │Supabase │
    │  API  │ │VectorDB│        │PostgreSQL│
    └───────┘ └────────┘        └─────────┘
```

## Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Frontend    | React 19, Vite 8                     |
| Backend     | Express.js 5, Node.js                |
| LLM         | Google Gemini 3 Flash (via LangChain)|
| Embeddings  | Gemini Embedding 001 (3072-dim)      |
| Vector DB   | Pinecone                             |
| Relational DB | Supabase (PostgreSQL)              |
| Load Testing| Grafana k6                           |

---

## Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **k6** (for load testing) — Install via Homebrew:
  ```bash
  brew install k6
  ```

### API Keys Required

| Service  | Get it from                                      |
| -------- | ------------------------------------------------ |
| Google Gemini | [Google AI Studio](https://aistudio.google.com/) |
| Pinecone | [Pinecone Console](https://app.pinecone.io/)     |
| Supabase | [Supabase Dashboard](https://supabase.com/)      |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rag-backend-with-vector-db
```

### 2. Configure Environment Variables

```bash
cd backend
cp .example.env .env
```

Edit `backend/.env` with your actual API keys:

```env
# Server Configuration
PORT=5001

# Google Gemini AI Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Pinecone Vector DB Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=hotel-catalog

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note:** macOS AirPlay Receiver occupies port 5000 by default. Use port `5001` or disable AirPlay Receiver in **System Settings → General → AirDrop & Handoff**.

### 3. Set Up the Backend

```bash
cd backend
npm install
```

### 4. Seed the Database (Supabase)

Inserts 10 hotel records into the Supabase `hotels` table. This is idempotent — safe to run multiple times.

```bash
npm run seed
```

### 5. Ingest Data into Pinecone (Vector Embeddings)

Generates 3072-dimensional embeddings via Gemini Embedding 001 and uploads them to your Pinecone index.

```bash
npm run ingest
```

> **Important:** Your Pinecone index must be configured with **3072 dimensions** and **cosine** similarity to match the Gemini Embedding 001 model.

### 6. Start the Backend Server

```bash
npm start
```

The API server will start at `http://localhost:5001`.

### 7. Set Up & Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The React app will start at `http://localhost:5173`.

---

## API Endpoints

### `POST /api/search` — RAG Semantic Search

The primary endpoint. Uses vector similarity search + LLM generation.

**Request:**
```json
{
  "query": "I want a peaceful place near a lake for meditation"
}
```

**Response:**
```json
{
  "ai_answer": "Based on your interest in peace and meditation, I'd recommend...",
  "source_documents": [
    {
      "id": "HOTEL-001",
      "title": "Zen Lakeside Retreat",
      "image": "https://..."
    }
  ]
}
```

### `POST /api/keyword-search` — Traditional Keyword Search

Legacy endpoint for comparison. Uses exact text matching against Supabase.

**Request:**
```json
{
  "query": "beach"
}
```

**Response:**
```json
{
  "ai_answer": null,
  "source_documents": [
    {
      "id": "HOTEL-005",
      "title": "Coral Reef Beach Villa",
      "description": "A beachfront villa with..."
    }
  ]
}
```

---

## NPM Scripts Reference

All scripts are run from the `backend/` directory.

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `npm start`          | Start the Express API server                          |
| `npm run seed`       | Seed hotel data into Supabase                         |
| `npm run ingest`     | Generate embeddings and upload to Pinecone             |
| `npm run loadtest`   | Run k6 performance load test with CSV output           |

---

## Performance Load Testing

Load testing uses [Grafana k6](https://k6.io/) to benchmark the asynchronous architecture under concurrent LLM and Vector DB API calls.

### Test Configuration

| Parameter      | Value     |
| -------------- | --------- |
| Peak VUs       | 10        |
| Total Duration | ~60s      |
| Ramp Profile   | 0 → 5 → 10 → 10 → 0 VUs |
| Request Timeout| 120s (RAG), 15s (Keyword)  |
| Query Pool     | 15 diverse natural-language queries |

### Load Stages

| Stage     | Duration | Target VUs | Purpose               |
| --------- | -------- | ---------- | --------------------- |
| Warm-up   | 15s      | 5          | Baseline latency      |
| Scale-up  | 15s      | 10         | Mid-load behaviour    |
| Sustained | 20s      | 10         | Steady-state at peak  |
| Cool-down | 10s      | 0          | Graceful wind-down    |

### Running the Load Test

**Step 1:** Ensure the backend is running:
```bash
npm start
```

**Step 2:** In a separate terminal, run the load test:
```bash
npm run loadtest
```

Or run directly with k6:
```bash
k6 run --out csv=load-testing/results.csv load-testing/loadtest.js
```

### Test Output

The test produces:
- **Terminal summary** — min, max, avg, median, p95 latency for both endpoints
- **`load-testing/results.csv`** — Timestamped raw metrics for graphing
- **`load-testing/load-test-results.json`** — JSON summary of all metrics

### Visualizing Results

Open `load-testing/visualize-results.html` in a browser, then load the `results.csv` file to generate:

1. **Response Time Over Time** — RAG vs Keyword latency across the test
2. **Latency Distribution** — Side-by-side bar chart (Min/Avg/Median/P95/Max)
3. **VUs vs Response Time** — Dual-axis chart showing latency under load

```bash
open load-testing/visualize-results.html
```

---

## Project Structure

```
rag-backend-with-vector-db/
├── README.md
├── backend/
│   ├── .env                    # API keys (not committed)
│   ├── .example.env            # Template for .env
│   ├── server.js               # Express app entry point
│   ├── ingest.js               # Pinecone vector ingestion script
│   ├── package.json
│   ├── config/
│   │   ├── ai.js               # Pinecone + Gemini client setup
│   │   └── supabase.js         # Supabase client setup
│   ├── data/
│   │   └── hotelData.js        # Master hotel dataset (10 records)
│   ├── routes/
│   │   ├── searchRoutes.js     # POST /api/search (RAG pipeline)
│   │   └── keywordRoutes.js    # POST /api/keyword-search (legacy)
│   ├── scripts/
│   │   └── seed.js             # Supabase database seeder
│   └── load-testing/
│       ├── loadtest.js          # k6 load testing script
│       ├── visualize-results.html # Chart visualization (Chart.js)
│       ├── results.csv          # Raw k6 CSV output
│       └── load-test-results.json # JSON summary
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Main React application
│       ├── App.css
│       └── index.css
└── .gitignore
```

---

## License

This project is part of an MSc research thesis and is intended for academic purposes.
