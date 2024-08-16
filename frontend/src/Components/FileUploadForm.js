import React from 'react';
import styles from '../styles/FileUploadForm.module.css';

const FileUploadForm = ({ 
  title, 
  paragraphText, 
  dropText, 
  accept, 
  onFileChange 
}) => {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <form className={styles.form}>
      <span className={styles.formTitle}>{title}</span>
      <p className={styles.formParagraph}>
        {paragraphText}
      </p>
      <label htmlFor="file-input" className={styles.dropContainer}>
        <span className={styles.dropTitle}>{dropText}</span>
        or
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          id="file-input"
          className={styles.fileInput}
        />
      </label>
    </form>
  );
};

export default FileUploadForm;
