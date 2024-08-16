import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/BasicAnalysis.css';

function BasicAnalysis() {
  const location = useLocation();
  const { results } = location.state || {};
  const navigate = useNavigate();
  const {
    forecast_plot_file,
    pair_plot_file,
    columns = [],
    highly_correlated_features = [],
  } = results || {};

  const [selectedColumns, setSelectedColumns] = useState(
    new Set(highly_correlated_features)
  );

  const handleCheckboxChange = (column) => {
    setSelectedColumns((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(column)) {
        updatedSelection.delete(column);
      } else {
        updatedSelection.add(column);
      }
      return updatedSelection;
    });
  };

  const generateReport = () => {
    handleRefresh();
    navigate("/dashboard");
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/refresh-dataset');
      if (response.data.success) {
        alert('Dataset refresh triggered successfully!');
      } else {
        alert('Failed to trigger dataset refresh');
      }
    } catch (error) {
      console.error('Error refreshing dataset:', error);
      alert('An error occurred while trying to refresh the dataset');
    }
  };

  return (
    <><div className="container">
      <div className='image-container'>
        <div className='image'>
          <h2>Pair Plot</h2>
          {pair_plot_file ? (
            <img
              src={`data:image/png;base64,${pair_plot_file}`}
              alt="Pair Plot"
              className="plot-image" />
          ) : (
            <p>No Pair plot available.</p>
          )}
        </div>
        <div className='image'>
        <h2>Forecast Plot</h2>
        {forecast_plot_file ? (
          <img
            src={`data:image/png;base64,${forecast_plot_file}`}
            alt="Forecast Plot"
            className="plot-image" />
        ) : (
          <p>No Forecast plot available.</p>
        )}
        </div>
      </div>
    </div><div className="checkboxes">
        <h2>Select Columns</h2>
        <div className="checkbox-grid">
          {columns.length > 0 ? (
            columns.map((column) => (
              <div key={column} className="checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedColumns.has(column)}
                    onChange={() => handleCheckboxChange(column)} />
                  {column}
                </label>
              </div>
            ))
          ) : (
            <p>No columns available.</p>
          )}
        </div>
      </div><button className="generate-report" onClick={generateReport}>
        Generate Report
      </button>
      </>
  );
}

export default BasicAnalysis;
