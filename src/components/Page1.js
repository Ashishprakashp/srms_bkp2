  import React, { useEffect ,useRef} from 'react';
  import { Form, Row, Col, Container } from 'react-bootstrap';
  import PassportPhotoUpload from './PassportPhotoUpload.js';
  import axios from 'axios';

  const Page1 = ({ formData, setFormData }) => {
    const aadharInputRef = useRef(null);
    const branch = sessionStorage.getItem('branch');

    useEffect(() => {
      const fetchStudentDetails = async () => {
        try {
          const studentId = sessionStorage.getItem('student');
          const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
            withCredentials: true,
          });

          const { studentId: fetchedStudentId, branch, regulation, from_year, to_year, facultyAdvisor } = response.data;

          setFormData((prevData) => ({
            ...prevData,
            personalInformation: {
              ...prevData.personalInformation,
              register: fetchedStudentId,
              branch,
              regulation,
              batch: `${from_year}-${to_year}`,
              facultyAdvisor: `${facultyAdvisor}`,
            },
          }));
        } catch (error) {
          console.error('Error fetching student details:', error);
        }
      };

      fetchStudentDetails();
    }, [setFormData]);

    const handleFileUpload = (field, file) => {
      if (!file) return;
  
      // Clean up previous Blob URL
      if (formData.education[field]?.url) {
        URL.revokeObjectURL(formData.education[field].url);
      }
  
      // Create a new Blob URL for preview
      const url = URL.createObjectURL(file);
      console.log("File: "+file.name);
      // Update form data with both the file and the URL
      setFormData({
        ...formData,
        personalInformation: {
          ...formData.personalInformation,
          aadhar:url,
          //aadharFile: file 
          
        }
      });
      
    };

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

    // Handle image upload
    const handleImageUpload = (file) => {
      if (file instanceof File) {
        const imageUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          personalInformation: {
            ...prev.personalInformation,
            passportPhoto: imageUrl,
            passportPhotoFile: file // Store the actual File object
          }
        }));
      }
    };

    const handleFileChange = (field, file) => {
      if (!file) return;
  
      // Clean up previous Blob URL
      if (formData.personalInformation[field]?.url) {
        URL.revokeObjectURL(formData.personalInformation[field].url);
      }
  
      // Create a new Blob URL for preview
      const url = URL.createObjectURL(file);
  
      // Update form data with both the file and the URL
      setFormData({
        ...formData,
        personalInformation: {
          ...formData.personalInformation,
          [field]:url,
          [`${field}File`]: file 
          
        }
      });
      
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
            <PassportPhotoUpload
              onImageUpload={handleImageUpload} // Pass the handler to update formData
              uploadedImage={`http://localhost:5000/${formData.personalInformation.passportPhoto}`} // Pass the stored image
              path={formData.personalInformation.passportPhoto}
            />
          </Col>
        </Row>

        <Row>
        <Col md={4} className='mb-4'>
                <Form.Group>
                  <Form.Label style={{ color: 'black' }}>Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={formData.personalInformation.name|| ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
<Form.Group>
  {/* Aadhar Number Field */}
  <Form.Label style={{ color: 'black' }}>Aadhar Number</Form.Label>
  <Form.Control
    size="sm"
    type="number"
    value={formData.personalInformation.aadhar_no || ''}
    onChange={(e) => {
      const value = e.target.value;
      // Restrict input to 10 digits
      if (value.length <= 12) {
        handleFileChange('aadhar', value);
      }
    }}
    isInvalid={formData.personalInformation.aadhar_no && formData.personalInformation.aadhar_no.length !== 12}
  />
  {/* Display error message if the number is not 10 digits */}
  {formData.personalInformation.mobile && formData.personalInformation.mobile.length !== 12 && (
    <Form.Control.Feedback type="invalid">
      Please enter a 12-digit mobile number.
    </Form.Control.Feedback>
  )}
</Form.Group>

</Col>
<Col md={4}>
          <Form.Group>
            <Form.Label>Aadhar:</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf"
              ref={aadharInputRef}
              onChange={(e) => handleFileUpload('aadharFile', e.target.files[0])}
            />
          </Form.Group>
        </Col>
        <Col md={12} className="mt-3">
          {formData.personalInformation.aadharFile && (
            <div>
              <a href={`http://localhost:5000/${formData.personalInformation.aadharFile}`} target="_blank" rel="noopener noreferrer" className="me-3">
                View Aadhar
              </a>
              <span className="text-muted">{formData.personalInformation.aadharFile.name}</span>
            </div>
          )}
        </Col>
        </Row>

        {/*personal contact details*/ }
        <Row className="mb-5">
        <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ color: 'black' }}>Faculty Advisor</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={formData.personalInformation.facultyAdvisor|| ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
      <Col md={1}>
      <Form.Group>
  {/* Country Code Field */}
  <Form.Label style={{ color: 'black' }}>Code</Form.Label>
  <Form.Control
    size="sm"
    type="text"
    value={formData.personalInformation.countryCode || ''}
    onChange={(e) => {
      const value = e.target.value;
      // Allow only '+' followed by up to 2 numbers
      const sanitizedValue = value
        .replace(/[^0-9+]/g, '') // Remove invalid characters
        .replace(/^(\+)?(\d{0,2}).*$/, '$1$2'); // Enforce format: + followed by up to 2 digits
      handleChange('personalInformation', 'countryCode', sanitizedValue);
    }}
    isInvalid={
      formData.personalInformation.countryCode &&
      !/^\+\d{2}$/.test(formData.personalInformation.countryCode)
    }
    placeholder="+91"
  />
  {/* Display error message if the format is incorrect */}
  {formData.personalInformation.countryCode &&
    !/^\+\d{2}$/.test(formData.personalInformation.countryCode) && (
      <Form.Control.Feedback type="invalid">
        Please enter a valid country code in the format: +XX (e.g., +91).
      </Form.Control.Feedback>
    )}
</Form.Group>
</Col>
<Col md={4}>
<Form.Group>
  {/* Mobile Number Field */}
  <Form.Label style={{ color: 'black' }}>Student Mobile Number</Form.Label>
  <Form.Control
    size="sm"
    type="number"
    value={formData.personalInformation.mobile || ''}
    onChange={(e) => {
      const value = e.target.value;
      // Restrict input to 10 digits
      if (value.length <= 10) {
        handleChange('personalInformation', 'mobile', value);
      }
    }}
    isInvalid={formData.personalInformation.mobile && formData.personalInformation.mobile.length !== 10}
  />
  {/* Display error message if the number is not 10 digits */}
  {formData.personalInformation.mobile && formData.personalInformation.mobile.length !== 10 && (
    <Form.Control.Feedback type="invalid">
      Please enter a 10-digit mobile number.
    </Form.Control.Feedback>
  )}
</Form.Group>
</Col>
      <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: 'black' }}>Student Personal Email</Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    value={formData.personalInformation.mail}
                    onChange={(e) => handleChange('personalInformation', 'mail', e.target.value)}
                  />
                </Form.Group>
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
                  <Form.Label style={{ color: 'black' }}>Student type</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Day Scholar"
                      name="Day Scholar"
                      value="Day Scholar"
                      checked={formData.personalInformation.student_type === 'Day Scholar'}
                      onChange={(e) => handleChange('personalInformation', 'student_type', e.target.value)}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Hosteller"
                      name="Hosteller"
                      value="Hosteller"
                      checked={formData.personalInformation.student_type === 'Hosteller'}
                      onChange={(e) => handleChange('personalInformation', 'student_type', e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
              {formData.personalInformation.student_type === 'Hosteller' && (
  <Col md={4}>
    <Form.Group>
      <Form.Label style={{ color: 'black' }}>Hostel</Form.Label>
      <Form.Select
        value={formData.personalInformation.hostel}
        onChange={(e) => handleChange('personalInformation', 'hostel', e.target.value)}
      >
        <option value="--" defaultChecked>--</option>
        {formData.personalInformation.sex === 'M' ? (
          <>
            <option value="BH1">BH1</option>
            <option value="BH2">BH2</option>
            <option value="BH3">BH3</option>
            <option value="BH4">BH4</option>
            <option value="BH5">BH5</option>
          </>
        ) : formData.personalInformation.sex === 'F' ? (
          <>
            <option value="GH1">GH1</option>
            <option value="GH2">GH2</option>
            <option value="GH3">GH3</option>
            <option value="GH4">GH4</option>
            <option value="GH5">GH5</option>
          </>
        ) : null}
      </Form.Select>
    </Form.Group>
  </Col>
)}

            
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

              
              
            </Row>

            {/* Scholarship, Volunteer, and Contact */}
            <Row className="mb-5">
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
              
            </Row>

            {/* Email and Faculty Advisor */}
            <Row className="mb-3">
              
              
            </Row>
          </Col>
        </Row>
        </Container>
    );
  };

  export default Page1;