import os
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload_excel', methods=['POST'])
def upload_excel():
    if 'file' not in request.files:
        return jsonify({"error": "Ingen fildel"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Ingen valgt fil"}), 400

    if not file.filename.endswith('.xlsx'):
        return jsonify({"error": "Ugyldig filformat. Last opp en Excel-fil."}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        df = pd.read_excel(file_path)

        if df.shape[1] < 1:
            return jsonify({"error": "Ugyldig filformat. Forventet minst 1 kolonne"}), 400

        # Extract headers and rows for JavaScript
        headers = df.columns.tolist()
        data = df.fillna(0).astype(str).to_dict(orient="records")

        return jsonify({"headers": headers, "data": data})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return render_template('Index.html')

if __name__ == '__main__':
    app.run(debug=True)
