// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Upload from './Pages/Upload';
import Dashboard from './Pages/Dashboard';
import BasicAnalysis from './Pages/BasicAnalysis';
import Login from './Pages/LoginPage';
import Layout from './Components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/login" element={<Login />} index/>
          <Route path="/basicAnalysis" element={<BasicAnalysis />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
