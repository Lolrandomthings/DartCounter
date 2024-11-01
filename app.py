from flask import Flask, request, jsonify, render_template
import sqlite3
import time

app = Flask(__name__)
currentTableName = "darttabell"  # Default table at startup

def get_db_connection():
    db_path = 'C:/Users/Administrator/Documents/Uke43_ReidunDarttavle_praksis/DartCounter/dart.db'
    conn = sqlite3.connect(db_path, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/create_new_round', methods=['POST'])
def create_new_round():
    global currentTableName
    # Generate a unique table name for the new round
    currentTableName = f"darttabell_round_{int(time.time())}"  # Unique round table name
    
    conn = get_db_connection()
    try:
        # Create the new round-specific table by duplicating the structure of `darttabell`
        conn.execute(f'''
            CREATE TABLE {currentTableName} AS SELECT * FROM darttabell WHERE 1=0
        ''')
        conn.commit()
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"table_name": currentTableName}), 201

# Route to add entries to the currently active table
@app.route('/api/dartboard', methods=['POST'])
def add_dartboard_entry():
    global currentTableName  # Ensure we're using the current table name
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

# Route to serve the main HTML page
@app.route('/')
def index_page():
    return render_template('Index.html')

@app.route('/poengtavle')
def poeng_page():
    global currentTableName
    conn = get_db_connection()
    entries = conn.execute(f'SELECT * FROM {currentTableName} ORDER BY date_played DESC').fetchall()
    conn.close()
    
    # Print entries to see if data is being retrieved
    print(entries)
    
    results = [dict(row) for row in entries]
    return render_template('Poengtavle.html', entries=results)


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
    app.run(debug=True)
