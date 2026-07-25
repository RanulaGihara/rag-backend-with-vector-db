# Multi-Domain RAG Monorepo Architecture vs Traditional Keyword Search

> **MSc Research Thesis Project** — An empirical research evaluation of a domain-agnostic Retrieval-Augmented Generation (RAG) monorepo architecture leveraging Vector Databases (Pinecone) and LLMs (Google Gemini) compared against traditional relational keyword-based search across three distinct commercial domains (Hotel Booking, Car Rental, and Wellness Retreats).

---

## Examiner Verification & Submission Checklist

This repository has been structured to strictly satisfy all academic submission guidelines issued for the MSc thesis project.

| Lecturer Requirement | Status in Repository | File Path / Implementation Reference |
| :--- | :---: | :--- |
| **Complete Source Code** | Included | Monorepo (`packages/core`, `backend`, `frontend`, `frontend-car`, `frontend-wellness`) |
| **Model Ingestion & Evaluation Scripts** | Included | Vector Ingestion: [`backend/scripts/ingest.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/scripts/ingest.ts)<br>k6 Benchmarking: [`backend/load-testing/loadtest.js`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/load-testing/loadtest.js) |
| **Data Preprocessing Scripts** | Included | Seeding: [`backend/scripts/seed.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/scripts/seed.ts)<br>Datasets: [`backend/lib/db/`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/lib/db) |
| **Front-end, Back-end & Database** | Included | 3 React Frontends (`frontend*`), Next.js 14 Backend (`backend`), `rg-rag-core` Package (`packages/core`), Supabase PostgreSQL + Pinecone Vector DB |
| **Database Schemas & Scripts** | Included | DDL Script: [`database/schema.sql`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/database/schema.sql)<br>Seeders: [`backend/scripts/seed.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/scripts/seed.ts) |
| **Test Files & Empirical Evidence** | Included | Load Test: [`backend/load-testing/loadtest.js`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/load-testing/loadtest.js)<br>Raw Metrics: [`backend/load-testing/results.csv`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/load-testing/results.csv)<br>Visualizer: [`backend/load-testing/visualize-results.html`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/load-testing/visualize-results.html) |
| **Sample Input Data** | Included | Domain Datasets: [`hotelData.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/lib/db/hotelData.ts), [`carData.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/lib/db/carData.ts), [`wellnessData.ts`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/lib/db/wellnessData.ts) |
| **API Integration Documentation** | Included | Documented below in [API Endpoints Reference](#api-endpoints-reference) |
| **Configuration Files** | Included | `package.json`, `tsconfig.json`, `next.config.js`, `vite.config.js`, [`.env.example`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/.env.example), [`backend/.example.env`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/backend/.example.env) |
| **No Sensitive Data / Credentials** | Verified | `.env` files are `.gitignore`d; only sanitized `.example.env` templates are committed |

> **Note on Model Training**: This project utilizes pre-trained cloud Large Language Models (Google Gemini 1.5/2.0 Flash) and Embedding Models (`text-embedding-004` / Gemini Embedding 001) via API integrations. Consequently, custom neural network training scripts are Not Applicable (N/A); instead, **Vector Space Data Ingestion** (`ingest.ts`) and **k6 Latency Benchmarking** (`loadtest.js`) fulfill the dataset preparation and empirical evaluation requirements.

---

## Monorepo Architecture Overview

```
                                  ┌─────────────────────────────────────────┐
                                  │           React 19 Frontends            │
                                  │ (Hotel :5173 | Car :5174 | Well :5175) │
                                  └────────────────────┬────────────────────┘
                                                       │
                                            HTTP REST / Voice Search
                                                       │
                                  ┌────────────────────▼────────────────────┐
                                  │      Next.js 14 Unified Backend         │
                                  │          http://localhost:5001          │
                                  └──────────┬───────────────────┬──────────┘
                                             │                   │
                                   RAG Pipeline Route   Keyword Route
                                             │                   │
                                  ┌──────────▼──────────┐ ┌──────▼──────────┐
                                  │   @rag/core NPM     │ │ Supabase Client │
                                  │   Engine Package    │ └──────┬──────────┘
                                  └─────┬───────────┬───┘        │
                                        │           │            │
                                   ┌────▼───┐   ┌───▼────┐ ┌─────▼────┐
                                   │ Gemini │   │Pinecone│ │ Supabase │
                                   │  API   │   │VectorDB│ │PostgreSQL│
                                   └────────┘   └────────┘ └──────────┘
```

### Workspace Packages

1. **`packages/core` (`rg-rag-core`)**: A reusable, domain-agnostic RAG engine library published/packaged internally. Handles document vectorization, Pinecone index querying, and Gemini LLM prompt construction with source attribution.
2. **`backend` (`rag-backend`)**: A Next.js 14 API server serving multi-domain endpoints (`/api/search`, `/api/keyword`, `/api/ingest`). Coordinates database seeders, vector ingestion, and CORS handling for all frontends.
3. **`frontend`**: React 19 + Vite application providing comparative dual-search (RAG vs Keyword) and Web Speech API Voice Search for the **Hotel Recommendation** domain.
4. **`frontend-car`**: React + Vite frontend tailored for the **Car Rental Recommendation** domain.
5. **`frontend-wellness`**: React + Vite frontend tailored for the **Wellness & Mindful Retreats** domain.
6. **`backend/load-testing`**: Benchmarking suite built with Grafana k6 and Chart.js HTML visualizer to evaluate performance under load.

---

## Technical Specifications & Requirements

### Software & Hardware Requirements

- **Operating System**: macOS, Linux, or Windows 10/11
- **Node.js Runtime**: v18.0.0 or higher (v20+ recommended)
- **NPM Package Manager**: v9.0.0 or higher (supports npm workspaces)
- **Web Browser**: Modern Chromium-based browser (Google Chrome, MS Edge) or Safari with Web Speech API support for Voice Search.
- **Hardware Minimums**: 4 GB RAM, 2 GHz Dual-Core CPU, Active Internet Connection (for Cloud API communication).
- **Load Testing Dependency** (Optional for running load tests): Grafana k6 (`brew install k6` or equivalent).

### Tech Stack & Frameworks

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Core RAG Engine** | TypeScript, LangChain | `@langchain/google-genai`, `@langchain/pinecone` |
| **Backend Server** | Next.js 14 (App Router) | Node.js REST API server on port `5001` |
| **Frontends** | React 19, Vite 8, CSS3 | Glassmorphic responsive UIs with Voice Input |
| **LLM Model** | Google Gemini 1.5 / 2.0 Flash | Natural language answer generation |
| **Embedding Model** | Gemini `text-embedding-004` | 3072-dimensional vector embeddings |
| **Vector DB** | Pinecone Vector Database | High-dimensional similarity search (Cosine metric) |
| **Relational DB** | Supabase (PostgreSQL) | Standard SQL database for exact keyword matching |
| **Benchmarking** | Grafana k6, Chart.js | Latency, throughput, and P95 response testing |

---

## Installation & Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-backend-with-vector-db
```

### 2. Configure Environment Variables

Navigate to the `backend` directory and copy the template:

```bash
cd backend
cp .example.env .env
```

Edit `backend/.env` with your API credentials:

```env
# Server Configuration
PORT=5001

# Google Gemini AI Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Pinecone Vector DB Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=hotel-catalog

# Supabase Relational Database Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Obtaining Free API Keys**:
> - **Google Gemini**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
> - **Pinecone**: Create an index with **3072 dimensions** and **Cosine** metric at [Pinecone Console](https://app.pinecone.io/).
> - **Supabase**: Create a free PostgreSQL database project at [Supabase Dashboard](https://supabase.com/).

### 3. Install Monorepo Dependencies

From the root directory, run:

```bash
cd ..
npm install
```

### 4. Build the Core RAG Package

Build the internal `@rag/core` TypeScript library before starting the services:

```bash
npm run build:core
```

---

## Database Seeding & Data Vector Ingestion

### Step 1: Execute SQL Schema (Supabase)

Execute the DDL script in [`database/schema.sql`](file:///Users/ranulagihara/Msc-%20research/rag-backend-with-vector-db/database/schema.sql) in your Supabase SQL Editor to create the `hotels`, `cars`, and `wellness` tables.

### Step 2: Seed Relational Data (Supabase)

Populate all three commercial domain tables with sample data:

```bash
npm run seed
```

Output:
```
Starting Supabase multi-domain database seed...
   Inserting 10 hotels into 'hotels' table...
[SUCCESS] Seeded 10 hotels into Supabase.
   Inserting 10 vehicles into 'cars' table...
[SUCCESS] Seeded 10 cars into Supabase.
   Inserting 10 wellness items into 'wellness' table...
[SUCCESS] Seeded 10 wellness items into Supabase.
Database seeding complete!
```

### Step 3: Ingest Vector Embeddings into Pinecone

Generate 3072-dimensional vector embeddings using Google Gemini and upsert them to Pinecone:

```bash
npm run ingest
```

Output:
```
Starting Multi-Domain Vector Ingestion CLI...
  Formatting total 30 documents (10 hotels, 10 cars, 10 wellness items)...
Vector Ingestion process finished successfully!
```

---

## Running the System

You can run the backend API server and frontends individually or in parallel using npm workspace commands.

### Option A: Running Individual Services

1. **Backend Server** (Port `5001`):
   ```bash
   npm run dev:backend
   ```
2. **Hotel Search Frontend** (Port `5173`):
   ```bash
   npm run dev:frontend
   ```
3. **Car Rental Search Frontend** (Port `5174`):
   ```bash
   npm run dev:frontend-car
   ```
4. **Wellness Retreats Frontend** (Port `5175`):
   ```bash
   npm run dev:frontend-wellness
   ```

### Access Ports Overview

| Component | URL | Description |
| :--- | :--- | :--- |
| **Backend API** | `http://localhost:5001` | Unified Next.js API Server |
| **Hotel Search UI** | `http://localhost:5173` | Hotel RAG & Keyword Search UI |
| **Car Rental UI** | `http://localhost:5174` | Vehicle Rental RAG Search UI |
| **Wellness UI** | `http://localhost:5175` | Mindful Retreats RAG Search UI |

---

## Voice Search Integration

All three frontend applications feature real-time **Speech-to-Text Voice Search** powered by the Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`).

- **Usage**: Click the microphone icon (`🎤`) next to the search bar, speak your natural language prompt (e.g., *"Find me a tranquil cabin near a lake for meditation"*), and click search.
- **Browser Compatibility**: Supported in Google Chrome, Microsoft Edge, and Apple Safari.

---

## API Endpoints Reference

### 1. `POST /api/search` — Domain-Aware RAG Semantic Search

The core RAG endpoint. Converts user query to vector embeddings via Gemini, performs similarity search in Pinecone filtered by domain type, and synthesizes a natural language recommendation using Gemini LLM.

**Request Header**: `Content-Type: application/json`

**Request Body**:
```json
{
  "query": "I want a quiet cabin near water for yoga and meditation",
  "domain": "hotel"
}
```
*(Valid `domain` values: `"hotel"`, `"car"`, `"wellness"`)*

**Response**:
```json
{
  "ai_answer": "Based on your request for tranquility and meditation, I recommend the Zen Lakeside Retreat...",
  "source_documents": [
    {
      "id": "HOTEL-001",
      "title": "Zen Lakeside Retreat",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
```

---

### 2. `POST /api/keyword` — Traditional Relational Keyword Search

Comparative endpoint. Uses exact case-insensitive substring matching against Supabase PostgreSQL database tables.

**Request Body**:
```json
{
  "query": "electric",
  "domain": "car"
}
```

**Response**:
```json
{
  "ai_answer": null,
  "source_documents": [
    {
      "id": "CAR-001",
      "title": "Tesla Model Y Long Range",
      "category": "Electric Cruiser",
      "price_per_day": 85
    }
  ]
}
```

---

### 3. `POST /api/ingest` — Programmatic Vector Ingestion Trigger

Triggers multi-domain vector ingestion via HTTP request.

**Request Body**: `{}`

---

## Performance Evaluation & Benchmarking

To fulfill the research thesis objective of empirically evaluating RAG vector search latency against traditional keyword filtering under concurrent load, an automated benchmark suite powered by **Grafana k6** is included.

### Test Setup & Configuration

- **Peak Concurrent Users (VUs)**: 10 Virtual Users
- **Load Ramp Profile**: `0 → 5 → 10 → 10 → 0 VUs` over ~60 seconds
- **Query Dataset**: 15 natural-language query variations across domains.

### Running the Load Test

1. Ensure the backend API server is running on port `5001`:
   ```bash
   npm run dev:backend
   ```
2. In a separate terminal, execute the load test script:
   ```bash
   cd backend
   npm run loadtest
   ```
   *Or execute via k6 CLI directly:*
   ```bash
   k6 run --out csv=load-testing/results.csv load-testing/loadtest.js
   ```

### Visualizing Benchmark Results

Open the interactive HTML benchmark visualizer in any web browser:

```bash
open backend/load-testing/visualize-results.html
```

Upload or load `results.csv` to view:
1. **Response Time Over Time**: Comparative latency curve (RAG vs Keyword).
2. **Latency Distribution**: Bar chart comparing Min, Median, P95, and Max latencies.
3. **Throughput & Concurrency**: Response time metrics under virtual user scaling.

---

## Project File Structure

```
rag-backend-with-vector-db/
├── README.md                          # Primary research & examiner README
├── .env.example                       # Root environment reference
├── package.json                       # Monorepo root workspace configuration
├── package-lock.json
├── database/
│   └── schema.sql                     # Supabase PostgreSQL DDL tables
├── packages/
│   └── core/                          # @rag/core internal package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/                       # Core RAG engine logic
├── backend/                           # Next.js 14 API Server (:5001)
│   ├── .example.env
│   ├── package.json
│   ├── app/
│   │   └── api/
│   │       ├── search/route.ts        # POST /api/search (RAG)
│   │       ├── keyword/route.ts       # POST /api/keyword (Keyword)
│   │       └── ingest/route.ts        # POST /api/ingest
│   ├── lib/
│   │   └── db/                        # Domain datasets & Supabase client
│   │       ├── hotelData.ts
│   │       ├── carData.ts
│   │       ├── wellnessData.ts
│   │       └── supabase.ts
│   ├── scripts/
│   │   ├── seed.ts                    # Supabase database seeder
│   │   └── ingest.ts                  # Pinecone vector ingestion script
│   └── load-testing/                  # Empirical performance evaluation
│       ├── loadtest.js                # k6 load testing script
│       ├── results.csv                # Raw metric output
│       ├── load-test-results.json     # Benchmark JSON summary
│       └── visualize-results.html     # Chart.js visualization report
├── frontend/                          # Hotel Search React App (:5173)
├── frontend-car/                      # Car Rental Search React App (:5174)
└── frontend-wellness/                 # Wellness Search React App (:5175)
```

---

## Default Credentials & Test Accounts

- **Authentication**: Unauthenticated for research demonstration and benchmarking purposes.
- **API Keys**: Require user configuration in `backend/.env` as described in [Configuration](#2-configure-environment-variables).

---

## Known Limitations

1. **Cloud API Quotas**: Google Gemini AI and Pinecone free tier plans enforce rate limits (e.g. Requests Per Minute / Tokens Per Minute). Under heavy concurrent load testing, status `429 Too Many Requests` may be returned by the external provider.
2. **Web Speech API Browser Dependencies**: Voice search relies on native browser Web Speech API implementations. Speech recognition availability varies on non-Chromium browsers.
3. **Dataset Scale**: The demonstration dataset comprises 30 curated records across 3 domains (10 per domain) to fit free-tier database constraints while demonstrating multi-domain RAG adaptability.

---

## License & Academic Disclaimer

This project was developed as part of an MSc Research Thesis submission. All source code, benchmarking tools, and documentation are provided for academic evaluation.
