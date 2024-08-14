import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = ({ setResults }) => {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2024);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMonthChange = (event) => {
    setMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setYear(Number(event.target.value));
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setError('');
      console.log("Upload successful:", response.data);
    } catch (error) {
      setError('Error uploading file. Please try again.');
      console.error('Error uploading file:', error);
    }
  };

  const handlePredict = async () => {
    if (!month || !year) {
      setError('Please select both month and year.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/predict', { month, year });
      console.log(response.data);
      setResults(response.data);
      setError('');
    } catch (error) {
      setError('Error predicting sales. Please try again.');
      console.error('Error predicting sales:', error);
    }
  };

  return (
    <div>
      <h2>Upload Sales Data</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

      <h2>Predict Sales</h2>
      <div>
        <label>
          Month:
          <select value={month} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <input
            type="number"
            value={year}
            onChange={handleYearChange}
            min="2000"
            max={new Date().getFullYear() + 10}
          />
        </label>
        <button onClick={handlePredict}>Predict</button>
      </div>
    </div>
  );
};

export default UploadPage;
