from flask import Flask, request, jsonify
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

model = None
data = None

@app.route('/upload', methods=['POST'])
def upload_file():
    global model, data
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Read the file
        data = pd.read_csv(file)

        # Convert 'date' column to datetime
        data['date'] = pd.to_datetime(data['date'], format='%d-%m-%Y')

        # Extract date features
        data['year'] = data['date'].dt.year
        data['month'] = data['date'].dt.month
        data['day'] = data['date'].dt.day
        data['day_of_week'] = data['date'].dt.dayofweek

        # Drop original 'date' column
        data = data.drop('date', axis=1)

        # Ensure all remaining columns are numeric
        for column in data.columns:
            data[column] = pd.to_numeric(data[column], errors='coerce')

        # Drop rows with missing values (if any)
        data = data.dropna()

        # Features and target variable
        X = data.drop('sales', axis=1)
        y = data['sales']

        # Train-Test Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Model: Random Forest Regressor (more complex model)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Cross-validation score
        cv_score = cross_val_score(model, X, y, cv=5, scoring='neg_mean_absolute_error').mean()
        accuracy = mean_absolute_error(y_test, model.predict(X_test))

        # Save model
        joblib.dump(model, 'model.pkl')

        response = {
            'accuracy': accuracy,
            'cv_score': -cv_score,  # Cross-validation score (positive)
            'message': 'Model trained successfully'
        }

        return jsonify(response)
    
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 400

@app.route('/predict', methods=['POST'])
def predict_sales():
    global model, data
    try:
        if model is None or data is None:
            return jsonify({'error': 'Model or data not available'}), 400

        month = request.json.get('month')
        year = request.json.get('year')

        # Filter data for the selected month and year
        filtered_data = data[(data['month'] == month) & (data['year'] == year)]

        if filtered_data.empty:
            filtered_data = data[(data['month'] == month)]

        X = filtered_data.drop('sales', axis=1)
        predictions = model.predict(X)

        response_data = filtered_data.copy()
        response_data['predictions'] = predictions
        response_data['date'] = pd.to_datetime(
            response_data[['year', 'month', 'day']]
        ).dt.strftime('%Y-%m-%d')

        response = response_data.to_dict(orient='records')
        print(response)
        return response

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
