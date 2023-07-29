// FileUpload.js
import React, { useState } from "react";
import Papa from "papaparse";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // Set the expected number of columns in your CSV file
  const expectedNumberOfColumns = 7;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check if a file was selected
    if (!selectedFile) {
      setError("Please select a CSV file.");
      return;
    }

    // Check the file type
    if (selectedFile.type !== "text/csv") {
      setError("Invalid file type. Please select a CSV file.");
      return;
    }

    // Read the file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      parseCSV(csvText);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvText) => {
    // Parse the CSV data
    Papa.parse(csvText, {
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Error parsing the CSV file.");
        } else {
          // Handle the parsed data (results.data)
          // Implement your custom data validation logic here if needed

          // For example, you can check the number of columns
          if (results.data[0].length !== expectedNumberOfColumns) {
            setError("Invalid number of columns in the CSV file.");
          } else {
            // No errors, clear any previous errors
            setError("");
            setFile(results.data); // Save the parsed data to state
          }
        }
      },
    });
  };

  const handleSubmit = () => {
    if (file) {
      // File is valid, proceed with submitting to the backend
      const formData = new FormData();
      formData.append("csvFile", new Blob([Papa.unparse(file)], { type: "text/csv" }));

      // Make an API call to the backend
      axios.post("https://noapp.onrender.com/upload", formData)
        .then((response) => {
          // Handle the success response, e.g., show a success message
          console.log(response.data.message);
        })
        .catch((error) => {
          // Handle errors, e.g., show an error message
          console.error("Error uploading file:", error.response.data.error);
        });
    } else {
      setError("Please select a valid CSV file before submitting.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FileUpload;
