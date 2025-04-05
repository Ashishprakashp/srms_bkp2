import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

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

      {/* Father's Details */}
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Father's Details</legend>
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
      </fieldset>

      {/* Mother's Details */}
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Mother's Details</legend>
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
      </fieldset>

      {/* Contact Details */}
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Contact Details</legend>
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
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              {/* Mobile Number Field */}
              <Form.Label style={{ color: 'black' }}>Parent's Telephone Number:</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                value={safeFormData.familyInformation.parentContact || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Restrict input to 10 digits
                  if (value.length <= 10) {
                    handleFamilyChange('parentContact', e.target.value)
                  }
                }}
                isInvalid={safeFormData.familyInformation.parentContact && safeFormData.familyInformation.parentContact.length !== 10}
              />
              {/* Display error message if the number is not 10 digits */}
              {safeFormData.familyInformation.parentContact && safeFormData.familyInformation.parentContact.length !== 10 && (
                <Form.Control.Feedback type="invalid">
                  Please enter a 10-digit mobile number.
                </Form.Control.Feedback>
              )}
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
        {formData.personalInformation.student_type==='Hosteller'&&(
          <>
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
        </>
        )}
        
      </fieldset>
    </div>
  );
};

export default Page2;