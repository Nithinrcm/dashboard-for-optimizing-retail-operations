from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from flask_cors import CORS
import json
import os
import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

# Function to validate data based on the config file
def validate_data(df, config):
    rules = config.get("rules", [])

    for rule in rules:
        column = rule["column"]
        required = rule.get("required", False)
        expected_type = rule.get("type", None)
        format = rule.get("format", None)

        # Check if the required column exists
        if required and column not in df.columns:
            return False, f"Missing required column: '{column}'"
        
        # If the column exists, check the data type and format
        if column in df.columns:
            if expected_type:
                print(column, df[column])
                if not check_column_type(df[column], expected_type, format):
                    return False, f"Column '{column}' does not match expected type '{expected_type}' or format '{format}'"

    return True, "Validation successful"

# Function to check the data type of a column
def check_column_type(series, expected_type, format=None):
    
    if expected_type == "int":
        return pd.api.types.is_integer_dtype(series)
    elif expected_type == "float":
        return pd.api.types.is_float_dtype(series)
    elif expected_type == "string":
        return pd.api.types.is_string_dtype(series)
    elif expected_type == "date":
        if format:
            # Validate the date format
            try:
                print("Original Data:", series.head())  # Print the first few entries
                parsed_dates = pd.to_datetime(series, format=format, errors='raise')
                print("Parsed Dates:", parsed_dates.head())  # Print parsed dates to check format
                return True
            except ValueError as e:
                print(f"Date format validation error: {e}")
                return False
        else:
            return pd.api.types.is_datetime64_any_dtype(series)
    # Other type checks remain unchanged

    else:
        return False

@app.route('/upload', methods=['POST'])
def upload_file():
    data_file = request.files.get('data_file')
    config_file = request.files.get('config_file')

    if not data_file or not config_file:
        return jsonify({"error": "Both data and config files are required"}), 400

    # Save the files temporarily
    data_file_path = 'data_file.csv'
    config_file_path = 'config_file.json'

    data_file.save(data_file_path)
    config_file.save(config_file_path)

    # Read the data file into a DataFrame
    df = pd.read_csv(data_file_path)

    # Read and parse the config file
    with open(config_file_path, 'r') as file:
        config = json.load(file)

    # Extract the date format from the config
    date_format = config.get('rules', [{}])[0].get('format', None)

    if date_format:
        df['date'] = pd.to_datetime(df['date'], format=date_format).dt.strftime(date_format)

    # Validate the data using the config rules
    is_valid, message = validate_data(df, config)
    if not is_valid:
        # Clean up temporary files
        os.remove(data_file_path)
        os.remove(config_file_path)
        return jsonify({"error": message}), 400

    # Perform EDA
    eda_results = {
        "summary": df.describe().to_dict(),
        "null_values": df.isnull().sum().to_dict(),
        "features": list(df.columns),
    }

    # Clean up temporary files
    os.remove(config_file_path)

    # Note: The data_file is not removed here because it's needed for forecasting
    return jsonify(eda_results)


@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    selected_features = data.get('selectedFeatures')

    if not selected_features:
        return jsonify({"error": "No features selected for forecasting"}), 400

    # Load the validated data file
    try:
        df = pd.read_csv('data_file.csv')
    except FileNotFoundError:
        return jsonify({"error": "Data file not found. Please upload the data again."}), 400

    # Check if the date column needs to be converted to datetime
    for feature in selected_features:
        if 'date' in feature.lower():  # Adjust based on your date column name
            df[feature] = pd.to_datetime(df[feature], format='%m-%d-%Y', errors='coerce')
            df[feature] = df[feature].map(pd.Timestamp.toordinal)  # Convert dates to ordinals

    if not set(selected_features).issubset(df.columns):
        return jsonify({"error": "Selected features are not in the dataset"}), 400

    X = df[selected_features]
    y = df['sales']  # Adjust this based on your actual column name

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mse = mean_squared_error(y_test, y_pred)

    forecast_results = {
        "mse": mse,
        "predictions": y_pred.tolist(),
    }

    return jsonify(forecast_results)


if __name__ == '__main__':
    app.run(debug=True)

'''
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

# Function to validate data based on the config file
def validate_data(df, config):
    rules = config.get("rules", [])

    for rule in rules:
        column = rule["column"]
        required = rule.get("required", False)
        expected_type = rule.get("type", None)

        # Check if the required column exists
        if required and column not in df.columns:
            return False, f"Missing required column: '{column}'"
        
        # If the column exists, check the data type
        if column in df.columns:
            if expected_type:
                if not check_column_type(df[column], expected_type):
                    return False, f"Column '{column}' does not match expected type '{expected_type}'"

    return True, "Validation successful"

# Function to check the data type of a column
def check_column_type(series, expected_type):
    if expected_type == "int":
        return pd.api.types.is_integer_dtype(series)
    elif expected_type == "float":
        return pd.api.types.is_float_dtype(series)
    elif expected_type == "string":
        return pd.api.types.is_string_dtype(series)
    elif expected_type == "datetime":
        return pd.api.types.is_datetime64_any_dtype(series)
    else:
        return False

# Route to handle file upload and EDA
@app.route('/upload', methods=['POST'])
def upload_file():
    data_file = request.files.get('data_file')
    config_file = request.files.get('config_file')

    if not data_file or not config_file:
        return jsonify({"error": "Both data and config files are required"}), 400

    # Save the files temporarily
    data_file_path = 'data_file.csv'
    config_file_path = 'config_file.json'

    data_file.save(data_file_path)
    config_file.save(config_file_path)

    # Read the data file into a DataFrame
    df = pd.read_csv(data_file_path)

    # Read and parse the config file
    with open(config_file_path, 'r') as file:
        config = json.load(file)

    # Validate the data using the config rules
    is_valid, message = validate_data(df, config)
    if not is_valid:
        return jsonify({"error": message}), 400

    # Perform EDA
    eda_results = {
        "summary": df.describe().to_dict(),
        "null_values": df.isnull().sum().to_dict(),
        "features": list(df.columns),
    }

    # Clean up temporary files
    os.remove(data_file_path)
    os.remove(config_file_path)

    return jsonify(eda_results)

# Route to handle forecasting
@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    selected_features = data.get('selectedFeatures')

    if not selected_features:
        return jsonify({"error": "No features selected for forecasting"}), 400

    # Load the validated data file
    df = pd.read_csv('data_file.csv')  # Adjust if state management changes

    if not set(selected_features).issubset(df.columns):
        return jsonify({"error": "Selected features are not in the dataset"}), 400

    X = df[selected_features]
    y = df['Sales']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mse = mean_squared_error(y_test, y_pred)

    forecast_results = {
        "mse": mse,
        "predictions": y_pred.tolist(),
    }

    return jsonify(forecast_results)

if __name__ == '__main__':
    app.run(debug=True)
'''