import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Page5 = ({ formData, setFormData }) => {
  const handleAcceptanceChange = (e) => {
    setFormData({
      ...formData,
      acceptance: e.target.checked, // Update the acceptance field in formData
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-center">Page 5: Declaration</h2>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Form.Group controlId="acceptance">
            <div className="border p-4 d-flex align-items-center">
              <Form.Check 
                type="checkbox"
                checked={formData.acceptance || false}
                onChange={handleAcceptanceChange}
                className="me-3 custom-checkbox"
              />
              <span className="fs-5">
                I hereby declare that all the details and documents provided by me are true and correct to the best of my knowledge.
              </span>
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Add Custom Styles */}
      <style>
        {`
          .custom-checkbox input[type="checkbox"] {
            transform: scale(1.5); /* Increase checkbox size */
          }
        `}
      </style>
    </div>
  );
};

export default Page5;
