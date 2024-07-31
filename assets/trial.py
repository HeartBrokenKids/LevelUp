from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow CORS for all domains

UPLOAD_FOLDER = 'uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/extract_skills', methods=['POST'])
def extract_skills():
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        # Static response with skills
        return jsonify({
            "skills": [
                "Windows",
                "UNIX/Linux",
                "Visual Basic",
                "C",
                "C++",
                "Visual C++",
                "Java",
                "HTML",
                "XML",
                "ASP.NET",
                "SQL",
                "PL/SQL",
                "MS Access",
                "MS Office (Word, Excel, PowerPoint, Outlook)",
                "MS Project"
            ]
        }), 200

if __name__ == '__main__':
    app.run(port=5000)
