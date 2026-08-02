-- Supabase PostgreSQL Database Schema

-- Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    transmission TEXT NOT NULL,
    seats INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    range_or_mpg TEXT NOT NULL,
    price_per_day NUMERIC(10, 2) NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wellness Table
CREATE TABLE IF NOT EXISTS wellness (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    rating NUMERIC(3, 2) NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    mindful_benefit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text Search Indexes
CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels USING gin (to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_cars_title ON cars USING gin (to_tsvector('english', title || ' ' || description || ' ' || category));
CREATE INDEX IF NOT EXISTS idx_wellness_title ON wellness USING gin (to_tsvector('english', title || ' ' || description || ' ' || mindful_benefit));
