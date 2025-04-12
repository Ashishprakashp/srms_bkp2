import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, Alert } from "react-bootstrap";

const PassportPhotoUpload = ({ onImageUpload, uploadedImage, path }) => {
  const [preview, setPreview] = useState(uploadedImage || "");
  const [error, setError] = useState("");

  useEffect(() => {
    let oldPreview = preview; // capture current value before it's changed
  
    if (path) {
      setPreview(`http://localhost:5000/${path}`);
    } else if (uploadedImage && typeof uploadedImage === 'string') {
      setPreview(uploadedImage);
    } else {
      setPreview("");
    }
  
    console.log("Path:", path);
  
    return () => {
      if (oldPreview && oldPreview.startsWith("blob:")) {
        URL.revokeObjectURL(oldPreview); // revoke old blob
      }
    };
  }, [uploadedImage, path]);
  
  

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG and PNG files are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds the limit of 2MB.");
        return;
      }

      setError(""); // Clear any previous errors
      const imageUrl = URL.createObjectURL(file); // Create preview URL
      setPreview(imageUrl); // Set preview image
      onImageUpload(file); // Pass the file to parent
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB limit
    multiple: false,
    noClick: true,
  });

  return (
    <Card style={{ width: "200px", height: "250px", marginLeft: "auto" }}>
      <Card.Body>
        {/* Dropzone Area */}
        {!preview && (
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
            onClick={open}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop or click to select photo (JPEG or PNG, max 2MB).
            </p>
          </div>
        )}

        {/* Image Preview */}
        {preview && (
          <div
            {...getRootProps()}
            style={{
              textAlign: "center",
              height: "200px",
              overflow: "hidden",
              marginTop: "1rem",
              cursor: "pointer",
            }}
            onClick={open}
          >
            <input {...getInputProps()} />
            <img
              src={preview}
              alt="Uploaded Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "10px",
              }}
            />
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
