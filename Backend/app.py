from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from flask_cors import CORS
from sparkathon_model import *

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

@app.route('/upload', methods=['POST'])
def upload():
    try :
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
        return jsonify({"success" : "true", "error" : errors, "columns" : columns}), 200
    except Exception as e:
        print("Exception occurred:", str(e))
        return jsonify({"success" : "false", "message" : "File not uploaded. Please try again!"}), 400
    finally:
        print("Upload endpoint was called and served")

@app.route('/forecast-analysis', methods=['POST'])
def analysis():
    try:
        df = pd.read_csv('data.csv')
        data = request.json  # Access the JSON data from the request
        freq = "W"
        date_col = data.get('unique_col')
        value_col = data.get('forecast_col')
        
        print(freq, date_col, value_col)
        
        df_weekly, highly_correlated_features, pair_plot_file = perform_eda(df, "W", date_col, value_col)
        if freq=='W':
            sarimax_model, summary = fit_sarimax_model(df_weekly, value_col='sales', order=(1, 1, 1), seasonal_order=(1, 1, 1, 52))
        elif freq=='Y':
            sarimax_model, summary = fit_sarimax_model(df_weekly, value_col='sales', order=(1, 1, 1), seasonal_order=(1, 1, 1, 1))
        elif freq=='D':
            sarimax_model, summary = fit_sarimax_model(df_weekly, value_col='sales', order=(1, 1, 1), seasonal_order=(1, 1, 1, 365))
        print("Hi 52")
        data_file, forecast_plot_file = forecast_and_plot(df, df_weekly, sarimax_model, value_col)
        print("Hi 54")
        return jsonify({"success" : "true", 'pair_plot_file': pair_plot_file, 'highly_correlated_features': highly_correlated_features, 'summary': summary,
                        'forecast_plot_file': forecast_plot_file, 'data_file': data_file}), 200
    except Exception:
        return jsonify({"success" : "false", "message" : "File not uploaded. Please try again!"}), 400
    finally:
        print("Forecast analysis endpoint was called and served")


if __name__ == '__main__':
    app.run(debug=True)