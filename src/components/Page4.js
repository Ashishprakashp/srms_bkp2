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

  const renderWorkExperienceTable = () => {
    if (!formData.entranceAndWorkExperience.workExperience || formData.entranceAndWorkExperience.workExperience.length === 0) {
      return null; // Don't render the table if there are no work experiences
    }

    return (
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Work Experience Table</legend>
        <Row>
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
                {formData.entranceAndWorkExperience.workExperience.map((exp, index) => (
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
      </fieldset>
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 4: Entrance Exam and Work Experience</h2>

      {/* Work Experience Form */}
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Work Experience</legend>
        <Row>
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
          <Col md={12} className="text-center mt-4">
            <Button variant="primary" onClick={handleAddExperience}>
              Add Experience
            </Button>
          </Col>
        </Row>
      </fieldset>

      {/* Work Experience Table */}
      {renderWorkExperienceTable()}
    </div>
  );
};

export default Page4;