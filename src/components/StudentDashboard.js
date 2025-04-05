import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner, Modal, Form } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentSideBar from './StudentSideBar.js';

const StudentDashboard = ({ services }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSuggestions, setErrorSuggestions] = useState([]);
  const [errorExample, setErrorExample] = useState('');

  // Fetch account status and check if password is reset
  const fetchAccountStatus = async () => {
    const studentId = sessionStorage.getItem('student');
    try {
      const response = await axios.get('http://localhost:5000/student/fetch', {
        params: { userId: studentId },
      });
      sessionStorage.setItem('branch', response.data.branch);
      setIsPasswordReset(response.data.reset !== 0);
      if (response.data.reset === 0) {
        setShowPasswordResetModal(true);
      }
    } catch (error) {
      console.error('Error fetching account status:', error);
    }
  };

  // Session verification useEffect
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true,
        });
        
        if (response.data.authenticated) {
          fetchAccountStatus();
        } else {
          navigate('/student-login', { replace: true });
        }
      } catch (error) {
        navigate('/student-login', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [navigate]);

  // Password reset handlers
  const handlePasswordReset = async () => {
    try {
      const studentId = sessionStorage.getItem('student');
      const response = await axios.post('http://localhost:5000/student/reset-password', {
        studentId,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setIsPasswordReset(true);
        setShowPasswordResetModal(false);
        resetPasswordState();
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Password reset failed');
        setErrorSuggestions(error.response.data.suggestions || []);
        setErrorExample(error.response.data.example || '');
      } else {
        setErrorMessage('An error occurred. Please try again.');
        resetSuggestions();
      }
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

  // Service click handler
  const handleServiceClick = (serviceTitle) => {
    const routes = {
      'Student Details': '/student-form',
      'Semester Grades Upload': '/student-dashboard/semforms',
      'Reset Credentials': '/reset-credentials',
      'Semester Enrollment': '/semester-enroll'
    };
    if (routes[serviceTitle]) navigate(routes[serviceTitle]);
  };

  // Loading state
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
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <StudentSideBar onLogoutClick={() => setShowLogoutModal(true)} />

        <div className="main-content-ad-dboard flex-grow-1">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Welcome {sessionStorage.getItem('student')}</h1>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content p-5">
                  <h3 className="text-center">Confirm Logout?</h3>
                  <div className="modal-buttons mt-5" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="secondary" className="fs-5 px-5" onClick={() => setShowLogoutModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" className="fs-5 px-5" onClick={() => {
                      axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
                        .finally(() => {
                          navigate('/student-login', { replace: true });
                          window.location.reload();
                        });
                    }}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordResetModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content p-5">
                  <h3 className="text-center mb-4">Reset Password</h3>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                    </Form.Group>

                    {errorMessage && (
                      <div className="text-center text-danger mb-3">
                        <div>{errorMessage}</div>
                        {errorSuggestions.length > 0 && (
                          <div className="mt-2 text-start">
                            <small>Requirements:</small>
                            <ul className="list-unstyled ms-3">
                              {errorSuggestions.map((suggestion, index) => (
                                <li key={index} className="small">• {suggestion}</li>
                              ))}
                            </ul>
                            {errorExample && (
                              <div className="mt-2">
                                <small>Example: </small>
                                <code>{errorExample}</code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="modal-buttons mt-4" style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button variant="secondary" className="fs-5 px-5" onClick={handleCancelPasswordReset}>
                        Cancel
                      </Button>
                      <Button variant="primary" className="fs-5 px-5" onClick={handlePasswordReset}>
                        Reset
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            )}

            {/* Services Grid */}
            <Row xs={1} sm={2} md={3} className="g-4">
              {services.map((service, index) => (
                <Col key={index}>
                  <Card
                    className={`card-bg ${service.cardClass}`}
                    onClick={() => handleServiceClick(service.title)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <Card.Title>{service.title}</Card.Title>
                      <Card.Text>{service.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;