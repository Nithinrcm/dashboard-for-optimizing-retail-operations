import React, { useState } from 'react';
import "../styles/CheckmarkCheckbox.css"

const CheckmarkCheckbox = () => {
  const [checked, setChecked] = useState(true);

  const handleChange = () => {
    setChecked(prevChecked => !prevChecked);
  };

  return (
    <label className="container">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        aria-label="Toggle checkmark"
      />
      <div className="checkmark">
        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
          <title>Checkmark</title>
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M416 128L192 384l-96-96"></path>
        </svg>
      </div>
    </label>
  );
};

export default CheckmarkCheckbox;
