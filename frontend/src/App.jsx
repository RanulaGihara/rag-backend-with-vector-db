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
    <div style={styles.appWrapper}>
      {/* 1. Global Navbar - Edge to Edge */}
      <nav style={styles.navbar}>
        <div style={styles.fluidContainer}>
          <div style={styles.logoGroup}>
            <span style={styles.logoText}>StayFinder</span>
          </div>
          <div style={styles.navLinks}>
            <span className="nav-link" style={styles.navLink}>
              Stays
            </span>
            <span className="nav-link" style={styles.navLink}>
              Flights
            </span>
            <span className="nav-link" style={styles.navLink}>
              Car rentals
            </span>
            <span
              className="nav-link"
              style={{ ...styles.navLink, ...styles.navLinkActive }}
            >
              Sign In / Register
            </span>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section - Deep Blue, Edge to Edge */}
      <header style={styles.hero}>
        <div style={{ ...styles.fluidContainer, ...styles.heroContent }}>
          <h1 style={styles.heroTitle}>Find your next stay</h1>
          <p style={styles.heroSubtitle}>
            Search low prices on hotels, homes and much more, just by describing
            your vibe.
          </p>
        </div>
      </header>

      {/* 3. The "Floating" Full-Width Search Bar */}
      <div style={styles.searchSection}>
        <form
          onSubmit={handleSearch}
          className="booking-search-bar"
          style={styles.searchForm}
        >
          <div style={styles.inputWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where do you want to go? e.g., A quiet mountain cabin with a fireplace..."
              style={styles.searchInput}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="action-btn"
            style={{
              ...styles.searchButton,
              ...(isLoading || !query.trim() ? styles.buttonDisabled : {}),
            }}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* 4. Results Area - Wide Layout */}
      {result && (
        <main style={styles.resultsContainer}>
          {/* AI Travel Agent Insights */}
          <div style={styles.aiBanner}>
            <div style={styles.aiIconWrapper}>✨</div>
            <div style={styles.aiContent}>
              <h3 style={styles.aiTitle}>AI Travel Expert Match</h3>
              <p style={styles.aiText}>{result.ai_answer}</p>
            </div>
          </div>

          {/* Hotel Listing Cards */}
          {result.source_documents && result.source_documents.length > 0 && (
            <div style={styles.listingsWrapper}>
              <h2 style={styles.listingsHeader}>
                Top matches for your request
              </h2>

              {result.source_documents.map((doc, index) => (
                <div
                  key={index}
                  className="hotel-card"
                  style={styles.hotelCard}
                >
                  {/* Animated Image Placeholder */}
                  <div className="image-placeholder" style={styles.cardImage}>
                    <span style={styles.imagePlaceholderText}>
                      Property Image
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardMain}>
                      <div style={styles.titleRow}>
                        <h3 style={styles.hotelTitle}>{doc.title}</h3>
                        <span style={styles.stars}>★★★★☆</span>
                      </div>
                      <p style={styles.hotelLocation}>
                        Excellent location — Show on map
                      </p>

                      <div style={styles.tagsContainer}>
                        <span style={styles.tag}>Free cancellation</span>
                        <span style={styles.tag}>No prepayment needed</span>
                        <span style={styles.hotelId}>Ref: {doc.id}</span>
                      </div>

                      <p style={styles.hotelDescription}>
                        Highly recommended by our AI based on your specific
                        requirements. This property perfectly captures the
                        experience you described.
                      </p>
                    </div>

                    <div style={styles.cardAction}>
                      <div style={styles.ratingBox}>
                        <div style={styles.ratingText}>
                          <span style={styles.ratingWord}>Excellent</span>
                          <span style={styles.reviewCount}>1,245 reviews</span>
                        </div>
                        <div style={styles.ratingScore}>9.2</div>
                      </div>

                      <div style={styles.priceInfo}>
                        <span style={styles.priceNight}>1 night, 2 adults</span>
                        <span style={styles.priceValue}>$120</span>
                        <span style={styles.priceTax}>
                          + $15 taxes and charges
                        </span>
                      </div>
                      <button className="action-btn" style={styles.bookButton}>
                        See availability {">"}
                      </button>
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

// ==========================================
// Styling: Full-Width Booking Aesthetic
// ==========================================
const primaryBlue = "#003b95";
const actionYellow = "#feba02";
const textDark = "#1a1a1a";

const styles = {
  appWrapper: { minHeight: "100vh", paddingBottom: "80px" },
  fluidContainer: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 4%",
    boxSizing: "border-box",
  },
  navbar: { backgroundColor: primaryBlue, color: "white", padding: "16px 0" },
  logoGroup: { display: "inline-block" },
  logoText: { fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" },
  navLinks: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    float: "right",
  },
  navLink: {
    padding: "10px 16px",
    borderRadius: "4px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    color: "white",
  },
  navLinkActive: {
    backgroundColor: "white",
    color: primaryBlue,
    fontWeight: "600",
  },
  hero: { backgroundColor: primaryBlue, padding: "60px 0 100px 0" },
  heroContent: { color: "white" },
  heroTitle: {
    margin: "0 0 16px 0",
    fontSize: "3.5rem",
    fontWeight: "800",
    letterSpacing: "-1px",
    lineHeight: "1.1",
  },
  heroSubtitle: { margin: 0, fontSize: "1.5rem", fontWeight: "400" },
  searchSection: {
    width: "100%",
    maxWidth: "1400px",
    margin: "-32px auto 0",
    padding: "0 4%",
    position: "relative",
    zIndex: 10,
    boxSizing: "border-box",
  },
  searchForm: {
    backgroundColor: actionYellow,
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
    gap: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  inputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "4px",
    padding: "20px",
  },
  searchIcon: { fontSize: "1.4rem", marginRight: "16px" },
  searchInput: {
    width: "100%",
    padding: "20px 10px",
    border: "none",
    fontSize: "1.1rem",
    color: textDark,
    outline: "none",
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: "#0071c2",
    color: "white",
    border: "none",
    padding: "0 48px",
    fontSize: "1.25rem",
    fontWeight: "600",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonDisabled: { backgroundColor: "#6b9fc4", cursor: "not-allowed" },
  errorBanner: {
    maxWidth: "1400px",
    margin: "24px auto 0",
    padding: "16px 4%",
    backgroundColor: "#ffebe8",
    color: "#cc0000",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    fontWeight: "500",
  },
  resultsContainer: {
    width: "100%",
    maxWidth: "1400px",
    margin: "40px auto 0",
    padding: "0 4%",
    boxSizing: "border-box",
  },
  aiBanner: {
    display: "flex",
    gap: "24px",
    backgroundColor: "#f0f6ff",
    border: `1px solid ${primaryBlue}`,
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "32px",
  },
  aiIconWrapper: { fontSize: "2rem" },
  aiTitle: {
    margin: "0 0 8px 0",
    color: primaryBlue,
    fontSize: "1.2rem",
    fontWeight: "700",
  },
  aiText: { margin: 0, color: "#333", lineHeight: "1.6", fontSize: "1rem" },
  listingsHeader: {
    fontSize: "1.75rem",
    color: textDark,
    marginBottom: "20px",
    fontWeight: "700",
  },
  listingsWrapper: { display: "flex", flexDirection: "column", gap: "16px" },
  hotelCard: {
    display: "flex",
    backgroundColor: "white",
    border: "1px solid #c6c6c6",
    borderRadius: "8px",
    overflow: "hidden",
    height: "240px",
  },
  cardImage: {
    width: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { color: "#757575", fontWeight: "500" },
  cardBody: {
    flex: 1,
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
  },
  cardMain: { flex: 1, display: "flex", flexDirection: "column" },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },
  hotelTitle: {
    margin: 0,
    color: "#0071c2",
    fontSize: "1.4rem",
    fontWeight: "700",
  },
  stars: { color: actionYellow, fontSize: "1rem" },
  hotelLocation: {
    margin: "0 0 12px 0",
    color: "#0071c2",
    fontSize: "0.85rem",
    textDecoration: "underline",
    cursor: "pointer",
  },
  tagsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#008009",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  hotelId: {
    fontSize: "0.75rem",
    color: "#666",
    backgroundColor: "#f1f1f1",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  hotelDescription: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.5",
    borderLeft: "2px solid #e7e7e7",
    paddingLeft: "12px",
    marginTop: "auto",
  },
  cardAction: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
    minWidth: "200px",
  },
  ratingBox: { display: "flex", alignItems: "center", gap: "12px" },
  ratingText: { textAlign: "right" },
  ratingWord: {
    display: "block",
    fontWeight: "700",
    color: textDark,
    fontSize: "1rem",
  },
  reviewCount: { color: "#666", fontSize: "0.8rem" },
  ratingScore: {
    backgroundColor: primaryBlue,
    color: "white",
    padding: "8px",
    borderRadius: "6px 6px 6px 0",
    fontWeight: "700",
    fontSize: "1.1rem",
  },
  priceInfo: { textAlign: "right", marginBottom: "12px" },
  priceNight: {
    display: "block",
    fontSize: "0.8rem",
    color: "#666",
    marginBottom: "4px",
  },
  priceValue: {
    display: "block",
    fontSize: "1.75rem",
    fontWeight: "700",
    color: textDark,
    lineHeight: "1",
  },
  priceTax: { fontSize: "0.8rem", color: "#666" },
  bookButton: {
    backgroundColor: "#0071c2",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "4px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    fontSize: "1rem",
  },
};

export default App;
