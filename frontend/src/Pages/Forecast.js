import React from 'react';
import { useLocation } from 'react-router-dom';

function Forecast() {
  const location = useLocation();
  const { forecastResults } = location.state || {};

  return (
    <div>
      <h1>Forecast Results</h1>
      {forecastResults ? (
        <div>
          <h2>Forecast Results</h2>
          <pre>{JSON.stringify(forecastResults, null, 2)}</pre>
          {/* Optionally, provide a link or embed a Power BI dashboard here */}
        </div>
      ) : (
        <p>No forecast results available.</p>
      )}
    </div>
  );
}

export default Forecast;
