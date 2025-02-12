from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('Index.html')

@app.route('/sesongoppsummering')
def sesongoppsummering():
    return render_template('Sesongoppsumering_tabell.html')

if __name__ == '__main__':
    app.run(debug=True)
    
    
    
