import React from 'react';
import { Form, Row, Col, Container } from 'react-bootstrap';

const Page5 = ({ formData, setFormData }) => {
  const handleAcceptanceChange = (e) => {
    setFormData({
      ...formData,
      acceptance: e.target.checked
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 5: Declaration</h2>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Form.Group controlId="acceptance">
            <div className="border p-4 text-center">
              <Form.Check 
                type="checkbox"
                label="I hereby declare that all the details and documents provided by me are true and correct to the best of my knowledge."
                checked={formData.acceptance || false}
                onChange={handleAcceptanceChange}
                className="d-inline-block text-start"
              />
            </div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default Page5;