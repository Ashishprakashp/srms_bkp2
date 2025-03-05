import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Alert } from "react-bootstrap";

const PassportPhotoUpload = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState("");

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG or PNG image.");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size is too large. Maximum size is 2MB.");
      return false;
    }

    setError("");
    return true;
  };

  // Handle file drop/upload
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setError("Invalid file. Please upload a valid JPEG or PNG image.");
      return;
    }

    const file = acceptedFiles[0];

    if (validateFile(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Configure dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/jpg",
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false, // Allow only one image
  });

  return (
    <Card style={{ width: '200px', height: '250px', marginLeft: 'auto' }}>
      <Card.Body>
        <Card.Title>Photo</Card.Title>

        {/* Dropzone Area */}
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #007bff',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input {...getInputProps()} />
          <p className="text-muted">
            Drag & drop a photo here, or click to select a file (JPEG or PNG, max 2MB).
          </p>
        </div>

        {/* Image Preview */}
        <div style={{ textAlign: 'center', height: '200px', overflow: 'hidden', marginTop: '1rem' }}>
          <p className="image-preview-label">Preview:</p>
          <div>
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px' }}
              />
            ) : (
              <p className="text-muted">No Image Selected</p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="danger" style={{ marginTop: '1rem' }}>
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default PassportPhotoUpload;