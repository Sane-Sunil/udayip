-- Neon Database Schema for Projects
-- Run this in your Neon database SQL editor

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert sample data
INSERT INTO projects (id, name, url, description) VALUES 
('1767767384873', 'rehfh', 'ff://esf.fesf', 'ds')
ON CONFLICT (id) DO NOTHING;