import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function Eda() {
  const location = useLocation();
  const { results } = location.state || {};
  console.log(results);

  // Destructure the necessary data from results
  const {
    forecast_plot_file,
    pair_plot_file,
    columns = [],
    highly_correlated_features = [],
  } = results || {};

  // State to manage checkbox selections
  const [selectedColumns, setSelectedColumns] = useState(
    new Set(highly_correlated_features)
  );

  // Handler for checkbox changes
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

  return (
    <div>
      <h1>EDA Page</h1>    
      <div>
        <h2>Pair Plot</h2>
        {pair_plot_file ? (
          <img
          src={`data:image/png;base64,${pair_plot_file}`}
          alt="Pair Plot"
          style={{ width: '100%', height: 'auto' }}
        />
        ) : (
          <p>No Pair plot available.</p>
        )}
      </div>
      {/* Display image */}
      <div>
        <h2>Forecast Plot</h2>
        {forecast_plot_file ? (
          <img
          src={`data:image/png;base64,${forecast_plot_file}`}
          alt="Forecast Plot"
          style={{ width: '100%', height: 'auto' }}
        />
        ) : (
          <p>No forecast plot available.</p>
        )}
      </div>
      
      {/* Display checkboxes */}
      <div>
        <h2>Select Columns</h2>
        {columns.length > 0 ? (
          columns.map((column) => (
            <div key={column}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedColumns.has(column)}
                  onChange={() => handleCheckboxChange(column)}
                />
                {column}
              </label>
            </div>
          ))
        ) : (
          <p>No columns available.</p>
        )}
      </div>
    </div>
  );
}

export default Eda;
