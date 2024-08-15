import base64
import io
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from pandas.tseries.offsets import DateOffset
import json
from datetime import datetime

def perform_eda(dataframe, freq, date_col, value_col, plot_file='pair_plot.png'):
    """
    Perform EDA on the provided time series data, including pair plots, correlation plots,
    and identifying highly correlated features.

    Parameters:
        dataframe (pd.DataFrame): DataFrame containing the time series data.
        date_col (str): The column name for the date.
        value_col (str): The column name for the value to be analyzed.
        freq (str): Frequency for resampling (e.g., 'W' for weekly).
        plot_file (str): Path to the image file where the pair plot will be saved.

    Returns:
        tuple: A tuple containing three elements:
            - pd.DataFrame: DataFrame with resampled time series data.
            - list: List of feature names with correlation > average correlation.
            - str: Path to the saved pair plot image file.
    """

    # Process date column
    dataframe[date_col] = pd.to_datetime(dataframe[date_col], format='%d-%m-%Y')

    # Group by date and aggregate values
    df_grouped = dataframe.groupby(date_col).agg({value_col: 'sum'}).reset_index()

    # Set date as index
    df_grouped.set_index(date_col, inplace=True)

    # Resample data by the given frequency
    df_resampled = df_grouped.resample(freq).agg({value_col: 'sum'})

    # Drop any rows with missing values
    df_resampled.dropna(inplace=True)

    # Identify numeric columns for pair plots
    numeric_cols = [col for col in dataframe.columns if dataframe[col].dtype != object and col != value_col]
    n_cols = 3
    n_rows = int(np.ceil(len(numeric_cols) / n_cols))

    # Create pair plots and show correlation values
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 5 * n_rows))
    fig.suptitle('Pair Plots of Independent Variables against Dependent Variable with Correlation', fontsize=16)

    for i, col in enumerate(numeric_cols):
        row, col_num = divmod(i, n_cols)
        sns.scatterplot(x=dataframe[col], y=dataframe[value_col], ax=axes[row, col_num])
        corr = dataframe[col].corr(dataframe[value_col])
        axes[row, col_num].set_title(f'{col} vs {value_col}\nCorrelation: {corr:.2f}', fontsize=12)

    # Hide any empty subplots
    for j in range(i + 1, n_rows * n_cols):
        fig.delaxes(axes.flat[j])

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='png')
    plt.close()

    # Encode the image to Base64
    img_stream.seek(0)
    img_base64 = base64.b64encode(img_stream.getvalue()).decode('utf-8')

    # Calculate correlation matrix
    corr_matrix = dataframe[numeric_cols].corr()

    # Calculate average correlation
    avg_corr = corr_matrix.mean().iloc[1:-1]  # Exclude target variable and itself

    # Identify highly correlated features (> average correlation)
    highly_correlated = [col for col in avg_corr.index if avg_corr[col] > avg_corr.mean()]

    return df_resampled, highly_correlated, img_base64

def fit_sarimax_model(dataframe, value_col, order=(1, 1, 1), seasonal_order=(1, 1, 1, 52)):
    """
    Fit a SARIMAX model and return the model fitted object.

    Parameters:
        dataframe (pd.DataFrame): DataFrame containing the time series data.
        value_col (str): The column name for the value to be modeled.
        order (tuple): The (p, d, q) order of the ARIMA model.
        seasonal_order (tuple): The (P, D, Q, s) seasonal order of the SARIMAX model.

    Returns:
        SARIMAXResults: Fitted SARIMAX model.
    """
    model = sm.tsa.statespace.SARIMAX(dataframe[value_col], order=order, seasonal_order=seasonal_order)
    results = model.fit()
    return results, str(results.summary())

def forecast_and_plot(data, dataframe, model_results, value_col, forecast_periods=20, output_file='data.csv', plot_file='forecast_plot.png'):
    """
    Generate and plot forecasts from the fitted model, save results and plot.

    Parameters:
        dataframe (pd.DataFrame): DataFrame containing the time series data.
        model_results: Fitted model object (ARIMA or SARIMAX).
        value_col (str): The column name for the value to be forecasted.
        forecast_periods (int): Number of periods to forecast into the future.
        output_file (str): Path to the CSV file where results will be saved.
        plot_file (str): Path to the image file where the plot will be saved.
    
    Returns:
        dict: Dictionary containing CSV content as JSON and the path to the saved plot image file.
    """
    forecast_index = [dataframe.index[-1] + DateOffset(weeks=x) for x in range(1, forecast_periods + 1)]
    future_df = pd.DataFrame(index=forecast_index, columns=dataframe.columns)

    future_df = pd.concat([dataframe, future_df])
    future_df['forecast'] = model_results.predict(start=len(dataframe), end=len(dataframe) + forecast_periods - 1, dynamic=True)

    # Plot forecast
    future_df[[value_col, 'forecast']].plot(figsize=(12, 8))
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='png')
    plt.close()
    # Encode the image to Base64
    img_stream.seek(0)
    img_base64 = base64.b64encode(img_stream.getvalue()).decode('utf-8')
    
    # Return a dictionary containing CSV content as JSON and the path to the plot image file
    return img_base64

def load_rules(json_file_path):
    with open(json_file_path, 'r') as file:
        rules_config = json.load(file)
    return rules_config["rules"]

def validate_data(df, rules):
    validation_errors = []

    for rule in rules:
        column = rule["column"]
        required = rule.get("required", False)
        data_type = rule.get("type")
        options = rule.get("options", [])
        date_format = rule.get("format")

        # Check if column exists in DataFrame
        if column not in df.columns:
            validation_errors.append(f"Column '{column}' is missing in the DataFrame.")
            continue

        # Validate each row in the column
        for idx, value in df[column].items():
            # Convert value to the appropriate type if it's not NaN
            if pd.notna(value):
                if data_type == "int":
                    try:
                        value = int(value)
                    except ValueError:
                        validation_errors.append(f"Row {idx}: {column} should be an integer.")
                        continue
                elif data_type == "float":
                    try:
                        value = float(value)
                    except ValueError:
                        validation_errors.append(f"Row {idx}: {column} should be a float.")
                        continue
                elif data_type == "string" and not isinstance(value, str):
                    validation_errors.append(f"Row {idx}: {column} should be a string.")
                    continue

            # Check if the field is required and missing
            if required and pd.isna(value):
                validation_errors.append(f"Row {idx}: {column} is required but missing.")
                continue

            # Check for valid date format
            if data_type == "date":
                try:
                    pd.to_datetime(value, format=date_format, errors='raise')
                except ValueError:
                    validation_errors.append(f"Row {idx}: {column} should be a date in {date_format} format.")
                continue

            # Check if the value is within the allowed options
            if options and pd.notna(value) and value not in options:
                validation_errors.append(f"Row {idx}: {column} has an invalid value '{value}'. Expected one of {options}.")

    return validation_errors
