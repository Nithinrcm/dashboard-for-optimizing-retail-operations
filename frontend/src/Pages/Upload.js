import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import '../styles/upload.css';
import FileUploadForm from '../Components/FileUploadForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import BanterLoader from '../Components/BanterLoader';

// Set the app element for accessibility
Modal.setAppElement('#root');

function Upload() {
  const [dataFile, setDataFile] = useState(null);
  const [configFile, setConfigFile] = useState(null);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [uniqueCol, setUniqueCol] = useState('');
  const [forecastCol, setForecastCol] = useState('');
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDataFileChange = (file) => {
    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file for the dataset.');
    } else {
      setDataFile(file);
    }
  };

  const handleConfigFileChange = (file) => {
    if (file.type !== 'application/json') {
      toast.error('Please upload a JSON file for the configuration.');
    } else {
      setConfigFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!dataFile || !configFile) {
      toast.error('Both files must be uploaded.');
      return;
    }

    const formData = new FormData();
    formData.append('data_file', dataFile);
    formData.append('config_file', configFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);
      if (response.data.error.length > 0) {
        setError(response.data.error);
        setColumns(response.data.columns);
        setShowDropdowns(true);
      } else {
        setError(null);
        setColumns(response.data.columns);
        setShowDropdowns(true);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('An error occurred while uploading files.');
    }
  };

  const fetchForecastbasicAnalysis = async () => {
    try {
      const response = await axios.post('http://localhost:5000/forecast-analysis', {
        unique_col: uniqueCol,
        forecast_col: forecastCol,
      });

      return response;
    } catch (error) {
      console.error('Error during forecasting:', error);
      toast.error('Failed to run forecast. Please check the server logs for more details.');
    }
  };

  const handleFormSubmit = async () => {
    if (!uniqueCol || !forecastCol) {
      toast.error('Please choose both the columns to proceed.');
      return;
    }
    if (error) {
      setModalIsOpen(true);
    } else {
      const data = await fetchForecastbasicAnalysis();
      navigate('/basicAnalysis', { state: { results: data.data } });
    }
  };

  const handleReuploadData = () => {
    setModalIsOpen(false);
    setShowDropdowns(false);
    setDataFile(null);
    setConfigFile(null);
    setError(null);
  };

  const handleProceedWithErrors = async () => {
    setModalIsOpen(false);
    setLoading(true);
    const data = await fetchForecastbasicAnalysis();
    setLoading(false);
    navigate('/basicAnalysis', { state: { results: data.data } });
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {loading ? (
        <BanterLoader />
      ) : (
        <>
          {!showDropdowns ? (
            <>
              <h1 className="header">File Upload and Validation</h1>
              <div className="upload-section">
                <FileUploadForm
                  title="Upload Dataset (CSV)"
                  paragraphText="Upload your dataset in CSV format."
                  dropText="Drop CSV file here"
                  accept=".csv"
                  onFileChange={handleDataFileChange}
                />
                <FileUploadForm
                  title="Upload Config (JSON)"
                  paragraphText="Upload your configuration in JSON format."
                  dropText="Drop JSON file here"
                  accept=".json"
                  onFileChange={handleConfigFileChange}
                />
              </div>
              <button className="submit-button" onClick={handleFileUpload}>Upload</button>
            </>
          ) : (
            <>
              <h1 className="header">Choose Unique and Forecast Columns</h1>
              <div className="dropdown-section">
                <select value={uniqueCol} required onChange={(e) => setUniqueCol(e.target.value)}>
                  <option value="">Select Unique Column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                <select value={forecastCol} required onChange={(e) => setForecastCol(e.target.value)}>
                  <option value="">Select Forecast Column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                <button className="submit-button" onClick={handleFormSubmit}>Submit</button>
              </div>

              <div className="error-section">
                <h2 className="error-heading">Error in Uploaded Data</h2>
                <table className="error-table">
                  <tbody>
                    {error ? (
                      error.map((err, index) => (
                        <tr key={index}>
                          <td className='err-td'>{err}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className='crt-td'>No errors in uploaded data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal for handling errors */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Error Modal"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>There are errors in your dataset</h2>
        <div className="modal-buttons">
          <button className="modal-button" onClick={handleReuploadData}>Reupload Dataset</button>
          <button className="modal-button" onClick={handleProceedWithErrors}>Proceed</button>
        </div>
      </Modal>
    </div>
  );
}

export default Upload;
