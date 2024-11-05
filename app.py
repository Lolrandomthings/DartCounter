import os
from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

def get_db_connection():
    db_path = 'C:/Users/laura/DartCounter/dart.db'
    conn = sqlite3.connect(db_path, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

#Load current and last table names from metadata
def load_table_names():
    conn = get_db_connection()
    row = conn.execute('SELECT current_table, last_table FROM metadata WHERE id = 1').fetchone()
    conn.close()
    if row:
        print(f"Loaded table names from metadata: current_table={row['current_table']}, last_table={row['last_table']}")
    else:
        print("Metadata not found; initializing with default.")
    return row['current_table'] if row else "darttabell", row['last_table'] if row else None


currentTableName, lastTableName = load_table_names() #Initialize currentTableName and lastTableName from metadata


from datetime import datetime

def create_new_round_on_startup():
    global currentTableName, lastTableName
    conn = get_db_connection()

    # Retrieve last table from metadata
    row = conn.execute('SELECT current_table, last_table FROM metadata WHERE id = 1').fetchone()
    lastTableName = row['last_table'] if row else "darttabell"
    currentTableName = row['current_table'] if row else f"darttabell_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

    # Check if currentTableName already exists to avoid re-creation
    table_exists = conn.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{currentTableName}'").fetchone()
    if table_exists:
        print(f"Table {currentTableName} already exists. Skipping creation.")
        conn.close()
        return

    print(f"Startup: Creating new table {currentTableName}, last table was {lastTableName}")
    
    try:
        # Create the new table and update metadata
        conn.execute(f'CREATE TABLE {currentTableName} AS SELECT * FROM darttabell WHERE 1=0')
        conn.execute('UPDATE metadata SET current_table = ?, last_table = ? WHERE id = 1',
                     (currentTableName, lastTableName))
        conn.commit()
        print(f"Table {currentTableName} created successfully on startup.")
    except sqlite3.Error as e:
        print(f"Error creating new table on startup: {str(e)}")
    finally:
        conn.close()


@app.route('/api/create_new_round', methods=['POST'])
def create_new_round():
    global currentTableName, lastTableName
    
    # Update lastTableName to the current one before creating a new table
    lastTableName = currentTableName
    currentTableName = f"darttabell_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    print(f"Creating new table: {currentTableName}, last table was: {lastTableName}")

    conn = get_db_connection()
    try:
        # Create the new table and update metadata with new current and last table names
        conn.execute(f'CREATE TABLE {currentTableName} AS SELECT * FROM darttabell WHERE 1=0')
        conn.execute('UPDATE metadata SET current_table = ?, last_table = ? WHERE id = 1',
                     (currentTableName, lastTableName))
        conn.commit()
        print(f"Table {currentTableName} created successfully.")
    except sqlite3.Error as e:
        print(f"Error creating new table: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"table_name": currentTableName}), 201




# Route to add entries to the currently active table
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

    return jsonify({'status': 'Entry added successfully'}), 201



# Route to display the last completed table on Poengtavle
@app.route('/poengtavle')
def poeng_page():
    global lastTableName
    conn = get_db_connection()
    
    # Use lastTableName to fetch entries from the last completed table
    if lastTableName:
        entries = conn.execute(f'SELECT * FROM {lastTableName} ORDER BY date_played DESC').fetchall()
        results = [dict(row) for row in entries]
    else:
        results = []  # If there's no last table, show an empty result

    conn.close()
    return render_template('Poengtavle.html', entries=results)



# Route to serve the main HTML page
@app.route('/')
def index_page():
    return render_template('Index.html')


# Route to serve the main HTML page
@app.route('/Regler')
def regler_page():
    return render_template('Regler.html') 
 


# Route to get all dartboard entries
@app.route('/api/dartboard', methods=['GET'])
def get_dartboard_entries():
    conn = get_db_connection()
    entries = conn.execute('SELECT * FROM darttabell ORDER BY date_played DESC').fetchall()
    conn.close()
    
    # Convert rows to list of dicts
    results = [dict(row) for row in entries]
    return jsonify(results)


if __name__ == '__main__':
    # Only run create_new_round_on_startup in the main process
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        create_new_round_on_startup()
    app.run(debug=True)
