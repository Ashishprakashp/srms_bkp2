import React, { useState } from 'react';
import axios from 'axios';
import Page1 from './Page1.js';
import Page2 from './Page2.js';
import Page3 from './Page3.js';
import Page4 from './Page4.js';
import Page5 from './Page5.js';

// import AdminTitleBar from './AdminTitleBar';
import { Container, Row, Col, Button, Nav } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
// import './styles/StudentForm.css'; // Keep this for any custom styles not covered by Bootstrap

const StudentForm = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const branch = sessionStorage.getItem('branch');

  const [formData, setFormData] = useState({
    personalInformation: {
      name: '',
      register: '',
      dob: null,
      sex: '',
      blood: 'B-',
      community: 'SC',
      cutoff: null,
      splcategory: 'None',
      scholarship: '',
      volunteer: 'None',
      contact: '',
      mail: '',
      fa: 'None',
      passportPhoto: '',
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

  const handleSubmit = async () => {
    console.log('Form Data: ', formData);
    try {
      const response = await axios.post('http://localhost:5000/student', { student: formData });
      console.log(response);
    } catch (error) {
      alert('Error saving student details: ' + error.message);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1 formData={formData} setFormData={setFormData} />;
      case 2:
        return <Page2 formData={formData} setFormData={setFormData} />;
      case 3:
        return <Page3 formData={formData} setFormData={setFormData} />;
        case 4:
          return <Page4 formData={formData} setFormData={setFormData} />;
          case 5:
            return <Page5 formData={formData} setFormData={setFormData} />;
          
      default:
        return <div>Invalid Page!</div>;
    }
  };

  return (
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1" > {/* Adjust for titlebar height */}
        <SideBar />
        
        <Container fluid className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
          {/* Page Navigation */}
          <Row className="mb-4">
            <Col>
              <Nav className="justify-content-center flex-wrap">
                {[1, 2, 3, 4, 5].map((page) => (
                  <Nav.Item key={page} className="mb-2">
                    <Button
                      variant={currentPage === page ? 'primary' : 'outline-primary'}
                      className="mx-1"
                      onClick={() => setCurrentPage(page)}
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
              
              {/* Submit Button - Show only on last page */}
              {currentPage === 5 && (
                <Row className="justify-content-center mt-4">
                  <Col className="text-center">
                    <Button variant="success" size="lg" onClick={handleSubmit}>
                      Submit Application
                    </Button>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default StudentForm;