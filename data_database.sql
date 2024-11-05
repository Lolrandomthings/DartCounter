-- Create the metadata table to store current and last table names
CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY,
    current_table TEXT,
    last_table TEXT
);

-- Initialize metadata with the most recent table or default to darttabell
INSERT OR IGNORE INTO metadata (id, current_table, last_table)
VALUES (1, 
        (SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'darttabell_round_%' ORDER BY name DESC LIMIT 1),
        NULL);

-- Create the darttabell table with a unique constraint to prevent exact duplicates
CREATE TABLE IF NOT EXISTS darttabell (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn VARCHAR(64) NOT NULL,
    kast1 INTEGER NOT NULL,
    kast2 INTEGER NOT NULL,
    total_sum INTEGER AS (kast1 + kast2) STORED,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(navn, kast1, kast2, date_played)  -- Unique constraint
);

/*CREATE TABLE nyrunde_tabbell AS SELECT * FROM darttabell WHERE 1=0;*/


-- Sample insert (ensure no duplicates with unique constraint)
INSERT OR IGNORE INTO darttabell (navn, kast1, kast2) VALUES ('Laura', 25, 30);

-- Query to find duplicates
SELECT navn, kast1, kast2, COUNT(*) AS count
FROM darttabell
GROUP BY navn, kast1, kast2
HAVING COUNT(*) > 1;

-- Delete duplicates while keeping the earliest record
DELETE FROM darttabell
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM darttabell
    GROUP BY navn, kast1, kast2, date_played
);

SELECT * FROM metadata WHERE id = 1;

DELETE FROM 'darttabell';
DELETE FROM 'sqlite_sequence' WHERE name = 'darttabell';







