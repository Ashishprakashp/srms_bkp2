import React, { useState } from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';

const Page4 = ({ formData, setFormData }) => {
  const [newExperience, setNewExperience] = useState({ employerName: '', role: '', expYears: '' });

  const handleAddExperience = () => {
    if (newExperience.employerName && newExperience.role && newExperience.expYears) {
      const updatedExperience = [
        ...(formData.entranceAndWorkExperience.workExperience || []),
        {
          ...newExperience,
          expYears: parseFloat(newExperience.expYears), // Ensure expYears is stored as a number
        },
      ];
      setFormData({
        ...formData,
        entranceAndWorkExperience: {
          ...formData.entranceAndWorkExperience,
          workExperience: updatedExperience,
        },
      });
      setNewExperience({ employerName: '', role: '', expYears: '' });
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData((prevFormData) => {
      const updatedWorkExperience = prevFormData.entranceAndWorkExperience.workExperience.filter((_, i) => i !== index);
      return {
        ...prevFormData,
        entranceAndWorkExperience: {
          ...prevFormData.entranceAndWorkExperience,
          workExperience: updatedWorkExperience,
        },
      };
    });
  };

  const handleFormChange = (field, value) => {
    if (field === 'entranceScore' || field === 'entranceYear') {
      value = parseFloat(value);
    }

    // Ensure you're updating entrance and entranceRegister inside entranceAndWorkExperience
    if (field === 'entrance' || field === 'entranceRegister' || field === 'entranceScore' || field === 'entranceYear') {
      setFormData((prevData) => ({
        ...prevData,
        entranceAndWorkExperience: {
          ...prevData.entranceAndWorkExperience,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const renderEntranceExamDetails = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Entrance Exam:</Form.Label>
          <div>
            <Form.Check
              inline
              type="radio"
              label="TANCET"
              name="entrance"
              value="TANCET"
              checked={formData.entranceAndWorkExperience.entrance === 'TANCET'}
              onChange={(e) => handleFormChange('entrance', e.target.value)}
            />
            <Form.Check
              inline
              type="radio"
              label="GATE"
              name="entrance"
              value="GATE"
              checked={formData.entranceAndWorkExperience.entrance === 'GATE'}
              onChange={(e) => handleFormChange('entrance', e.target.value)}
            />
          </div>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Register Number:</Form.Label>
          <Form.Control
            type="text"
            value={formData.entranceAndWorkExperience.entranceRegister || ''}
            onChange={(e) => handleFormChange('entranceRegister', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Score:</Form.Label>
          <Form.Control
            type="number"
            value={formData.entranceAndWorkExperience.entranceScore || ''}
            onChange={(e) => handleFormChange('entranceScore', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Year:</Form.Label>
          <Form.Control
            type="number"
            value={formData.entranceAndWorkExperience.entranceYear || ''}
            onChange={(e) => handleFormChange('entranceYear', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Scorecard:</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setFormData({ ...formData, entranceScorecard: e.target.files[0] })}
          />
        </Form.Group>
      </Col>
    </Row>
  );

  const renderWorkExperienceForm = () => (
    <Row className="mb-3">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Employer Name:</Form.Label>
          <Form.Control
            type="text"
            value={newExperience.employerName}
            onChange={(e) => setNewExperience({ ...newExperience, employerName: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Role/Designation:</Form.Label>
          <Form.Control
            type="text"
            value={newExperience.role}
            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Experience (in Years):</Form.Label>
          <Form.Control
            type="number"
            value={newExperience.expYears}
            onChange={(e) => setNewExperience({ ...newExperience, expYears: e.target.value })}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Certificate:</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setNewExperience({ ...newExperience, certificate: e.target.files[0] })}
          />
        </Form.Group>
      </Col>
      <Col md={12} className="text-center">
        <Button variant="primary" onClick={handleAddExperience}>
          Add Experience
        </Button>
      </Col>
    </Row>
  );

  const renderWorkExperienceTable = () => (
    <Row className="mb-3">
      <Col>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Employer Name</th>
              <th>Role/Designation</th>
              <th>Experience (Years)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {formData.entranceAndWorkExperience.workExperience &&
              formData.entranceAndWorkExperience.workExperience.map((exp, index) => (
                <tr key={index}>
                  <td>{exp.employerName}</td>
                  <td>{exp.role}</td>
                  <td>{exp.expYears}</td>
                  <td>
                    <Button variant="danger" onClick={() => handleRemoveExperience(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 4: Entrance Exam and Work Experience</h2>

      {/* Entrance Exam Details */}
      {renderEntranceExamDetails()}

      {/* Work Experience Form */}
      {renderWorkExperienceForm()}

      {/* Work Experience Table */}
      {formData.entranceAndWorkExperience.workExperience &&
        formData.entranceAndWorkExperience.workExperience.length > 0 &&
        renderWorkExperienceTable()}
    </div>
  );
};

export default Page4;