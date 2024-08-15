import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Upload from './Pages/Upload';
import Eda from './Pages/EDA';
import Forecast from './Pages/Forecast';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/eda" element={<Eda />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

