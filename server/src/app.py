import csv
import os
from flask import Flask, jsonify, abort
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow your frontend
# to make requests to this backend.
CORS(app)

# --- Configuration ---
# Define the directory and filename for the CSV data.
# Using a separate directory for data is a good practice.
DATA_DIR = '../../recourse/results'
CSV_FILENAME = 'algo_recourse_results.csv'
CSV_FILE_PATH = os.path.join(DATA_DIR, CSV_FILENAME)

# --- API Endpoint ---
@app.route('/data', methods=['GET'])
def get_csv_data():
    """
    API endpoint to read data from a CSV file and return it as JSON.
    
    This endpoint reads the CSV file specified by CSV_FILE_PATH.
    It returns a JSON object with two keys:
    - 'headers': A list of strings representing the column headers.
    - 'data': A list of objects, where each object represents a row.
    """
    # Check if the CSV file exists at the specified path.
    # If not, return a 404 Not Found error.
    if not os.path.isfile(CSV_FILE_PATH):
        abort(404, description=f"CSV file not found at: {CSV_FILE_PATH}")

    try:
        # Open and read the CSV file
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
            # Use csv.DictReader to read the data into a list of dictionaries.
            # This is convenient as it automatically uses the first row as headers.
            reader = csv.DictReader(csvfile)
            
            # The fieldnames attribute gives us the headers.
            headers = reader.fieldnames or []
            
            # The reader object can be converted to a list of row dictionaries.
            data = list(reader)
            
            # Return the headers and data in a JSON response.
            return jsonify({
                'headers': headers,
                'data': data
            })
    except Exception as e:
        # If any other error occurs during file processing,
        # return a 500 Internal Server Error with a description.
        print(f"An error occurred while processing the CSV file: {e}")
        abort(500, description="An internal error occurred while processing the CSV file.")

@app.route('/update', methods=['POST'])
def update_csv_data():
    """
    API endpoint to append a new row of data to the CSV file.
    
    It expects a POST request with a JSON body representing the new row.
    The keys in the JSON object should correspond to the headers in the CSV.
    """
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
        
        # Return a success response.
        return jsonify({'status': 'success', 'message': 'CSV file updated successfully.'}), 200

    except Exception as e:
        # Handle any other errors during the file writing process.
        print(f"An error occurred while updating the CSV file: {e}")
        abort(500, description="An internal error occurred while updating the CSV file.")


# --- Main Execution Block ---
if __name__ == '__main__':
    """
    main, where you run the app.
    """






    # Start the Flask development server.
    # 'debug=True' enables auto-reloading when you save changes.
    # 'port=5001' is used to avoid potential conflicts with other services.
    app.run(debug=True, port=8009)

