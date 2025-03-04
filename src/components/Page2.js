import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
// import './styles/Page1.css'; // Keep this for any custom styles not covered by Bootstrap

const Page2 = ({ formData, setFormData }) => {
  const safeFormData = formData || { familyInformation: {} };

  const handleFamilyChange = (field, value) => {
    setFormData({
      ...formData,
      familyInformation: {
        ...formData.familyInformation,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 2: Parents Details</h2>

      {/* Father's Name and Occupation */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Father's Name (with initial at last):</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.fatherName || ''}
              onChange={(e) => handleFamilyChange('fatherName', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Father's Occupation:</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.fatherOcc || ''}
              onChange={(e) => handleFamilyChange('fatherOcc', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Father's Annual Income */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Father's Annual Income:</Form.Label>
            <Form.Control
              type="number"
              value={safeFormData.familyInformation.fatherInc || ''}
              onChange={(e) => handleFamilyChange('fatherInc', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Mother's Name and Occupation */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Mother's Name (with initial at last):</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.motherName || ''}
              onChange={(e) => handleFamilyChange('motherName', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Mother's Occupation:</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.motherOcc || ''}
              onChange={(e) => handleFamilyChange('motherOcc', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Mother's Annual Income */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Mother's Annual Income:</Form.Label>
            <Form.Control
              type="number"
              value={safeFormData.familyInformation.motherInc || ''}
              onChange={(e) => handleFamilyChange('motherInc', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Parent's Address */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Name & Address of Parent:</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={safeFormData.familyInformation.parentAddr || ''}
              onChange={(e) => handleFamilyChange('parentAddr', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Parent's Contact and Email */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Parent's Telephone Number:</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.parentContact || ''}
              onChange={(e) => handleFamilyChange('parentContact', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Parent's Email:</Form.Label>
            <Form.Control
              type="email"
              value={safeFormData.familyInformation.parentMail || ''}
              onChange={(e) => handleFamilyChange('parentMail', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Guardian's Address */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Name & Address of Guardian:</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={safeFormData.familyInformation.guardianAddr || ''}
              onChange={(e) => handleFamilyChange('guardianAddr', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Guardian's Contact and Email */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Guardian's Telephone Number:</Form.Label>
            <Form.Control
              type="text"
              value={safeFormData.familyInformation.guardianContact || ''}
              onChange={(e) => handleFamilyChange('guardianContact', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Guardian's Email:</Form.Label>
            <Form.Control
              type="email"
              value={safeFormData.familyInformation.guardianMail || ''}
              onChange={(e) => handleFamilyChange('guardianMail', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default Page2;