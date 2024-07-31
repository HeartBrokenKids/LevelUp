from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Ensure the 'uploads' directory exists
if not os.path.exists('uploads'):
    os.makedirs('uploads')

@app.route('/extract_skills', methods=['POST'])
def extract_skills():
    if 'resume' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['resume']

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        filepath = os.path.join('uploads', file.filename)
        file.save(filepath)
        # Here you would add your logic to extract skills from the PDF file.
        # For now, just return a success message.
        return jsonify({"message": "File uploaded successfully!"}), 200
    else:
        return jsonify({"message": "Invalid file format"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
