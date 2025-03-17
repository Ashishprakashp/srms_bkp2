import React, { useState, useRef, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Page3 = ({ formData, setFormData }) => {
  const branch = sessionStorage.getItem('branch');
  const [showOtherXBoard, setShowOtherXBoard] = useState(false);
  const [showOtherXiiBoard, setShowOtherXiiBoard] = useState(false);

  const xMarksheetInputRef = useRef(null);
  const xiiMarksheetInputRef = useRef(null);
  const ugCertificateInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (formData.education.xMarksheet?.url) {
        URL.revokeObjectURL(formData.education.xMarksheet.url);
      }
      if (formData.education.xiiMarksheet?.url) {
        URL.revokeObjectURL(formData.education.xiiMarksheet.url);
      }
      if (formData.education.ugProvisionalCertificate?.url) {
        URL.revokeObjectURL(formData.education.ugProvisionalCertificate.url);
      }
    };
  }, [formData.education]);

  const handleChange = (section, field, value) => {
    if (['xYear', 'xPercentage', 'xiiYear', 'xiiPercentage', 'ugYear', 'ugPercentage'].includes(field)) {
      value = value === '' ? '' : parseFloat(value);
    }

    if (field === 'xBoard') {
      setShowOtherXBoard(value === 'Other');
    }
    if (field === 'xiiBoard') {
      setShowOtherXiiBoard(value === 'Other');
    }

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;

    // Clean up previous Blob URL
    if (formData.education[field]?.url) {
      URL.revokeObjectURL(formData.education[field].url);
    }

    // Create a new Blob URL for preview
    const url = URL.createObjectURL(file);

    // Update form data with both the file and the URL
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [field]:url,
        [`${field}File`]: file 
        
      }
    });
    
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
              value={formData.education.xSchool || ''}
              onChange={(e) => handleChange('education', 'xSchool', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Board:</Form.Label>
            <Form.Select
              value={formData.education.xBoard || '---'}
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
              value={formData.education.xPercentage || ''}
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
              max={new Date().getFullYear()}
              value={formData.education.xYear || ''}
              onChange={(e) => handleChange('education', 'xYear', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Marksheet:</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.png"
              ref={xMarksheetInputRef}
              onChange={(e) => handleFileUpload('xMarksheet', e.target.files[0])}
            />
          </Form.Group>
        </Col>
        <Col md={12} className="mt-3">
          {formData.education.xMarksheet && (
            <div>
              <a href={`http://localhost:5000/${formData.education.xMarksheet}`} target="_blank" rel="noopener noreferrer" className="me-3">
                View X Marksheet
              </a>
              <span className="text-muted">{formData.education.xMarksheet.name}</span>
            </div>
          )}
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
              value={formData.education.xiiSchool || ''}
              onChange={(e) => handleChange('education', 'xiiSchool', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Board:</Form.Label>
            <Form.Select
              value={formData.education.xiiBoard || '---'}
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
              value={formData.education.xiiPercentage || ''}
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
              max={new Date().getFullYear()}
              value={formData.education.xiiYear || ''}
              onChange={(e) => handleChange('education', 'xiiYear', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Marksheet:</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.png"
              ref={xiiMarksheetInputRef}
              onChange={(e) => handleFileUpload('xiiMarksheet', e.target.files[0])}
            />
          </Form.Group>
        </Col>
        <Col md={12} className="mt-3">
          {formData.education.xiiMarksheet && (
            <div>
              <a href={`http://localhost:5000/${formData.education.xiiMarksheet}`} target="_blank" rel="noopener noreferrer" className="me-3">
                View XII Marksheet
              </a>
              <span className="text-muted">{formData.education.xiiMarksheet.name}</span>
            </div>
          )}
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
              value={formData.education.ugCollege || ''}
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
              value={formData.education.ugPercentage || ''}
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
              max={new Date().getFullYear()}
              value={formData.education.ugYear || ''}
              onChange={(e) => handleChange('education', 'ugYear', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Provisional Certificate:</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.png"
              ref={ugCertificateInputRef}
              onChange={(e) => handleFileUpload('ugProvisionalCertificate', e.target.files[0])}
            />
          </Form.Group>
        </Col>
        <Col md={12} className="mt-3">
          {formData.education.ugProvisionalCertificate && (
            <div>
              <a href={`http://localhost:5000/${formData.education.ugProvisionalCertificate}`} target="_blank" rel="noopener noreferrer" className="me-3">
                View UG Provisional Certificate
              </a>
              <span className="text-muted">{formData.education.ugProvisionalCertificate.name}</span>
            </div>
          )}
        </Col>
      </Row>
    </fieldset>
  );

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 3: Educational Details</h2>
      {renderTenthDetails()}
      {renderTwelfthDetails()}
      {branch !== 'Btech' && renderDiplomaDetails()}
    </div>
  );
};

export default Page3;