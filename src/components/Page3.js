import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Page3 = ({ formData, setFormData }) => {
  const handleChange = (section, field, value) => {
    // Convert numeric fields to numbers
    if (field === 'year' || field === 'percentage' || field === 'cutoff') {
      value = parseFloat(value);
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
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>10th School Name:</Form.Label>
          <Form.Control
            type="text"
            value={formData.education.xSchool}
            onChange={(e) => handleChange('education', 'xSchool', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>10th Board:</Form.Label>
          <Form.Control
            type="text"
            value={formData.education.xBoard}
            onChange={(e) => handleChange('education', 'xBoard', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>10th Percentage:</Form.Label>
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
          <Form.Label>10th Year of Passing:</Form.Label>
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
  );

  const renderTwelfthDetails = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>12th School Name:</Form.Label>
          <Form.Control
            type="text"
            value={formData.education.xiiSchool}
            onChange={(e) => handleChange('education', 'xiiSchool', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>12th Board:</Form.Label>
          <Form.Control
            type="text"
            value={formData.education.xiiBoard}
            onChange={(e) => handleChange('education', 'xiiBoard', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>12th Percentage:</Form.Label>
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
          <Form.Label>12th Year of Passing:</Form.Label>
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
  );

  const renderDiplomaDetails = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Diploma College Name:</Form.Label>
          <Form.Control
            type="text"
            value={formData.education.ugCollege}
            onChange={(e) => handleChange('education', 'ugCollege', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Diploma Percentage:</Form.Label>
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
          <Form.Label>Diploma Year of Passing:</Form.Label>
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
  );

  const renderEntranceExamDetails = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Entrance Exam Name:</Form.Label>
          <Form.Control
            type="text"
            value={formData.entranceAndWorkExperience.entrance}
            onChange={(e) => handleChange('entranceAndWorkExperience', 'entrance', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Entrance Exam Score:</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={formData.entranceAndWorkExperience.entranceScore}
            onChange={(e) => handleChange('entranceAndWorkExperience', 'entranceScore', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Entrance Exam Year:</Form.Label>
          <Form.Control
            type="number"
            min="1900"
            max="2100"
            value={formData.entranceAndWorkExperience.entranceYear}
            onChange={(e) => handleChange('entranceAndWorkExperience', 'entranceYear', e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>
  );

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 3: Educational Details</h2>

      {/* 10th Details */}
      {renderTenthDetails()}

      {/* 12th Details */}
      {renderTwelfthDetails()}

      {/* Diploma Details */}
      {renderDiplomaDetails()}

      {/* Entrance Exam Details */}
      {renderEntranceExamDetails()}
    </div>
  );
};

export default Page3;