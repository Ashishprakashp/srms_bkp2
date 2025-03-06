import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Page1 from './Page1.js';
import Page2 from './Page2.js';
import Page3 from './Page3.js';
import Page4 from './Page4.js';
import Page5 from './Page5.js';
import { Container, Row, Col, Button, Nav, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import StudentSideBar from './StudentSideBar.js';
import { useNavigate } from 'react-router-dom';

const StudentForm = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formEnabled, setFormEnabled] = useState(false);
  const branch = sessionStorage.getItem('branch');
  const isBtech = branch === 'Btech';
  const totalPages = isBtech ? 4 : 5;

  const [formData, setFormData] = useState({
    personalInformation: {
      name: '',
      register: '',
      dob: null,
      sex: '',
      blood: '--',
      community: '--',
      cutoff: null,
      splcategory: 'None',
      scholarship: '',
      volunteer: 'None',
      contact: '',
      mail: '',
      fa: 'None',
      passportPhoto: '',
      mobile: '',
      personalEmail: '',
    },
    familyInformation: {
      fatherName: '',
      fatherOcc: '',
      fatherInc: null,
      motherName: '',
      motherOcc: '',
      motherInc: null,
      parentAddr: '',
      parentContact: '',
      parentMail: '',
      guardianAddr: '',
      guardianContact: '',
      guardianMail: '',
    },
    education: {
      ug: '',
      ugCollege: '',
      ugYear: null,
      ugPercentage: null,
      ugProvisionalCertificate: '',
      xiiBoard: '',
      xiiSchool: '',
      xiiYear: null,
      xiiPercentage: null,
      xiiMarksheet: '',
      xBoard: '',
      xSchool: '',
      xYear: null,
      xPercentage: null,
      xMarksheet: '',
    },
    entranceAndWorkExperience: {
      entrance: '',
      entranceRegister: '',
      entranceScore: null,
      entranceYear: null,
      scorecard: '',
      workExperience: [
        {
          employerName: '',
          role: '',
          expYears: null,
          certificate: '',
        },
      ],
    },
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });

        const { 
          studentId: fetchedStudentId, 
          branch, 
          regulation, 
          from_year, 
          to_year,
          can_fill 
        } = response.data;
        console.log(response.data);
        // Check if form submission is allowed
        setFormEnabled(can_fill === 1);

        // Pre-fill form data if allowed
        if (can_fill === 1) {
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
        }

      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [setFormData]);

  // Validation functions for each page
  const validatePage1 = (formData) => {
    const { personalInformation } = formData;
    return (
      personalInformation.register &&
      personalInformation.branch &&
      personalInformation.regulation &&
      personalInformation.batch &&
      personalInformation.dob &&
      personalInformation.sex &&
      personalInformation.blood !== '--' &&
      personalInformation.community !== '--' &&
      personalInformation.contact &&
      personalInformation.mail &&
      personalInformation.mobile &&
      personalInformation.personalEmail
    );
  };

  const validatePage2 = (formData) => {
    const { familyInformation } = formData;
    return (
      familyInformation.fatherName &&
      familyInformation.fatherOcc &&
      familyInformation.fatherInc !== null &&
      familyInformation.motherName &&
      familyInformation.motherOcc &&
      familyInformation.motherInc !== null &&
      familyInformation.parentAddr &&
      familyInformation.parentContact
    );
  };

  const validatePage3 = (formData) => {
    const { education } = formData;
    return (
      education.xSchool &&
      education.xBoard &&
      education.xYear !== null &&
      education.xPercentage !== null &&
      education.xiiSchool &&
      education.xiiBoard &&
      education.xiiYear !== null &&
      education.xiiPercentage !== null &&
      education.ugCollege &&
      education.ugYear !== null &&
      education.ugPercentage !== null
    );
  };

  const validatePage4 = (formData) => {
    // Page 4 is not mandatory, so always return true
    return true;
  };

  const validatePage5 = (formData) => {
    // Add validation logic for Page5 if needed
    return true; // Example: Assume no validation required for Page5
  };

  const validateCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return validatePage1(formData);
      case 2:
        return validatePage2(formData);
      case 3:
        return validatePage3(formData);
      case 4:
        return validatePage4(formData); // Page 4 is not mandatory
      case 5:
        return validatePage5(formData);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    console.log('Form Data: ', formData);
    try {
      const response = await axios.post('http://localhost:5000/student', { student: formData });
      console.log(response);
    } catch (error) {
      alert('Error saving student details: ' + error.message);
    }
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      alert('Please fill all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageNavigation = (page) => {
    if (page <= currentPage) {
      // Allow navigation to previous or current pages
      setCurrentPage(page);
    } else if (validateCurrentPage()) {
      // Allow navigation to next pages only if current page is valid
      setCurrentPage(page);
    } else {
      // Show alert if trying to navigate to a greater page without filling all details
      alert('Please fill all required fields before proceeding.');
    }
  };

  const renderPage = () => {
    if (isBtech && currentPage === 4) {
      return <Page5 formData={formData} setFormData={setFormData} />;
    }

    switch (currentPage) {
      case 1:
        return <Page1 formData={formData} setFormData={setFormData} />;
      case 2:
        return <Page2 formData={formData} setFormData={setFormData} />;
      case 3:
        return <Page3 formData={formData} setFormData={setFormData} />;
      case 4:
        return isBtech ? <Page5 formData={formData} setFormData={setFormData} /> : <Page4 formData={formData} setFormData={setFormData} />;
      case 5:
        return <Page5 formData={formData} setFormData={setFormData} />;
      default:
        return <div>Invalid Page!</div>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }



  return (
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1">
        <StudentSideBar />
        {formEnabled ?(
          <Container fluid className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
          {/* Page Navigation */}
          <Row className="mb-4">
            <Col>
              <Nav className="justify-content-center flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Nav.Item key={page} className="mb-2">
                    <Button
                      variant={currentPage === page ? 'primary' : 'outline-primary'}
                      className="mx-1"
                      onClick={() => handlePageNavigation(page)}
                    >
                      Page {page}
                    </Button>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
          </Row>

          {/* Form Content */}
          <Row className="justify-content-center">
            <Col xl={10} lg={12} md={12}>
              {renderPage()}

              {/* Navigation Buttons */}
              <Row className="justify-content-between mt-4">
                <Col className="text-start">
                  {currentPage > 1 && (
                    <Button variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                </Col>
                <Col className="text-end">
                  {currentPage < totalPages ? (
                    <Button variant="primary" onClick={handleNext}>
                      Next
                    </Button>
                  ) : (
                    <Button variant="success" onClick={handleSubmit}>
                      Submit Application
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>

        ):(
          <Container fluid className="p-4 d-flex align-items-center justify-content-center" 
            style={{ height: 'calc(100vh - 56px)' }}>
            <div className="text-center">
              <h2 className="mb-4">This process is closed now!</h2>
              <Button variant="primary" onClick={() => navigate('/student-dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </Container>

        )}
        
      </div>
    </div>
  );
};

export default StudentForm;