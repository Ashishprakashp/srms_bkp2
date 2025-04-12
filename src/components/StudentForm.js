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
  const isBtech = branch.startsWith('BTECH'); // Check if branch starts with BTECH
  const totalPages = isBtech ? 4 : 5; // Skip Page 4 for BTECH students

  const [formData, setFormData] = useState({
    personalInformation: {
      name: '',
      register: '',
      aadhar:'',
      aadharFile:null,
      aadharFileUrl: "",
      student_type:'',
      hostel:'',
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
      passportPhotoFile: null, // Added to store the file object
      mobile: '',
      countryCode:'',
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
      ugProvisionalCertificateFile: null, // Added to store the file object
      xiiBoard: '',
      xiiSchool: '',
      xiiYear: null,
      xiiPercentage: null,
      xiiMarksheet: '',
      xiiMarksheetFile: null, // Added to store the file object
      xBoard: '',
      xSchool: '',
      xYear: null,
      xPercentage: null,
      xMarksheet: '',
      xMarksheetFile: null, // Added to store the file object
    },
    entranceAndWorkExperience: {
      entrance: '',
      entranceRegister: '',
      entranceScore: null,
      entranceYear: null,
      scorecard: '',
      scorecardFile: null, // Added to store the file object
      workExperience: [],
    },
    acceptance: false,
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });
        console.log(response.data);
        const { 
          studentId: fetchedStudentId, 
          name,
          branch, 
          regulation, 
          from_year, 
          to_year,
          can_fill ,
          facultyAdvisor
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
              name,
              branch,
              regulation,
              batch: `${from_year}-${to_year}`,
              fa:facultyAdvisor
            },
          }));
        }

        const response2 = await axios.get(`http://localhost:5000/students-details/${studentId}`, {
          withCredentials: true,
        });
        console.log("Existing student details: "+JSON.stringify(response2));
        setFormData((prevData) => ({
          ...prevData,
          ...response2.data, // Merge response2.data into formData
        }));
        console.log("ug certificate:");
        console.log(`http://localhost:5000${response2.data.education.ugProvisionalCertificate}`);
        
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
        
      }
    };

    fetchStudentDetails();
  }, [setFormData]);
  console.log(formData);
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
      personalInformation.mail &&
      personalInformation.mobile &&
      personalInformation.passportPhoto
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
      education.ugPercentage !== null &&
      education.ugProvisionalCertificate &&
      education.xMarksheet &&
      education.xiiMarksheet
    );
  };

  const validatePage4 = (formData) => {
    const { entranceAndWorkExperience } = formData;
    // Page 4 is not mandatory for BTECH students
    if (isBtech) return true; // Skip validation for BTECH students
    // Add validation logic for non-BTECH students if needed
    return entranceAndWorkExperience.scorecard; // Example: Assume no validation required for Page4
  };

  const validatePage5 = (formData) => {
    // Ensure the acceptance checkbox is checked
    return formData.acceptance === true;
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
        return isBtech ? true : validatePage4(formData); // Skip validation for BTECH students
      case 5:
        return validatePage5(formData);
      default:
        return false;
    }
  };



  const handleSubmit = async () => {
    if (!validatePage5(formData)) {
      alert('You must accept the declaration by checking the checkbox before submitting the application.');
      return;
    }
  
    const formDataToSend = new FormData();
  
    // Append all files
    const appendFile = (fieldName, file) => {
      if (file instanceof File) {
        formDataToSend.append(fieldName, file);
      }
    };
    console.log(formData);
    // Append files from personal information
    appendFile('passportPhoto', formData.personalInformation.passportPhotoFile);
  
    // Append files from education
    appendFile('xMarksheet', formData.education.xMarksheetFile);
    appendFile('xiiMarksheet', formData.education.xiiMarksheetFile);
    appendFile('ugProvisionalCertificate', formData.education.ugProvisionalCertificateFile);
  
    // Append files from entranceAndWorkExperience
    appendFile('scorecard', formData.entranceAndWorkExperience.scorecardFile);
    formData.entranceAndWorkExperience.workExperience.forEach((exp, index) => {
      appendFile(`certificates`, exp.certificateFile);
    });
  
    // Append other form data
    formDataToSend.append('data', JSON.stringify(formData));
    
    console.log("Hi");
    console.log(formData);
    // Debug FormData
    for (const [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await axios.post('http://localhost:5000/student', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response);
      alert('Application submitted successfully!');
      window.location.reload();
      // navigate("/student-dashboard");
    } catch (error) {
      alert('Error saving student details: ' + error.message);
    }
  };

  const savePageData = async () => {
    let pageData = {};
  
    // Extract data for the current page
    switch (currentPage) {
      case 1:
        pageData = { personalInformation: formData.personalInformation ,
          fields: {
            branch: formData.personalInformation.branch,
            regulation: formData.personalInformation.regulation,
            batch: formData.personalInformation.batch,
            register: formData.personalInformation.register,
          },
        };
        break;
      case 2:
        pageData = {
          familyInformation: formData.familyInformation,
          fields: {
            branch: formData.personalInformation.branch,
            regulation: formData.personalInformation.regulation,
            batch: formData.personalInformation.batch,
            register: formData.personalInformation.register,
          },
        };
        break;
      case 3:
        pageData = {
          education: formData.education,
          fields: {
            branch: formData.personalInformation.branch,
            regulation: formData.personalInformation.regulation,
            batch: formData.personalInformation.batch,
            register: formData.personalInformation.register,
          },
        };
        break;
      case 4:
        pageData = {
          entranceAndWorkExperience: formData.entranceAndWorkExperience,
          fields: {
            branch: formData.personalInformation.branch,
            regulation: formData.personalInformation.regulation,
            batch: formData.personalInformation.batch,
            register: formData.personalInformation.register,
          },
        };
        break;
      case 5:
        pageData = {
          acceptance: formData.acceptance,
          fields: {
            branch: formData.personalInformation.branch,
            regulation: formData.personalInformation.regulation,
            batch: formData.personalInformation.batch,
            register: formData.personalInformation.register,
          },
        };
        break;
      default:
        break;
    }
  
  
    // Prepare FormData for file uploads
    const formDataToSend = new FormData();
  
    // Append files if they exist
    const appendFile = (fieldName, file) => {
      if (file instanceof File) {
        formDataToSend.append(fieldName, file);
      }
    };
  
    // Append files based on the current page
    switch (currentPage) {
      case 1:
        appendFile('passportPhoto', formData.personalInformation.passportPhotoFile);
        appendFile('aadharFile', formData.personalInformation.aadharFile);
        break;
      case 3:
        appendFile('xMarksheet', formData.education.xMarksheetFile);
        appendFile('xiiMarksheet', formData.education.xiiMarksheetFile);
        appendFile('ugProvisionalCertificate', formData.education.ugProvisionalCertificateFile);
        break;
      case 4:
        appendFile('scorecard', formData.entranceAndWorkExperience.scorecardFile);
        formData.entranceAndWorkExperience.workExperience.forEach((exp, index) => {
          appendFile(`certificates`, exp.certificateFile);
        });
        break;
      default:
        break;
    }
  
    // Append the page data as JSON
    formDataToSend.append('data', JSON.stringify(pageData));
  
    try {
      console.log(formDataToSend);
      const response = await axios.post('http://localhost:5000/save-page-data', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      if (response.status === 200) {
        alert('Page data saved successfully!');
      } else {
        alert('Failed to save page data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving page data:', error);
      alert('An error occurred while saving page data. Please try again.');
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

  const handleImageUpload = (event, setFormData) => {
    const file = event.target.files[0]; // Get the first file from the input

    if (file && file instanceof File) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = URL.createObjectURL(file); // Create a URL for the file

        // Update the form data with the new file and its URL
        setFormData((prevData) => ({
          ...prevData,
          personalInformation: {
            ...prevData.personalInformation,
            passportPhoto: imageUrl,
            passportPhotoFile: file, // Store the file object for later use
          },
        }));
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      console.error('Invalid file selected');
    }
  };

  const renderPage = () => {
    if (isBtech && currentPage === 4) {
      return <Page5 formData={formData} setFormData={setFormData} />; // Skip Page 4 for BTECH students
    }

    switch (currentPage) {
      case 1:
        return <Page1 formData={formData} setFormData={setFormData} handleImageUpload={handleImageUpload} />;
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

  const calculateCompletionPercentage = () => {
    let completedFields = 0;
    let totalFields = 0;
  
    // Page 1 validation
    const { personalInformation } = formData;
    const page1Fields = [
      personalInformation.aadhar.length==12,
      personalInformation.aadharFile,
      personalInformation.register,
      personalInformation.branch,
      personalInformation.regulation,
      personalInformation.batch,
      personalInformation.dob,
      personalInformation.sex,
      personalInformation.blood !== '--',
      personalInformation.community !== '--',
      personalInformation.mail,
      personalInformation.mobile.length ==10,
      personalInformation.passportPhoto,
      // personalInformation.countryCode
    ];
    completedFields += page1Fields.filter(Boolean).length;
    totalFields += page1Fields.length;
  
    // Page 2 validation
    const { familyInformation } = formData;
    const page2Fields = [
      familyInformation.fatherName,
      familyInformation.fatherOcc,
      familyInformation.fatherInc ,
      familyInformation.motherName,
      familyInformation.motherOcc,
      familyInformation.motherInc ,
      familyInformation.parentAddr,
      familyInformation.parentContact,
      familyInformation.parentMail,
    ];
    completedFields += page2Fields.filter(Boolean).length;
    totalFields += page2Fields.length;
  
    // Page 3 validation
    const { education } = formData;
    const page3Fields = [
      education.xSchool,
      education.xBoard!== '',
      education.xYear,
      education.xPercentage,
      education.xiiSchool,
      education.xiiBoard!== '',
      education.xiiYear,
      education.xiiPercentage ,
      education.ugCollege,
      education.ugYear ,
      education.ugPercentage ,
      education.ugProvisionalCertificate,
      education.xMarksheet,
      education.xiiMarksheet
    ];
    completedFields += page3Fields.filter(Boolean).length;
    totalFields += page3Fields.length;
  
    // Page 4 validation (only for non-BTECH)
    if (!isBtech) {
      const { entranceAndWorkExperience } = formData;
      
      const page4Fields = [
        entranceAndWorkExperience.scorecard,
        entranceAndWorkExperience.entrance,
        entranceAndWorkExperience.entranceRegister,
        entranceAndWorkExperience.entranceScore,
        entranceAndWorkExperience.entranceYear,
      ];
      completedFields += page4Fields.filter(Boolean).length;
      totalFields += page4Fields.length;
    }
  
    // Page 5 validation
    const page5Fields = [formData.acceptance];
    completedFields += page5Fields.filter(Boolean).length;
    totalFields += page5Fields.length;
  
    return Math.round((completedFields / totalFields) * 100);
  };

  

  return (
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1">
        <StudentSideBar />
        {formEnabled ? (
          <Container fluid className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
            <div className="d-flex justify-content-end mb-3 me-3">
                        <Button onClick={() => navigate('/student-dashboard')} className='fs-5 fw-bold'>
                          Back
                        </Button>
                      </div>
            {/* Page Navigation */}
            <Row className="mb-4">
              <Col>
                <Nav className="justify-content-center flex-wrap">
                  {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Nav.Item key={page} className="mb-2">
                      <Button
                        variant={currentPage === page ? 'primary' : 'outline-primary'}
                        className="mx-1"
                        onClick={() => handlePageNavigation(page)}
                      >
                        Page {page}
                      </Button>
                    </Nav.Item>
                  ))} */}
                  <Nav.Item className="mb-2">
  <Button
    variant={currentPage === 1 ? 'primary' : 'outline-primary'}
    className="mx-1"
    onClick={() => handlePageNavigation(1)}
  >
    Personal details
  </Button>
</Nav.Item>

<Nav.Item className="mb-2">
  <Button
    variant={currentPage === 2 ? 'primary' : 'outline-primary'}
    className="mx-1"
    onClick={() => handlePageNavigation(2)}
  >
    Parent's details
  </Button>
</Nav.Item>

<Nav.Item className="mb-2">
  <Button
    variant={currentPage === 3 ? 'primary' : 'outline-primary'}
    className="mx-1"
    onClick={() => handlePageNavigation(3)}
  >
    Education details
  </Button>
</Nav.Item>

<Nav.Item className="mb-2">
  <Button
    variant={currentPage === 4 ? 'primary' : 'outline-primary'}
    className="mx-1"
    onClick={() => handlePageNavigation(4)}
  >
    Entrance & Experience
  </Button>
</Nav.Item>

<Nav.Item className="mb-2">
  <Button
    variant={currentPage === 5 ? 'primary' : 'outline-primary'}
    className="mx-1"
    onClick={() => handlePageNavigation(5)}
  >
    Acceptance
  </Button>
</Nav.Item>

                </Nav>
              </Col>
            </Row>
            {/* Progress Bar */}
<Row className="mb-4">
  <Col>
    <div className="progress" style={{ height: '25px' }}>
      <div
        className="progress-bar progress-bar-striped progress-bar-animated  fw-bold fs-5"
        role="progressbar"
        style={{ width: `${calculateCompletionPercentage()}%` }}
        aria-valuenow={calculateCompletionPercentage()}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {calculateCompletionPercentage()}% Complete
      </div>
    </div>
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
                      <>
                      <Button className="me-5" onClick={savePageData}>
  Save
</Button>
                      <Button variant="primary" onClick={handleNext}>
                        Next
                      </Button>
                      
                      </>
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
        ) : (
          <Container fluid className="p-4 d-flex align-items-center justify-content-center"
            style={{ height: 'calc(100vh - 56px)' }}>
            <div className="text-center">
              <h2 className="mb-4 fw-bold">This process is closed now!</h2>
              <Button variant="primary" className='fw-bold fs-5' onClick={() => navigate('/student-dashboard')}>
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