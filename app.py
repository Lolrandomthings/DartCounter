import os
from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

def get_db_connection():
    db_path = 'C:/Users/Administrator/Documents/Uke43_ReidunDarttavle_praksis/DartCounter/dart.db'
    conn = sqlite3.connect(db_path, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

# Last inn gjeldende og forrige tabellnavn fra metadata
def load_table_names():
    conn = get_db_connection()
    row = conn.execute('SELECT current_table, last_table FROM metadata WHERE id = 1').fetchone()
    conn.close()
    if row:
        print(f"Loaded table names from metadata: current_table={row['current_table']}, last_table={row['last_table']}")
    else:
        print("Metadata not found; initializing with default.")
    return row['current_table'] if row else "darttabell", row['last_table'] if row else None

currentTableName, lastTableName = load_table_names() # Initialiser currentTableName og lastTableName fra metadata

from datetime import datetime

def create_new_round_on_startup():
    global currentTableName, lastTableName
    conn = get_db_connection()

    # Hent forrige tabell fra metadata
    row = conn.execute('SELECT current_table, last_table FROM metadata WHERE id = 1').fetchone()
    lastTableName = row['last_table'] if row else "darttabell"
    currentTableName = f"darttabell_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

    # Sjekk om den nye tabellen må opprettes
    if not row or not conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{currentTableName}'").fetchone():
        print(f"Startup: Oppretter ny tabell {currentTableName}, forrige tabell var {lastTableName}")
        
        try:
            # Opprett den nye tabellen med eksplisitt skjema
            conn.execute(f'''
                CREATE TABLE {currentTableName} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    navn TEXT NOT NULL,
                    kast1 INTEGER NOT NULL,
                    kast2 INTEGER NOT NULL,
                    total_sum INTEGER AS (kast1 + kast2 + 2) STORED,
                    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(navn, kast1, kast2, date_played)
                )
            ''')
            # Oppdater metadata
            conn.execute('UPDATE metadata SET current_table = ?, last_table = ? WHERE id = 1',
                         (currentTableName, lastTableName))
            conn.commit()
            print(f"Tabell {currentTableName} opprettet vellykket ved oppstart.")
        except sqlite3.Error as e:
            print(f"Feil ved oppretting av ny tabell ved oppstart: {str(e)}")
        finally:
            conn.close()
    else:
        print(f"Tabell {currentTableName} eksisterer allerede eller metadata ikke funnet. Hopper over oppretting.")
        conn.close()

@app.route('/api/create_new_round', methods=['POST'])
def create_new_round():
    global currentTableName, lastTableName
    
    # Oppdater lastTableName til gjeldende før du oppretter ny tabell
    lastTableName = currentTableName
    currentTableName = f"darttabell_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    print(f"Oppretter ny tabell: {currentTableName}, forrige tabell var: {lastTableName}")

    conn = get_db_connection()
    try:
        # Definer skjemaet eksplisitt for nye tabeller
        conn.execute(f'''
            CREATE TABLE {currentTableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                navn TEXT NOT NULL,
                kast1 INTEGER NOT NULL,
                kast2 INTEGER NOT NULL,
                total_sum INTEGER AS (kast1 + kast2 + 2) STORED, -- Legger automatisk til +2 bonus
                date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(navn, kast1, kast2, date_played)
            )
        ''')
        
        # Oppdater metadata med nye gjeldende og forrige tabellnavn
        conn.execute('UPDATE metadata SET current_table = ?, last_table = ? WHERE id = 1',
                     (currentTableName, lastTableName))
        conn.commit()
        print(f"Tabell {currentTableName} opprettet vellykket.")
    except sqlite3.Error as e:
        print(f"Feil ved oppretting av ny tabell: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"table_name": currentTableName}), 201

# Rute for å legge til oppføringer i den aktive tabellen
@app.route('/api/dartboard', methods=['POST'])
def add_dartboard_entry():
    global currentTableName
    new_entry = request.get_json()
    player_name = new_entry['navn']
    kast1 = new_entry['kast1']
    kast2 = new_entry['kast2']
    
    conn = get_db_connection()
    insert_sql = f'''
    INSERT INTO {currentTableName} (navn, kast1, kast2) VALUES (?, ?, ?)
    '''
    conn.execute(insert_sql, (player_name, kast1, kast2))
    conn.commit()
    conn.close()

    return jsonify({'status': 'Oppføring lagt til vellykket'}), 201

# Rute for å vise siste fullførte tabell på Poengtavle
@app.route('/poengtavle')
def poeng_page():
    global lastTableName
    conn = get_db_connection()
    
    # Bruk lastTableName for å hente oppføringer fra siste fullførte tabell
    if lastTableName:
        entries = conn.execute(f'SELECT * FROM {lastTableName} ORDER BY date_played DESC').fetchall()
        results = [dict(row) for row in entries]
    else:
        results = []  # Hvis det ikke finnes en siste tabell, vis tomt resultat

    conn.close()
    return render_template('Poengtavle.html', entries=results)

# Rute for å vise hoved-HTML-siden
@app.route('/')
def index_page():
    return render_template('Index.html')

# Rute for å vise hoved-HTML-siden
@app.route('/Regler')
def regler_page():
    return render_template('Regler.html') 

# Rute for å hente alle dartboard-oppføringer
@app.route('/api/dartboard', methods=['GET'])
def get_dartboard_entries():
    conn = get_db_connection()
    entries = conn.execute('SELECT * FROM darttabell ORDER BY date_played DESC').fetchall()
    conn.close()
    
    # Konverter rader til liste med ordbøker
    results = [dict(row) for row in entries]
    return jsonify(results)

if __name__ == '__main__':
    # Kjør create_new_round_on_startup kun i hovedprosessen
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        create_new_round_on_startup()
    app.run(debug=True)
