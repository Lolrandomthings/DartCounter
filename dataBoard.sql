CREATE TABLE darttabell (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn varchar(64) NOT NULL,
    kast1 INTEGER NOT NULL,
    kast2 INTEGER NOT NULL,
    total_sum INTEGER AS (kast1 + kast2) STORED,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
