import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Eda() {
  const location = useLocation();
  const { edaData } = location.state || {};
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [forecastResults, setForecastResults] = useState(null);
  const navigate = useNavigate();

  const handleFeatureSelection = async () => {
    try {
      const response = await axios.post('http://localhost:5000/forecast', {
        selectedFeatures,
      });
      navigate('/forecast', { state: { forecastResults: response.data } });
    } catch (error) {
      console.error('Error during forecasting:', error);
      alert('Failed to run forecast. Please check the server logs for more details.');
    }
  };

  return (
    <div>
      <h1>EDA Results and Feature Selection</h1>
      {edaData && (
        <div>
          <h2>EDA Results</h2>
          <pre>{JSON.stringify(edaData, null, 2)}</pre>
          <h3>Select Features for Forecasting:</h3>
          {edaData.features.map((feature) => (
            <div key={feature}>
              <input
                type="checkbox"
                value={feature}
                onChange={(e) =>
                  setSelectedFeatures(
                    e.target.checked
                      ? [...selectedFeatures, feature]
                      : selectedFeatures.filter((f) => f !== feature)
                  )
                }
              />
              {feature}
            </div>
          ))}
          <button onClick={handleFeatureSelection}>Run Forecast</button>
        </div>
      )}
    </div>
  );
}

export default Eda;
