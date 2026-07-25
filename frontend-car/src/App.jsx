import { useState } from "react";
import "./index.css";

const API_BASE_URL = "http://localhost:5001";

function App() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("ai"); // 'ai' or 'keyword'
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleQueries = [
    "Eco-friendly silent highway cruiser",
    "Thrill seeking luxury convertible",
    "Rugged 4x4 mountain camping SUV",
    "Family minivan for road trip",
    "Zippy electric city commuter",
  ];

  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const searchQuery = forcedQuery || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const endpoint =
      searchMode === "ai"
        ? `${API_BASE_URL}/api/search`
        : `${API_BASE_URL}/api/keyword-search`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          domain: "car",
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to backend server.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        "Unable to connect to the vehicle search service. Please check that the Express backend is running on port 5001."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (sampleQuery) => {
    setQuery(sampleQuery);
    handleSearch(null, sampleQuery);
  };

  return (
    <div className="app-container">
      {/* 1. Navbar */}
      <nav className="navbar">
        <div className="fluid-container nav-top">
          <a href="#" className="brand-logo">
            <span className="logo-text">DriveVibe</span>
            <span className="logo-tag">CAR RENTALS</span>
          </a>
          <div className="nav-actions">
            <span className="nav-link-btn">Fleets</span>
            <span className="nav-link-btn">Locations</span>
            <span className="nav-link-btn">Manage Booking</span>
            <button className="btn-primary">Sign In</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="hero">
        <div className="fluid-container hero-content">
          <div className="hero-badge">
            Multi-Domain RAG Demo — Vehicle Search
          </div>
          <h1 className="hero-title">Find the Perfect Drive for Your Vibe</h1>
          <p className="hero-subtitle">
            Whether you desire a silent electric road cruiser, an aggressive track supercar, or a rugged 4x4 off-roader, match your emotional driving intent with our fleet.
          </p>

          {/* 3. Search Box & Dual Search Toggle */}
          <div className="search-card">
            {/* Mode Selector Tabs */}
            <div className="search-mode-tabs">
              <button
                type="button"
                className={`tab-btn ${searchMode === "ai" ? "active-ai" : "inactive"}`}
                onClick={() => {
                  setSearchMode("ai");
                  setResult(null);
                  setQuery("");
                }}
              >
                AI Semantic Matcher (RAG)
              </button>
              <button
                type="button"
                className={`tab-btn ${searchMode === "keyword" ? "active-keyword" : "inactive"}`}
                onClick={() => {
                  setSearchMode("keyword");
                  setResult(null);
                  setQuery("");
                }}
              >
                Legacy Keyword Search
              </button>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="input-group">
                <span className="input-icon">
                  {searchMode === "ai" ? "AI" : "KW"}
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchMode === "ai"
                      ? "Describe your driving vibe (e.g., 'open top convertible for a sunny ocean drive')..."
                      : "Search by exact keywords (e.g., 'electric', 'convertible', '4x4')..."
                  }
                  className="search-input"
                  disabled={isLoading}
                />
                {query && (
                  <span
                    className="clear-icon"
                    onClick={() => {
                      setQuery("");
                      setResult(null);
                    }}
                  >
                    x
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="search-submit-btn"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? "Analyzing Fleet..." : "Search Vehicles"}
              </button>
            </form>

            {/* Sample Queries */}
            <div className="sample-queries">
              <span className="sample-label">Try asking:</span>
              {sampleQueries.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="query-chip"
                  onClick={() => handleChipClick(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="fluid-container" style={{ flex: 1, padding: "2rem 1.5rem" }}>
        {error && (
          <div className="error-banner">
            <span>[Error]</span>
            <div>{error}</div>
          </div>
        )}

        {/* AI Synthesis Answer Box */}
        {result && searchMode === "ai" && result.ai_answer && (
          <div className="ai-summary-card">
            <div className="ai-card-header">
              <span className="ai-sparkle-badge">GEMINI RAG MATCHMAKER</span>
              <h2 className="ai-card-title">AI Mobility Recommendation</h2>
            </div>
            <p className="ai-card-text">{result.ai_answer}</p>
          </div>
        )}

        {/* Legacy Keyword Search Warning */}
        {result && searchMode === "keyword" && result.source_documents.length === 0 && (
          <div className="legacy-warning-card">
            <h3>No Exact Keyword Matches Found</h3>
            <p style={{ marginTop: "4px" }}>
              Legacy search requires an exact text substring match in vehicle titles or descriptions. Switch to <strong>AI Semantic Matcher</strong> to query by vibe and natural intent!
            </p>
          </div>
        )}

        {/* Vehicle Results Grid */}
        {result && result.source_documents && result.source_documents.length > 0 && (
          <div>
            <div className="section-header-row">
              <h2 className="results-heading">
                {searchMode === "ai"
                  ? "Top Recommended Fleet Vehicles"
                  : `Found ${result.source_documents.length} Exact Matches`}
              </h2>
            </div>

            <div className="car-grid">
              {result.source_documents.map((car, index) => (
                <div key={car.id || index} className="car-card">
                  <div className="car-img-wrapper">
                    <img
                      src={
                        car.image ||
                        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={car.title}
                      className="car-img"
                    />
                    {car.category && (
                      <span className="car-category-tag">{car.category}</span>
                    )}
                    {car.price_per_day > 0 && (
                      <span className="car-price-badge">
                        ${car.price_per_day} / day
                      </span>
                    )}
                  </div>

                  <div className="car-card-body">
                    <h3 className="car-title">{car.title}</h3>

                    <div className="car-specs-row">
                      {car.seats && (
                        <span className="spec-badge">{car.seats} Seats</span>
                      )}
                      {car.transmission && (
                        <span className="spec-badge">{car.transmission}</span>
                      )}
                      {car.fuel_type && (
                        <span className="spec-badge">{car.fuel_type}</span>
                      )}
                      {car.range_or_mpg && (
                        <span className="spec-badge">{car.range_or_mpg}</span>
                      )}
                    </div>

                    <div
                      className={`match-reason-box ${
                        searchMode === "ai" ? "match-ai" : "match-keyword"
                      }`}
                    >
                      {searchMode === "ai"
                        ? "Semantic Vector Match: Matched based on driving vibe and context."
                        : "Keyword Match: Contains exact query term."}
                    </div>

                    <p className="car-description">
                      "{car.description || car.pageContent}"
                    </p>

                    <div className="car-card-footer">
                      <button className="book-car-btn">
                        Reserve Vehicle -&gt;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Landing Grid when no search performed */}
        {!result && !isLoading && !error && (
          <section>
            <div className="section-header-row">
              <h2 className="results-heading">Explore Vehicle Categories</h2>
            </div>
            <div className="showcase-grid">
              <div
                className="showcase-card"
                onClick={() => handleChipClick("luxury sports car convertible")}
              >
                <img
                  src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80"
                  alt="Sports Luxury"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Luxury Sports</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("silent electric crossover")}
              >
                <img
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80"
                  alt="Electric"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Electric Cruisers</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("off-road 4x4 mountain camping")}
              >
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
                  alt="Off-Road"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Off-Road Adventure</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("spacious family road trip minivan")}
              >
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"
                  alt="Family"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Family Minivans</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
