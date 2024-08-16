import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Upload from './Pages/Upload';
import Dashboard from './Pages/Dashboard';
import BasicAnalysis from './Pages/BasicAnalysis';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path='/basicAnalysis' element={<BasicAnalysis />} />
          <Route path='/Dashboard' element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

