import { useState } from "react";
import VoiceSearch from "./VoiceSearch";
import "./index.css";

const API_BASE_URL = "http://localhost:5001";

function App() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("ai"); // 'ai' or 'keyword'
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleQueries = [
    "Holistic stress relief & deep sleep aromatherapy",
    "Secluded forest retreat for burnout recovery",
    "Vibrational acoustic sound bath & chakra healing",
    "Organic herbal detox for vitality & energy",
    "Vagus nerve meditation & breathwork masterclass",
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
          domain: "wellness",
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to backend server.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        "Unable to connect to the wellness search service. Please check that the Next.js backend is running on port 5001."
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
      <nav className="navbar">
        <div className="fluid-container nav-top">
          <a href="#" className="brand-logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">AuraWellness</span>
            <span className="logo-tag">HOLISTIC RAG</span>
          </a>
          <div className="nav-actions">
            <span className="nav-link-btn">Retreats</span>
            <span className="nav-link-btn">Aromatherapy</span>
            <span className="nav-link-btn">Spa Packages</span>
            <button className="btn-primary">Book Consultation</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="fluid-container hero-content">
          <div className="hero-badge">
            Multi-Domain RAG Demo — Mindful Living Search
          </div>
          <h1 className="hero-title">Nourish Your Body, Calm Your Mind</h1>
          <p className="hero-subtitle">
            Describe your physical state, emotional intention, or stress relief goals. Our AI Holistic Matcher finds tailored retreats, therapeutic spa packages, and botanical remedies.
          </p>

          <div className="search-card">
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
                AI Mindful Matcher (RAG)
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
                      ? "Describe your wellness goal (e.g., 'need deep sleep and release from work burnout')..."
                      : "Search by exact keywords (e.g., 'retreat', 'aromatherapy', 'detox')..."
                  }
                  className="search-input"
                  disabled={isLoading}
                />
                <div className="input-actions-right">
                  {query && (
                    <span
                      className="clear-icon"
                      onClick={() => {
                        setQuery("");
                        setResult(null);
                      }}
                    >
                      ✕
                    </span>
                  )}
                  <VoiceSearch
                    onTranscript={(text) => setQuery(text)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="search-submit-btn"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? "Searching Catalog..." : "Search Offerings"}
              </button>
            </form>

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

      <main className="fluid-container" style={{ flex: 1, padding: "2.5rem 1.5rem" }}>
        {error && (
          <div className="error-banner">
            <span>[Error]</span>
            <div>{error}</div>
          </div>
        )}

        {result && searchMode === "ai" && result.ai_answer && (
          <div className="ai-summary-card">
            <div className="ai-card-header">
              <span className="ai-sparkle-badge">GEMINI HOLISTIC CONCIERGE RECOMMENDATION</span>
              <h2 className="ai-card-title">Mindful Wellness Guidance</h2>
            </div>
            <p className="ai-card-text">{result.ai_answer}</p>
          </div>
        )}

        {result && searchMode === "keyword" && result.source_documents.length === 0 && (
          <div className="legacy-warning-card">
            <h3>No Exact Keyword Matches Found</h3>
            <p style={{ marginTop: "4px" }}>
              Legacy keyword search requires an exact text substring match in product titles or descriptions. Switch to <strong>AI Mindful Matcher</strong> to search by natural health goals and emotional intent!
            </p>
          </div>
        )}

        {result && result.source_documents && result.source_documents.length > 0 && (
          <div>
            <div className="section-header-row">
              <h2 className="results-heading">
                {searchMode === "ai"
                  ? "Top Recommended Holistic Offerings"
                  : `Found ${result.source_documents.length} Exact Matches`}
              </h2>
            </div>

            <div className="wellness-grid">
              {result.source_documents.map((item, index) => (
                <div key={item.id || index} className="wellness-card">
                  <div className="wellness-img-wrapper">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={item.title}
                      className="wellness-img"
                    />
                    {item.category && (
                      <span className="wellness-category-tag">{item.category}</span>
                    )}
                    {item.rating > 0 && (
                      <span className="wellness-rating-badge">
                        Rating: {item.rating} / 5
                      </span>
                    )}
                  </div>

                  <div className="wellness-card-body">
                    <h3 className="wellness-title">{item.title}</h3>

                    {item.mindful_benefit && (
                      <div className="mindful-benefit-pill">
                        Benefit: {item.mindful_benefit}
                      </div>
                    )}

                    <div
                      className={`match-reason-box ${
                        searchMode === "ai" ? "match-ai" : "match-keyword"
                      }`}
                    >
                      {searchMode === "ai"
                        ? "Semantic Vector Match: Matched based on emotional intent & wellness context."
                        : "Keyword Match: Contains exact query term."}
                    </div>

                    <p className="wellness-description">
                      "{item.description || item.pageContent}"
                    </p>

                    <div className="wellness-card-footer">
                      <div className="wellness-price">
                        ${item.price}{" "}
                        <span className="wellness-price-unit">
                          {item.category === "Retreat" ? "/ package" : item.category === "Spa Package" ? "/ session" : ""}
                        </span>
                      </div>
                      <button className="book-wellness-btn">
                        Select Offering -&gt;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !isLoading && !error && (
          <section>
            <div className="section-header-row">
              <h2 className="results-heading">Explore Wellness Categories</h2>
            </div>
            <div className="showcase-grid">
              <div
                className="showcase-card"
                onClick={() => handleChipClick("sacred forest retreat burnout recovery")}
              >
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                  alt="Mindful Retreats"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Sanctuary Retreats</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("deep sleep aromatherapy french lavender")}
              >
                <img
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
                  alt="Aromatherapy"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Sleep & Aromatherapy</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("crystal singing bowl sound bath spa package")}
              >
                <img
                  src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80"
                  alt="Sound Bath Spa"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Sound Bath & Spa</div>
                </div>
              </div>
              <div
                className="showcase-card"
                onClick={() => handleChipClick("ashwagandha adaptogenic cortisol balance supplement")}
              >
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
                  alt="Botanical Supplements"
                />
                <div className="showcase-overlay">
                  <div className="showcase-title">Organic Supplements</div>
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
