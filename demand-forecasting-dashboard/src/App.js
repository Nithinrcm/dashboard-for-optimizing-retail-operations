import React, { useState } from 'react';
import UploadPage from './Pages/Upload';
import Dashboard from './Pages/Dashboard';

const App = () => {
  const [results, setResults] = useState(null);

  return (
    <div>
      <UploadPage setResults={setResults} />
      {results && <Dashboard results={results} />}
    </div>
  );
};

export default App;
