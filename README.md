# Multi-Domain RAG Monorepo Architecture vs Traditional Keyword Search

> **MSc Research Thesis Project** — An empirical research evaluation of a domain-agnostic Retrieval-Augmented Generation (RAG) monorepo architecture leveraging Vector Databases (Pinecone) and LLMs (Google Gemini) compared against traditional relational keyword-based search across three distinct commercial domains (Hotel Booking, Car Rental, and Wellness Retreats).
>
> **Monorepo GitHub Repository**: [`RanulaGihara/rag-backend-with-vector-db`](https://github.com/RanulaGihara/rag-backend-with-vector-db)  
> **Published Core NPM Package**: [`rg-rag-core`](https://www.npmjs.com/package/rg-rag-core) | Standalone Core Repo: [`RanulaGihara/rg-rag-core`](https://github.com/RanulaGihara/rg-rag-core)

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
                                  │   rg-rag-core NPM   │ │ Supabase Client │
                                  │   Engine Package    │ └──────┬──────────┘
                                  └─────┬───────────┬───┘        │
                                        │           │            │
                                   ┌────▼───┐   ┌───▼────┐ ┌─────▼────┐
                                   │ Gemini │   │Pinecone│ │ Supabase │
                                   │  API   │   │VectorDB│ │PostgreSQL│
                                   └────────┘   └────────┘ └──────────┘
```

### Workspace Packages

1. **`packages/core` ([`rg-rag-core`](https://www.npmjs.com/package/rg-rag-core))**: A standalone, domain-agnostic RAG engine library published globally to NPM as [`rg-rag-core`](https://www.npmjs.com/package/rg-rag-core) (v1.0.2) with source hosted at [`RanulaGihara/rg-rag-core`](https://github.com/RanulaGihara/rg-rag-core). Encapsulates document vectorization, Pinecone index querying, and Gemini LLM response synthesis.
2. **`backend` (`rag-backend`)**: A Next.js 14 API server serving multi-domain endpoints (`/api/search`, `/api/keyword`, `/api/ingest`). Coordinates database seeders, vector ingestion, and CORS handling for all frontends. Imports `rg-rag-core` as a core dependency.
3. **`frontend`**: React 19 + Vite application providing comparative dual-search (RAG vs Keyword) and Web Speech API Voice Search for the **Hotel Recommendation** domain.
4. **`frontend-car`**: React + Vite frontend tailored for the **Car Rental Recommendation** domain.
5. **`frontend-wellness`**: React + Vite frontend tailored for the **Wellness & Mindful Retreats** domain.
6. **`backend/load-testing`**: Benchmarking suite built with Grafana k6 and Chart.js HTML visualizer to evaluate performance under load.

---

## Published Core NPM Library (`rg-rag-core`)

The core RAG engine has been extracted, modularized, and **published globally to NPM**. It has zero domain dependencies (no hardcoded hotel, car, or wellness schemas) and can be installed in any JavaScript/TypeScript project.

- **NPM Package Registry**: [`https://www.npmjs.com/package/rg-rag-core`](https://www.npmjs.com/package/rg-rag-core)
- **Standalone GitHub Repository**: [`https://github.com/RanulaGihara/rg-rag-core`](https://github.com/RanulaGihara/rg-rag-core)

### How to Install & Use in External Projects

To use the core RAG engine in any external Node.js, Express, Next.js, or React project:

#### 1. Install via NPM Command
```bash
npm install rg-rag-core dotenv
```


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
| **Core RAG Engine** | TypeScript, LangChain | NPM: [`rg-rag-core`](https://www.npmjs.com/package/rg-rag-core) (`@langchain/google-genai`, `@langchain/pinecone`) |
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
git clone https://github.com/RanulaGihara/rag-backend-with-vector-db.git
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

### 4. Setup Options for Core RAG Engine

#### Option A: Local Monorepo Workspace Setup (Development)
The monorepo uses NPM workspaces to link `packages/core` (`rg-rag-core`) locally to the Next.js backend. To build the core library locally:

```bash
npm run build:core
```

#### Option B: Install via Published NPM Package (Production / Other Projects)
If setting up the backend or an external project to consume the published NPM package directly:

```bash
npm install rg-rag-core
```

---

## Database Seeding & Data Vector Ingestion

### Step 1: Execute SQL Schema (Supabase)

Execute the DDL script in [`database/schema.sql`](database/schema.sql) in your Supabase SQL Editor to create the `hotels`, `cars`, and `wellness` tables.

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

Generate 3072-dimensional vector embeddings using Google Gemini and upsert them to Pinecone via `rg-rag-core`:

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

- **Usage**: Click the microphone icon next to the search bar, speak your natural language prompt (e.g., *"Find me a tranquil cabin near a lake for meditation"*), and click search.
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

### 3. `POST /api/ingest` — Multi-Domain Vector Ingestion Trigger

Triggers bulk embedding generation and vector upserting into Pinecone using `rg-rag-core`.

**Response**:
```json
{
  "message": "Ingestion complete!",
  "stats": {
    "total": 30,
    "hotels": 10,
    "cars": 10,
    "wellness": 10
  }
}
```

---

## Load Testing & Empirical Benchmarking (Section 6.2.1)

Empirical load testing is performed using Grafana k6 to measure latency (P95), throughput, and failure rates under rate-limit compliant Virtual User (VU) concurrency comparing RAG vs. Keyword endpoints.

### 1. Using NPM Workspace Commands (Recommended)

From the root monorepo directory:

```bash
# Execute the k6 load test suite
npm run loadtest

# Open the MSc Research Benchmark Visualization Dashboard
npm run loadtest:dashboard
```

From the `backend` workspace directory:

```bash
cd backend

# Run k6 load test
npm run loadtest

# Open benchmark dashboard
npm run loadtest:dashboard
```

### 2. Using Direct k6 CLI Commands

If executing k6 directly via CLI:

```bash
cd backend/load-testing

# Execute load test and output CSV metrics
k6 run --out csv=results.csv loadtest.js

# Open interactive visualization dashboard in browser
open visualize-results.html
```

### 3. Quantitative Results Dashboard

Opening [`backend/load-testing/visualize-results.html`](backend/load-testing/visualize-results.html) renders an interactive Chart.js evaluation dashboard displaying:
- **RAG Avg Latency** (`845 ms`) vs **Keyword Avg Latency** (`52 ms`)
- **P95 Response Latency** (`940 ms`) proving sub-second generative AI reliability
- **Controlled 5 VUs Concurrency** maintaining rate-limit compliance (0% error rate)
- **Time-Series Latency Trends** and **Distribution Comparison Bar Charts**

---

## Academic Citation & License

- **Thesis Author**: Ranula Gihara
- **Monorepo Thesis Repository**: [`RanulaGihara/rag-backend-with-vector-db`](https://github.com/RanulaGihara/rag-backend-with-vector-db)
- **Published Core NPM Package**: [`rg-rag-core`](https://www.npmjs.com/package/rg-rag-core)
- **Standalone Core Engine Repository**: [`RanulaGihara/rg-rag-core`](https://github.com/RanulaGihara/rg-rag-core)
- **License**: MIT License
