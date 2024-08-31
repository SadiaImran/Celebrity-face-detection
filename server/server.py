from flask import Flask, request, jsonify
import util

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/classify_image', methods=['POST'])
def classify_image():
    try:
        image_data = request.form['image_data']
        result = util.classify_image(image_data)

        # if not result:
        #     return jsonify({"error": "No face detected or less than two eyes detected"}), 400

        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        print(f"Error during classification: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting python flask server for sports celebrity image classification")
    util.load_artifacts()
    app.run(port=5000)
