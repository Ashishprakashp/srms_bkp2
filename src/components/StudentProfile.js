import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Modal, Form, Table, Tab, Tabs } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentSideBar from './StudentSideBar.js';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSuggestions, setErrorSuggestions] = useState([]);
  const [errorExample, setErrorExample] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const studentId = sessionStorage.getItem('student');
      if (!studentId) {
        navigate('/student-login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setFetchError(null);

        // Verify session
        const authCheck = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true
        });

        if (!authCheck.data.authenticated) {
          navigate('/student-login', { replace: true });
          return;
        }

        // Fetch account details
        const accountResponse = await axios.get('http://localhost:5000/student/fetch-full', {
            params: { userId: studentId }
          });
  
          if (!accountResponse.data.success) {
            throw new Error('Failed to fetch account details');
          }
  
          setAccountDetails(accountResponse.data.student);
          sessionStorage.setItem('branch', accountResponse.data.student.branch);
        
        if (accountResponse.data.reset === 0) {
          setShowPasswordResetModal(true);
        }
        console.log("Hi");
        // Fetch personal details
        const personalResponse = await axios.get('http://localhost:5000/student-personal-details', {
          params: { registerNumber: studentId.toString() }
        });
        setPersonalDetails(personalResponse.data);

      } catch (error) {
        console.error('Fetch error:', error);
        setFetchError('Failed to load student data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePasswordReset = async () => {
    try {
      const studentId = sessionStorage.getItem('student');
      const response = await axios.post('http://localhost:5000/student/reset-password', {
        studentId,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setShowPasswordResetModal(false);
        resetPasswordState();
        window.location.reload();
      }
    } catch (error) {
      handlePasswordError(error);
    }
  };

  const handlePasswordError = (error) => {
    if (error.response) {
      setErrorMessage(error.response.data.message || 'Password reset failed');
      setErrorSuggestions(error.response.data.suggestions || []);
      setErrorExample(error.response.data.example || '');
    } else {
      setErrorMessage('Connection error. Please try again.');
      resetSuggestions();
    }
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordResetModal(false);
    resetPasswordState();
  };

  const resetPasswordState = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    resetSuggestions();
  };

  const resetSuggestions = () => {
    setErrorSuggestions([]);
    setErrorExample('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h4 className="text-danger mb-4">{fetchError}</h4>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <StudentSideBar onLogoutClick={() => setShowLogoutModal(true)} />

        <div className="flex-grow-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <h1>Welcome, {sessionStorage.getItem('student')}</h1>
          </div>

          {accountDetails && personalDetails ? (
            <Tabs defaultActiveKey="account" className="mb-3">
              {/* Account Details Tab */}
              <Tab eventKey="account" title="Account Details">
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <h5>Academic Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <tbody>
                        <tr>
                          <td><strong>Student ID</strong></td>
                          <td>{accountDetails.studentId}</td>
                        </tr>
                        <tr>
                          <td><strong>Name</strong></td>
                          <td>{accountDetails.name}</td>
                        </tr>
                        <tr>
                          <td><strong>Branch</strong></td>
                          <td>{accountDetails.branch}</td>
                        </tr>
                        <tr>
                          <td><strong>Regulation</strong></td>
                          <td>{accountDetails.regulation}</td>
                        </tr>
                        <tr>
                          <td><strong>Academic Years</strong></td>
                          <td>{accountDetails.from_year} - {accountDetails.to_year}</td>
                        </tr>
                        <tr>
                          <td><strong>Faculty Advisor</strong></td>
                          <td>{accountDetails.facultyAdvisor}</td>
                        </tr>
                        <tr>
                          <td><strong>Enrollment Status</strong></td>
                          <td>{accountDetails.can_enroll}</td>
                        </tr>
                        <tr>
                          <td><strong>Account Status</strong></td>
                          <td>
                            {accountDetails.approved ? 'Approved' : 'Pending'}
                            {accountDetails.refill === 1 && ' (Refill Requested)'}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Grades Status</strong></td>
                          <td>
                            {accountDetails.grades_approved === '3' 
                              ? 'Approved' 
                              : accountDetails.grades_filled === '0'
                              ? 'Not Submitted'
                              : 'Pending Approval'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              {/* Personal Details Tab */}
              <Tab eventKey="personal" title="Personal Details">
                {/* Personal Information Card */}
                <PersonalInfoCard data={personalDetails.personalInformation} />
                
                {/* Family Information Card */}
                <FamilyInfoCard data={personalDetails.familyInformation} />
                
                {/* Education Information Card */}
                <EducationInfoCard data={personalDetails.education} />
                
                {/* Entrance Details Card */}
                <EntranceInfoCard data={personalDetails.entranceAndWorkExperience} />
              </Tab>
            </Tabs>
          ) : (
            <div className="alert alert-warning">
              No student records found. Please contact administration.
            </div>
          )}

          {/* Logout Modal */}
          <LogoutModal 
            show={showLogoutModal} 
            onHide={() => setShowLogoutModal(false)} 
            onLogout={() => {
              axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
                .finally(() => {
                  navigate('/student-login');
                  window.location.reload();
                });
            }}
          />

          {/* Password Reset Modal */}
          <PasswordResetModal
            show={showPasswordResetModal}
            onHide={handleCancelPasswordReset}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            errorMessage={errorMessage}
            errorSuggestions={errorSuggestions}
            errorExample={errorExample}
            onPasswordChange={setNewPassword}
            onConfirmChange={setConfirmPassword}
            onReset={handlePasswordReset}
          />
        </div>
      </div>
    </>
  );
};

// Helper Components
const renderAccountRow = (label, value) => (
  <tr>
    <td><strong>{label}</strong></td>
    <td>{value}</td>
  </tr>
);

const PersonalInfoCard = ({ data }) => (
  <Card className="mb-4">
    <Card.Header className="bg-info text-white">
      <h5>Personal Information</h5>
    </Card.Header>
    <Card.Body>
      <Table striped bordered>
        <tbody>
          {renderDetailRow('Full Name', data.name)}
          {renderDetailRow('Date of Birth', new Date(data.dob).toLocaleDateString())}
          {renderDetailRow('Gender', data.sex)}
          {renderDetailRow('Blood Group', data.blood)}
          {renderDetailRow('Community', data.community)}
          {renderDetailRow('Email', data.mail)}
          {renderDetailRow('Contact', data.contact || 'N/A')}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

const FamilyInfoCard = ({ data }) => (
  <Card className="mb-4">
    <Card.Header className="bg-info text-white">
      <h5>Family Information</h5>
    </Card.Header>
    <Card.Body>
      <Table striped bordered>
        <tbody>
          {renderDetailRow("Father's Name", data.fatherName)}
          {renderDetailRow("Father's Occupation", data.fatherOcc)}
          {renderDetailRow("Father's Income", data.fatherInc)}
          {renderDetailRow("Mother's Name", data.motherName)}
          {renderDetailRow("Mother's Occupation", data.motherOcc)}
          {renderDetailRow("Mother's Income", data.motherInc)}
          {renderDetailRow("Parent's Address", data.parentAddr)}
          {renderDetailRow("Parent's Contact", data.parentContact)}
          {renderDetailRow("Parent's Email", data.parentMail)}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

const EducationInfoCard = ({ data }) => (
  <Card className="mb-4">
    <Card.Header className="bg-info text-white">
      <h5>Educational Background</h5>
    </Card.Header>
    <Card.Body>
      <Table striped bordered>
        <tbody>
          {renderDetailRow('UG Degree', data.ug || 'N/A')}
          {renderDetailRow('UG College', data.ugCollege)}
          {renderDetailRow('UG Percentage', data.ugPercentage)}
          {renderDetailRow('12th Board', data.xiiBoard)}
          {renderDetailRow('12th School', data.xiiSchool)}
          {renderDetailRow('12th Year', data.xiiYear)}
          {renderDetailRow('12th Percentage', data.xiiPercentage)}
          {renderDetailRow('10th Board', data.xBoard)}
          {renderDetailRow('10th School', data.xSchool)}
          {renderDetailRow('10th Year', data.xYear)}
          {renderDetailRow('10th Percentage', data.xPercentage)}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

const EntranceInfoCard = ({ data }) => (
  <Card className="mb-4">
    <Card.Header className="bg-info text-white">
      <h5>Entrance Details</h5>
    </Card.Header>
    <Card.Body>
      <Table striped bordered>
        <tbody>
          {renderDetailRow('Entrance Exam', data.entrance)}
          {renderDetailRow('Registration Number', data.entranceRegister)}
          {renderDetailRow('Entrance Score', data.entranceScore)}
          {renderDetailRow('Entrance Year', data.entranceYear)}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

const renderDetailRow = (label, value) => (
  <tr>
    <td className="w-25"><strong>{label}</strong></td>
    <td>{value || 'Not Available'}</td>
  </tr>
);

const LogoutModal = ({ show, onHide, onLogout }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Logout</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      <h5>Are you sure you want to logout?</h5>
    </Modal.Body>
    <Modal.Footer className="justify-content-center">
      <Button variant="secondary" onClick={onHide}>Cancel</Button>
      <Button variant="danger" onClick={onLogout}>Logout</Button>
    </Modal.Footer>
  </Modal>
);

const PasswordResetModal = ({ 
  show, 
  onHide,
  newPassword,
  confirmPassword,
  errorMessage,
  errorSuggestions,
  errorExample,
  onPasswordChange,
  onConfirmChange,
  onReset
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Password Reset</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter new password"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmChange(e.target.value)}
            placeholder="Confirm new password"
          />
        </Form.Group>
        {errorMessage && (
          <div className="alert alert-danger">
            <p>{errorMessage}</p>
            {errorSuggestions.length > 0 && (
              <ul className="mb-1">
                {errorSuggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            )}
            {errorExample && <small className="text-muted">Example: {errorExample}</small>}
          </div>
        )}
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Cancel</Button>
      <Button variant="primary" onClick={onReset}>Reset Password</Button>
    </Modal.Footer>
  </Modal>
);

export default StudentProfile;