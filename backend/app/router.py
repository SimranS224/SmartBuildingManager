from app import app
import sys
from flask import request


@app.route("/", methods=['POST'])
def home():
    pass
    
@app.route("/something", methods=['GET'])
def get_one():
    return "Hello, Salvador"
    
if __name__ == "__main__":
    app.run(debug=True)
