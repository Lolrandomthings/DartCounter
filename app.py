from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

# Connect to SQLite database function
def get_db_connection():
    conn = sqlite3.connect('dart.db')  # Specify the path to your SQLite file
    conn.row_factory = sqlite3.Row
    return conn

# Route to serve the main HTML page
@app.route('/')
def index():
    return render_template('Index.html')  

# Route to get all dartboard entries
@app.route('/api/dartboard', methods=['GET'])
def get_dartboard_entries():
    conn = get_db_connection()
    entries = conn.execute('SELECT * FROM darttabell ORDER BY date_played DESC').fetchall()
    conn.close()
    
    # Convert rows to list of dicts
    results = [dict(row) for row in entries]
    return jsonify(results)

# Route to add a new entry
@app.route('/api/dartboard', methods=['POST'])
def add_dartboard_entry():
    new_entry = request.get_json()
    player_name = new_entry['navn']
    kast1 = new_entry['kast1']
    kast2 = new_entry['kast2']
    
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO darttabell (navn, kast1, kast2) VALUES (?, ?, ?)',
        (player_name, kast1, kast2)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'Entry added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)
