import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Folder from './res/folder.png';
// import PassportPhotoUpload from './PassportPhotoUpload';

const Page1 = ({ formData, setFormData }) => {
  const [fileName, setFileName] = React.useState('');
  const branch = sessionStorage.getItem('branch');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Set the selected file name
    }
  };

  const handleChange = (section, field, value) => {
    // If it's year or percentage, convert to number
    if (field === 'year' || field === 'percentage' || field === 'cutoff') {
      value = parseFloat(value);
    } else if (field === 'dob') {
      // Convert date to timestamp (number)
      value = new Date(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Page 1: Personal Information</h2>

      {/* Passport Photo Upload
      <Row className="mb-4">
        <Col>
          <PassportPhotoUpload />
        </Col>
      </Row> */}

      {/* Name and Register Number */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type="text"
              value={formData.personalInformation.name}
              onChange={(e) => handleChange('personalInformation', 'name', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Register Number:</Form.Label>
            <Form.Control
              type="text"
              value={formData.personalInformation.register}
              onChange={(e) => handleChange('personalInformation', 'register', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Date of Birth and Sex */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Date of Birth:</Form.Label>
            <Form.Control
              type="date"
              value={formData.personalInformation.dob ? new Date(formData.personalInformation.dob).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('personalInformation', 'dob', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Sex:</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Male"
                name="sex"
                value="M"
                checked={formData.personalInformation.sex === 'M'}
                onChange={(e) => handleChange('personalInformation', 'sex', e.target.value)}
              />
              <Form.Check
                inline
                type="radio"
                label="Female"
                name="sex"
                value="F"
                checked={formData.personalInformation.sex === 'F'}
                onChange={(e) => handleChange('personalInformation', 'sex', e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Blood Group and Community */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Blood Group:</Form.Label>
            <Form.Select
              value={formData.personalInformation.blood}
              onChange={(e) => handleChange('personalInformation', 'blood', e.target.value)}
            >
              <option value="--">--</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Community:</Form.Label>
            <Form.Select
              value={formData.personalInformation.community}
              onChange={(e) => handleChange('personalInformation', 'community', e.target.value)}
            >
              <option value="--">--</option>
              <option value="OC">OC</option>
              <option value="BC">BC</option>
              <option value="MBC">MBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Cutoff Mark and Special Category */}
      <Row className="mb-3">
        {branch === 'Btech' && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Cutoff Mark:</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                step="0.001"
                value={formData.personalInformation.cutoff}
                onChange={(e) => handleChange('personalInformation', 'cutoff', e.target.value)}
              />
            </Form.Group>
          </Col>
        )}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Special Category:</Form.Label>
            <Form.Select
              value={formData.personalInformation.splcategory}
              onChange={(e) => handleChange('personalInformation', 'splcategory', e.target.value)}
            >
              <option value="None">None</option>
              <option value="Ph">Ph</option>
              <option value="Sports">Sports</option>
              <option value="Ex-Service man">Ex-Service man</option>
              <option value="NRI">NRI</option>
              <option value="Other States">Other States</option>
              <option value="Any Other">Any Other</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Scholarship and Volunteer */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Scholarship Received (if any):</Form.Label>
            <Form.Control
              type="text"
              value={formData.personalInformation.scholarship}
              onChange={(e) => handleChange('personalInformation', 'scholarship', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Volunteer In:</Form.Label>
            <Form.Select
              value={formData.personalInformation.volunteer}
              onChange={(e) => handleChange('personalInformation', 'volunteer', e.target.value)}
            >
              <option value="None">None</option>
              <option value="NSS">NSS</option>
              <option value="NSO">NSO</option>
              <option value="YRC">YRC</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Contact and Email */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Contact:</Form.Label>
            <Form.Control
              type="text"
              value={formData.personalInformation.contact}
              onChange={(e) => handleChange('personalInformation', 'contact', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              value={formData.personalInformation.mail}
              onChange={(e) => handleChange('personalInformation', 'mail', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Faculty Advisor */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Faculty Advisor:</Form.Label>
            <Form.Select
              value={formData.personalInformation.fa}
              onChange={(e) => handleChange('personalInformation', 'fa', e.target.value)}
            >
              <option value="None">None</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default Page1;