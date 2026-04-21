import { useState } from "react";
import "./index.css";

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Failed to connect to the server.");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        "We are having trouble connecting to our booking servers right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. Global Navbar */}
      <nav className="navbar">
        <div className="fluid-container nav-top">
          <div className="logo-text">Booking.com</div>
          <div className="nav-actions">
            <span className="currency">LKR</span>
            <span className="language">🇬🇧</span>
            <span className="list-property">List your property</span>
            <button className="nav-btn">Register</button>
            <button className="nav-btn">Sign in</button>
          </div>
        </div>
        <div className="fluid-container nav-bottom">
          <div className="nav-links">
            <span className="nav-link active">
              <span className="icon">🛏️</span> Stays
            </span>
            <span className="nav-link">
              <span className="icon">✈️</span> Flights
            </span>
            <span className="nav-link">
              <span className="icon">🚗</span> Car rental
            </span>
            <span className="nav-link">
              <span className="icon">🎡</span> Attractions
            </span>
            <span className="nav-link">
              <span className="icon">🚕</span> Airport taxis
            </span>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Sri Lanka Beach Background */}
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="fluid-container hero-content">
          <h1 className="hero-title">Hotels in Sri Lanka</h1>
          <p className="hero-subtitle">
            Enter your dates and choose from 20,149 hotels and other places to
            stay!
          </p>

          {/* 3. The Full-Width AI Search Bar */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-inputs-wrapper">
                {/* Main Semantic Input (Now takes 100% width) */}
                <div className="input-box primary-input" style={{ flex: 1 }}>
                  <span className="search-icon">✨</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your perfect vibe: e.g., A quiet mountain cabin with a fireplace..."
                    className="search-input"
                    disabled={isLoading}
                  />
                  {query && (
                    <span className="clear-btn" onClick={() => setQuery("")}>
                      ✕
                    </span>
                  )}
                </div>

                {/* REMOVED Dummy Date and Guest selectors to give AI input full width */}
              </div>

              <button
                type="submit"
                className="search-button"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="checkbox-wrapper">
              <input type="checkbox" id="work-travel" />
              <label htmlFor="work-travel">I'm travelling for work</label>
            </div>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* 4. Default Content (Grid expanded to 8 items) */}
      {!result && !isLoading && !error && (
        <main className="default-content fluid-container">
          <div className="breadcrumbs">
            Home {">"} Hotels {">"} Sri Lanka
          </div>
          <h2 className="section-title">
            Top destinations for Sri Lanka city trips
          </h2>
          <p className="section-subtitle">
            Find hotels in some of the most popular cities in Sri Lanka
          </p>

          <div className="destination-grid">
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1665849050332-8d5d7e59afb6?q=80&w=1740&auto=format&fit=crop"
                alt="Kandy"
              />
              <div className="dest-title">Kandy</div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80"
                alt="Mirissa"
              />
              <div className="dest-title">Mirissa</div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format"
                alt="Trincomalee"
              />
              <div className="dest-title">Trincomalee</div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format"
                alt="Unawatuna"
              />
              <div className="dest-title">Unawatuna</div>
            </div>

            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1623595289196-007a22dd8560?q=80&w=774&auto=format&fit=crop"
                alt="Colombo"
              />
              <div className="dest-title">Colombo</div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1526485856375-9110812fbf35?q=80&w=800&auto=format"
                alt="Arugambe"
              />
              <div className="dest-title">Arugambe</div>
            </div>
            <div className="dest-card">
              <img
                src="https://plus.unsplash.com/premium_photo-1730145749791-28fc538d7203?q=80&w=870&auto=format&fit=crop"
                alt="Sigiriya"
              />
              <div className="dest-title">Sigiriya</div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1725680968792-c8dce6d6cf18?q=80&w=872&auto=format&fit=crop"
                alt="Jaffna"
              />
              <div className="dest-title">Jaffna</div>
            </div>
          </div>
        </main>
      )}

      {/* 5. Results Area with Fixed Card Layout */}
      {result && (
        <main className="results-container fluid-container">
          <div className="breadcrumbs">
            Home {">"} Hotels {">"} Sri Lanka {">"} Search Results
          </div>

          <div className="ai-banner">
            <div className="ai-icon-wrapper">✨</div>
            <div className="ai-content">
              <h3 className="ai-title">AI Travel Expert Match</h3>
              <p className="ai-text">{result.ai_answer}</p>
            </div>
          </div>

          {result.source_documents && result.source_documents.length > 0 && (
            <div className="listings-wrapper">
              <h2 className="listings-header">Top matches for your request</h2>

              {result.source_documents.map((doc, index) => (
                <div key={index} className="hotel-card">
                  {/* Real image instead of empty box */}
                  <img
                    src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80`}
                    alt="Hotel"
                    className="card-image-img"
                  />

                  <div className="card-body">
                    <div className="card-main">
                      <div className="title-row">
                        <h3 className="hotel-title">{doc.title}</h3>
                        <span className="stars">★★★★☆</span>
                      </div>
                      <p className="hotel-location">
                        <span className="link-text">Excellent location</span> —
                        Show on map
                      </p>

                      <p className="hotel-description">
                        <strong>AI Note:</strong> Selected based on your
                        semantic search criteria. This property perfectly
                        matches the experience you described.
                      </p>

                      <div className="tags-container">
                        <span className="tag-green">Free cancellation</span>
                        <span className="tag-green">No prepayment needed</span>
                        <span className="hotel-id">Ref: {doc.id}</span>
                      </div>
                    </div>

                    <div className="card-action">
                      <div className="rating-box">
                        <div className="rating-text">
                          <span className="rating-word">Excellent</span>
                          <span className="review-count">1,245 reviews</span>
                        </div>
                        <div className="rating-score">9.2</div>
                      </div>

                      <div className="price-wrapper">
                        <div className="price-info">
                          <span className="price-night">1 night, 2 adults</span>
                          <span className="price-value">$120</span>
                          <span className="price-tax">
                            + $15 taxes and charges
                          </span>
                        </div>
                        <button className="book-button">
                          See availability {">"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
