import React, { useEffect } from 'react';
import { Form, Row, Col, Container } from 'react-bootstrap';
import PassportPhotoUpload from './PassportPhotoUpload.js';
import axios from 'axios';

const Page1 = ({ formData, setFormData }) => {
  const branch = sessionStorage.getItem('branch');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });

        const { studentId: fetchedStudentId, branch, regulation, from_year, to_year } = response.data;

        setFormData((prevData) => ({
          ...prevData,
          personalInformation: {
            ...prevData.personalInformation,
            register: fetchedStudentId,
            branch,
            regulation,
            batch: `${from_year}-${to_year}`,
          },
        }));
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, [setFormData]);

  const handleChange = (section, field, value) => {
    if (field === 'year' || field === 'percentage' || field === 'cutoff') {
      value = parseFloat(value);
    } else if (field === 'dob') {
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
    <Container fluid className="p-4">
      {/* Top Section - Personal Info + Photo Upload */}
      <Row>
        {/* Left Column - Personal Information */}
        <Col md={8}>
          <h2 className="mb-4">Page 1: Personal Information</h2>
          <Row className="mb-5">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Register Number:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.register || ''}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Branch:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.branch || ''}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Regulation:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.regulation || ''}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Batch:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.batch || ''}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>

        {/* Right Column - Photo Upload */}
        <Col md={4} className="d-flex justify-content-end">
          <PassportPhotoUpload />
        </Col>
      </Row>

      {/* Full-width Form Sections Below */}
      <Row>
        <Col md={12}>
          {/* Date of Birth, Sex, and Blood Group */}
          <Row className="mb-5">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Date of Birth</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={formData.personalInformation.dob ? new Date(formData.personalInformation.dob).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('personalInformation', 'dob', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Sex</Form.Label>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Blood Group</Form.Label>
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
          </Row>

          {/* Community, Cutoff Mark, and Special Category */}
          <Row className="mb-5">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Community</Form.Label>
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
            {branch === 'Btech' && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: 'black' }}>Cutoff Mark</Form.Label>
                  <Form.Control
                    size="sm"
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
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Special Category</Form.Label>
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

          {/* Scholarship, Volunteer, and Contact */}
          <Row className="mb-5">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Scholarship Received (if any)</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.scholarship}
                  onChange={(e) => handleChange('personalInformation', 'scholarship', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Volunteer In</Form.Label>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Contact</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.personalInformation.contact}
                  onChange={(e) => handleChange('personalInformation', 'contact', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Email and Faculty Advisor */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Email</Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  value={formData.personalInformation.mail}
                  onChange={(e) => handleChange('personalInformation', 'mail', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: 'black' }}>Faculty Advisor</Form.Label>
                <Form.Select
                  value={formData.personalInformation.fa}
                  onChange={(e) => handleChange('personalInformation', 'fa', e.target.value)}
                >
                  <option value="None">None</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Page1;