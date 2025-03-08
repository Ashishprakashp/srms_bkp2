import React, { useState, useRef } from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';

const Page4 = ({ formData, setFormData }) => {
  const [newExperience, setNewExperience] = useState({ employerName: '', role: '', expYears: '', certificate: null });
  const fileInputRef = useRef(null); // Ref for file input
  const scorecardInputRef = useRef(null); // Ref for scorecard file input

  // Handle adding work experience
  const handleAddExperience = () => {
    if (newExperience.employerName && newExperience.role && newExperience.expYears) {
      const updatedExperience = [
        ...(formData.entranceAndWorkExperience.workExperience || []),
        {
          ...newExperience,
          expYears: parseFloat(newExperience.expYears), // Convert expYears to number
          certificate: newExperience.certificate ? URL.createObjectURL(newExperience.certificate) : null, // Store file URL for preview
          certificateFile: newExperience.certificate, // Store File object for submission
        },
      ];
      setFormData({
        ...formData,
        entranceAndWorkExperience: {
          ...formData.entranceAndWorkExperience,
          workExperience: updatedExperience,
        },
      });
  
      // Reset input fields
      setNewExperience({ employerName: '', role: '', expYears: '', certificate: null });
  
      // Reset file input manually
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle removing work experience
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

  // Handle entrance exam details change
  const handleEntranceDetailsChange = (field, value) => {
    setFormData({
      ...formData,
      entranceAndWorkExperience: {
        ...formData.entranceAndWorkExperience,
        [field]: value,
      },
    });
  };

  // Handle scorecard file upload
  const handleScorecardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const scorecardUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        entranceAndWorkExperience: {
          ...formData.entranceAndWorkExperience,
          scorecard: scorecardUrl, // Store scorecard file URL for preview
          scorecardFile: file, // Store File object for submission
        },
      });
    }
  };

  // Render work experience table
  const renderWorkExperienceTable = () => {
    if (!formData.entranceAndWorkExperience.workExperience || formData.entranceAndWorkExperience.workExperience.length === 0) {
      return null;
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
                  <th>Certificate</th>
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
                      {exp.certificate ? (
                        <a href={exp.certificate} target="_blank" rel="noopener noreferrer">
                          View Certificate
                        </a>
                      ) : (
                        'No Certificate'
                      )}
                    </td>
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

      {/* Entrance Exam Details */}
      <fieldset className="border p-3 mb-4">
        <legend className="w-auto">Entrance Exam Details</legend>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Entrance Exam:</Form.Label>
              <Form.Control
                as="select"
                value={formData.entranceAndWorkExperience.entrance}
                onChange={(e) => handleEntranceDetailsChange('entrance', e.target.value)}
              >
                <option value="">Select Entrance Exam</option>
                <option value="TANCET">TANCET</option>
                <option value="GATE">GATE</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Registration Number:</Form.Label>
              <Form.Control
                type="text"
                value={formData.entranceAndWorkExperience.entranceRegister}
                onChange={(e) => handleEntranceDetailsChange('entranceRegister', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Score:</Form.Label>
              <Form.Control
                type="number"
                value={formData.entranceAndWorkExperience.entranceScore || ''}
                onChange={(e) => handleEntranceDetailsChange('entranceScore', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Year:</Form.Label>
              <Form.Control
                type="number"
                value={formData.entranceAndWorkExperience.entranceYear || ''}
                onChange={(e) => handleEntranceDetailsChange('entranceYear', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Scorecard:</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.png"
                ref={scorecardInputRef} // Attach ref to scorecard file input
                onChange={handleScorecardUpload}
              />
            </Form.Group>
          </Col>
          <Col md={12} className="mt-3">
            {formData.entranceAndWorkExperience.scorecard && (
              <a href={formData.entranceAndWorkExperience.scorecard} target="_blank" rel="noopener noreferrer">
                View Scorecard
              </a>
            )}
          </Col>
        </Row>
      </fieldset>

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
                accept=".pdf,.jpg,.png"
                ref={fileInputRef} // Attach ref to file input
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