import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Alert } from "react-bootstrap";

const PassportPhotoUpload = ({ onImageUpload, uploadedImage }) => {
  const [error, setError] = useState("");

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Pass the File object directly to parent
      onImageUpload(file);
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    noClick: true
  });

  return (
    <Card style={{ width: '200px', height: '250px', marginLeft: 'auto' }}>
      <Card.Body>
        {/* ... existing preview code ... */}
        <Card.Title>Photo</Card.Title>

        {/* Dropzone Area */}
        {!uploadedImage && (
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #007bff",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={open} // Manually trigger file dialog on click
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a photo here, or click to select a file (JPEG or PNG, max 2MB).
            </p>
          </div>
        )}

        {/* Image Preview */}
        {uploadedImage && (
          <div
            style={{ textAlign: "center", height: "200px", overflow: "hidden", marginTop: "1rem" }}
            onClick={open} // Click on the preview to open file dialog
          >
            <p className="image-preview-label">Preview:</p>
            <div>
              <img
                src={uploadedImage}
                alt="Uploaded Preview"
                style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "10px", cursor: "pointer" }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="danger" style={{ marginTop: "1rem" }}>
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default PassportPhotoUpload;