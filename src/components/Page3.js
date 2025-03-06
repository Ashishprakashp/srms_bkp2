import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Page3 = ({ formData, setFormData }) => {
  // State to track if "Other" is selected for xBoard and xiiBoard
  const [showOtherXBoard, setShowOtherXBoard] = useState(false);
  const [showOtherXiiBoard, setShowOtherXiiBoard] = useState(false);

  const handleChange = (section, field, value) => {
    // Convert numeric fields to numbers
    if (field === 'year' || field === 'percentage' || field === 'cutoff') {
      value = parseFloat(value);
    }

    // Handle "Other" selection for xBoard and xiiBoard
    if (field === 'xBoard') {
      setShowOtherXBoard(value === 'Other');
    }
    if (field === 'xiiBoard') {
      setShowOtherXiiBoard(value === 'Other');
    }

    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  const renderTenthDetails = () => (
    <fieldset className="border p-3 mb-4">
      <legend className="w-auto">Class X Details</legend>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>School Name:</Form.Label>
            <Form.Control
              type="text"
              value={formData.education.xSchool}
              onChange={(e) => handleChange('education', 'xSchool', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Board:</Form.Label>
            <Form.Select
              value={formData.education.xBoard}
              onChange={(e) => handleChange('education', 'xBoard', e.target.value)}
            >
              <option value="---">---</option>
              <option value="State-Board">State-Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          {showOtherXBoard && (
            <Form.Group className="mt-2">
              <Form.Control
                type="text"
                placeholder="Specify other board"
                value={formData.education.xBoardOther || ''}
                onChange={(e) => handleChange('education', 'xBoardOther', e.target.value)}
              />
            </Form.Group>
          )}
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Percentage:</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.education.xPercentage}
              onChange={(e) => handleChange('education', 'xPercentage', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Year of Passing:</Form.Label>
            <Form.Control
              type="number"
              min="1900"
              max="2100"
              value={formData.education.xYear}
              onChange={(e) => handleChange('education', 'xYear', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </fieldset>
  );

  const renderTwelfthDetails = () => (
    <fieldset className="border p-3 mb-4">
      <legend className="w-auto">Class XII Details</legend>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>School Name:</Form.Label>
            <Form.Control
              type="text"
              value={formData.education.xiiSchool}
              onChange={(e) => handleChange('education', 'xiiSchool', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Board:</Form.Label>
            <Form.Select
              value={formData.education.xiiBoard}
              onChange={(e) => handleChange('education', 'xiiBoard', e.target.value)}
            >
              <option value="---">---</option>
              <option value="State-Board">State-Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          {showOtherXiiBoard && (
            <Form.Group className="mt-2">
              <Form.Control
                type="text"
                placeholder="Specify other board"
                value={formData.education.xiiBoardOther || ''}
                onChange={(e) => handleChange('education', 'xiiBoardOther', e.target.value)}
              />
            </Form.Group>
          )}
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Percentage:</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.education.xiiPercentage}
              onChange={(e) => handleChange('education', 'xiiPercentage', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Year of Passing:</Form.Label>
            <Form.Control
              type="number"
              min="1900"
              max="2100"
              value={formData.education.xiiYear}
              onChange={(e) => handleChange('education', 'xiiYear', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </fieldset>
  );

  const renderDiplomaDetails = () => (
    <fieldset className="border p-3 mb-4">
      <legend className="w-auto">UG Details</legend>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>College Name:</Form.Label>
            <Form.Control
              type="text"
              value={formData.education.ugCollege}
              onChange={(e) => handleChange('education', 'ugCollege', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Percentage:</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.education.ugPercentage}
              onChange={(e) => handleChange('education', 'ugPercentage', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Year of Passing:</Form.Label>
            <Form.Control
              type="number"
              min="1900"
              max="2100"
              value={formData.education.ugYear}
              onChange={(e) => handleChange('education', 'ugYear', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </fieldset>
  );

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 3: Educational Details</h2>

      {/* Class X Details */}
      {renderTenthDetails()}

      {/* Class XII Details */}
      {renderTwelfthDetails()}

      {/* UG Details */}
      {renderDiplomaDetails()}
    </div>
  );
};

export default Page3;