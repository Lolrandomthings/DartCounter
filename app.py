from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

def get_db_connection():
    db_path = 'C:/Users/Administrator/Documents/Uke43_ReidunDarttavle_praksis/DartCounter/dart.db' 
    print(f"Using database at: {db_path}")  # This will print the path in the console for verification
    conn = sqlite3.connect(db_path, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


# Route to add a new entry
@app.route('/api/dartboard', methods=['POST'])
def add_dartboard_entry():
    new_entry = request.get_json()
    player_name = new_entry['navn']
    kast1 = new_entry['kast1']
    kast2 = new_entry['kast2']
    
    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO darttabell (navn, kast1, kast2) VALUES (?, ?, ?)',
            (player_name, kast1, kast2)
        )
        conn.commit()
    finally:
        conn.close()  # Ensure connection is closed even if there's an error

    return jsonify({'status': 'Entry added successfully'}), 201


# Route to serve the main HTML page
@app.route('/')
def index_page():
    return render_template('Index.html')

# Route to serve the main HTML page
@app.route('/poentavle')
def poeng_page():
    return render_template('Poengtavle.html')  

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
