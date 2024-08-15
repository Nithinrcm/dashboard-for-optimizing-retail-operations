import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Eda() {
  const location = useLocation();
  const { results } = location.state || {};

  return (
    <div>
      <h1>EDA Page</h1>
      {results}
    </div>
  );
}

export default Eda;
