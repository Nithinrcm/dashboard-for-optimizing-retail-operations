import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css'; // Import your custom CSS
import '../styles/upload.css';

function Upload() {
  const [dataFile, setDataFile] = useState(null);
  const [configFile, setConfigFile] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [columns, setColumns] = useState([]);
  const [frequency, setFrequency] = useState('');
  const [uniqueCol, setUniqueCol] = useState('');
  const [forecastCol, setForecastCol] = useState('');
  const [forecastResults, setForecastResults] = useState({});
  const navigate = useNavigate();

  const handleDataFileChange = (e) => {
    setDataFile(e.target.files[0]);
  };

  const handleConfigFileChange = (e) => {
    setConfigFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('data_file', dataFile);
    formData.append('config_file', configFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);
      if (response.data.error.length > 0) {
        setError(response.data.error.join(', '));
      } else {
        setError(null);
        setColumns(response.data.columns); // Set columns from API response
      }
      setOpenDialog(true);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const fetchForecastAnalysis = async () => {
    try {
      // Map the frequency to the corresponding code
      const frequencyMapping = {
        weeks: 'W',
        days: 'D',
        year: 'Y'
      };
      
      const mappedFrequency = frequencyMapping[frequency]; // Get the mapped value
      
      const response = await axios.post('http://localhost:5000/forecast-analysis', {
        unique_col: uniqueCol,
        forecast_col: forecastCol,
      });
      
      console.log('Forecast Analysis Response:', response);
      return response;
    } catch (error) {
      console.error('Error during forecasting:', error);
      alert('Failed to run forecast. Please check the server logs for more details.');
    }
  };

  const handleFormSubmit = async() => {
    // Handle form submission logic here
    const data = await fetchForecastAnalysis();
    navigate('/eda', { state: {"results": data.data}});
    handleDialogClose();
  };

  const handleButtonClick = (action) => {
    if (action === 'continue') {
      handleFormSubmit();
    } else {
      handleDialogClose();
    }
  };

  return (
    <div className="container">
      <h1 className="header">File Upload and Validation</h1>
      <div className="upload-section">
        <h2>Upload Dataset</h2>
        <input type="file" onChange={handleDataFileChange} />
      </div>
      <div className="upload-section">
        <h2>Upload Configuration File</h2>
        <input type="file" onChange={handleConfigFileChange} />
      </div>
      <button className="upload-button" onClick={handleFileUpload}>
        Upload
      </button>

      {/* Dialog Box */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2>Validation Result</h2>
            {error ? (
              <p></p>
            ) : (
              <form>
                <label>
                  Unique Column
                  <select value={uniqueCol} onChange={(e) => setUniqueCol(e.target.value)}>
                    {columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Forecast Column
                  <select value={forecastCol} onChange={(e) => setForecastCol(e.target.value)}>
                    {columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </label>
                
                {error && (
                  <fieldset>
                    <legend>Action</legend>
                    <div className="radio-buttons">
                      <button
                        type="button"
                        className={'selected'}
                        onClick={() => handleButtonClick('reupload')}
                      >
                        Re-upload
                      </button>
                      <button
                        type="button"
                        className={'selected'}
                        onClick={() => handleButtonClick('continue')}
                      >
                        Continue
                      </button>
                    </div>
                  </fieldset>
                )}
              </form>
            )}
            <button onClick={handleDialogClose}>Cancel</button>
            {!error && <button onClick={handleFormSubmit}>Submit</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
