import os
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/sesong-tabell')
def sesonger():
    return render_template('sesong_tabell.html')

if __name__ == '__main__':
    app.run(debug=True)
