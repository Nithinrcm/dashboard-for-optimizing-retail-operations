// import React, { useState } from 'react';
// import UploadPage from './Pages/Upload';
// import Dashboard from './Pages/Dashboard';

// const App = () => {
//   const [results, setResults] = useState(null);

//   return (
//     <div>
//       <UploadPage setResults={setResults} />
//       {results && <Dashboard results={results} />}
//     </div>
//   );
// };

// export default App;
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

