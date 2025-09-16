import csv
import os
from flask import Flask, jsonify, abort, request
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)

CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', '..', 'recourse', 'results')
CSV_FILENAME = 'algo_recourse_results.csv'
CSV_FILE_PATH = os.path.join(DATA_DIR, CSV_FILENAME)

file_counter = 0

@app.route('/headers', methods=['GET'])
def get_csv_headers():
    """
    API endpoint to efficiently read only the header row from the CSV file.
    """
    if not os.path.isfile(CSV_FILE_PATH):
        abort(404, description=f"CSV file not found at: {os.path.normpath(CSV_FILE_PATH)}")

    try:
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8', newline='') as csvfile:
            # Use the basic csv.reader, as we only need the first line.
            reader = csv.reader(csvfile)
            try:
                # Read just the first row and return it.
                headers = next(reader)
                return jsonify({'headers': headers})
            except StopIteration:
                # This handles the case where the file is completely empty.
                return jsonify({'headers': []})
    except Exception as e:
        print(f"An error occurred while reading CSV headers: {e}")
        abort(500, description="An internal error occurred while reading CSV headers.")

@app.route('/data', methods=['GET'])
def get_csv_data():
    """
    API endpoint to read all data from a CSV file and return it as JSON.
    """
    if not os.path.isfile(CSV_FILE_PATH):
        abort(404, description=f"CSV file not found at: {os.path.normpath(CSV_FILE_PATH)}")

    try:
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            headers = reader.fieldnames or []
            data = list(reader)
            return jsonify({
                'headers': headers,
                'data': data
            })
    except Exception as e:
        print(f"An error occurred while processing the CSV file: {e}")
        abort(500, description="An internal error occurred while processing the CSV file.")

@app.route('/update', methods=['POST'])
def update_csv_data():
    """
    API endpoint to append a new row of data to the CSV file.
    
    It expects a POST request with a JSON body representing the new row.
    The keys in the JSON object should correspond to the headers in the CSV.
    """
    # Just a counter
    global file_counter
    # Get the JSON data from the request body.
    new_row_data = request.get_json()

    # Basic validation to ensure data was sent.
    if not new_row_data or not isinstance(new_row_data, dict):
        abort(400, description="Invalid or missing JSON data in request body.")

    # Check if the CSV file exists before trying to append to it.
    if not os.path.isfile(CSV_FILE_PATH):
        # In a real-world scenario, you might want to create the file here
        # with headers if it doesn't exist. For now, we'll error out.
        abort(404, description=f"CSV file not found at: {CSV_FILE_PATH}")

    try:
        # First, read the existing headers to ensure we write correctly.
        headers = []
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8', newline='') as csvfile:
            reader = csv.reader(csvfile)
            try:
                headers = next(reader)
            except StopIteration:
                # This would mean the file is empty.
                abort(500, description="Cannot update: CSV file appears to be empty or has no headers.")
        
        # Open the CSV file in append mode ('a') to add the new row.
        # `newline=''` is crucial to prevent extra blank rows from being added.
        with open(CSV_FILE_PATH, mode='a', encoding='utf-8', newline='') as csvfile:
            # csv.DictWriter is perfect for this, as it maps the dictionary keys
            # from your JSON to the correct columns based on the headers.
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writerow(new_row_data)
            csvfile.flush()
        
        file_counter += 1
        # Return a success response.
        return jsonify({'status': 'success', 'message': 'CSV file updated successfully.'}), 200

    except Exception as e:
        # Handle any other errors during the file writing process.
        print(f"An error occurred while updating the CSV file: {e}")
        abort(500, description="An internal error occurred while updating the CSV file.")

@app.route('/health', methods=['GET'])
def get_server_health():
    global file_counter
    files_amount = file_counter
    file_counter = 0
    return jsonify({
        "status": "healthy",
        "message": "Server is running fine",
        "files": files_amount,
    }), 200

# --- Main Execution Block ---
if __name__ == '__main__':
    """
    main, where you run the app.
    """


    # Startup

    # See where is the csv
    print("CSV_FILE_PATH: ", CSV_FILE_PATH)

    # Start the Flask development server.
    # 'debug=True' enables auto-reloading when you save changes.
    # 'port=5001' is used to avoid potential conflicts with other services.
    app.run(debug=True, port=8009)

