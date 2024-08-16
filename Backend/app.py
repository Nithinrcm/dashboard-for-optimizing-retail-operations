from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from sparkathon_model import *
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not password or not username:
            return jsonify({"error": "Both username and password are required"}), 400
        
        if(username == "admin"):
            if(password == "admin@123"):
                return jsonify({"success": "true", "message": "login successful!"}), 200
            
    except Exception as e:
        print("Exception occurred:", str(e))
        return jsonify({"success": "false", "message": "login unsuccessful"}), 400
    finally:
        print("Login endpoint was called and served")

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data_file = request.files.get('data_file')
        config_file = request.files.get('config_file')

        if not data_file or not config_file:
            return jsonify({"error": "Both data and config files are required"}), 400

        # Save the files temporarily
        data_file_path = 'data.csv'
        config_file_path = 'config.json'
        data_file.save(data_file_path)
        config_file.save(config_file_path)
        rules = load_rules(config_file_path)
        df = pd.read_csv(data_file_path)
        errors = validate_data(df, rules)
        columns = df.columns.tolist()
        return jsonify({"success": "true", "error": errors, "columns": columns}), 200
    except Exception as e:
        print("Exception occurred:", str(e))
        return jsonify({"success": "false", "message": "File not uploaded. Please try again!"}), 400
    finally:
        print("Upload endpoint was called and served")

@app.route('/forecast-analysis', methods=['POST'])
def analysis():
    try:
        df = pd.read_csv('data.csv')
        data = request.json
        freq = "W"
        date_col = data.get('unique_col')
        value_col = data.get('forecast_col')
        df_weekly, highly_correlated_features, pair_plot_file = perform_eda(df, "W", date_col, value_col)
        sarimax_model, summary = fit_sarimax_model(df_weekly, value_col)
        forecast_plot_file = forecast_and_plot(df, df_weekly, sarimax_model, value_col)
        columns = df.columns.tolist()
        return jsonify({"success": "true", 'pair_plot_file': pair_plot_file, 'highly_correlated_features': highly_correlated_features, 'summary': summary,
                        'forecast_plot_file': forecast_plot_file, "columns": columns}), 200
    except Exception:
        return jsonify({"success": "false", "message": "File not uploaded. Please try again!"}), 400
    finally:
        print("Forecast analysis endpoint was called and served")

def get_access_token():
    tenant_id = '253c8147-cad4-44b8-8f59-834edf7b1ef9'
    client_id = '0857c5f2-1d6b-4e67-af0b-ac1f849de0bc'
    client_secret = 'y4u8Q~qxDroXNfKQonOM8O7SZrDs0tKk1erfvcos'

    token_url = f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'https://analysis.windows.net/powerbi/api/.default'
    }

    response = requests.post(token_url, headers=headers, data=data)
    
    print('Token Response:', response.json())  # Log the full response for debugging
    
    if response.status_code == 200:
        access_token = response.json().get('access_token')
        print('Access Token:', access_token)
        return access_token
    else:
        print('Error obtaining access token:', response.status_code, response.text)
        return None

def trigger_refresh_dataset(access_token, dataset_id):
    url = f'https://api.powerbi.com/v1.0/myorg/datasets/{dataset_id}/refreshes'

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers)

    print('Refresh Response:', response.json())  # Log the full response for debugging

    if response.status_code == 202:
        print('Dataset refresh triggered successfully!: ', response)
    else:
        print('Failed to refresh dataset:', response.status_code, response)

@app.route('/refresh-dataset', methods=['GET'])
def refresh_dataset_route():
    access_token = get_access_token()

    if access_token:
        dataset_id = 'bbf9eeb6d-6767-4e00-865a-f3bf45fc9e7e'  # Replace with your actual dataset ID
        trigger_refresh_dataset(access_token, dataset_id)
        return jsonify({"success": "true", "message": "Dataset refresh triggered successfully!"}), 200
    else:
        return jsonify({"success": "false", "message": "Failed to obtain access token!"}), 400

if __name__ == '__main__':
    app.run(debug=True)