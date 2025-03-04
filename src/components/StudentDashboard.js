import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './AdminDashboard.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import ResetCredentials from './components/ResetCredentials';

const StudentDashboard = ({ services }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(true); // Default to true
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch account status and check if password is reset
  const fetchAccountStatus = async () => {
    const studentId = sessionStorage.getItem('studentId');
    try {
      const response = await axios.get('http://localhost:5000/student/fetch', {
        params: { userId: studentId },
      });
      sessionStorage.setItem('branch', response.data.branch);
      setIsPasswordReset(response.data.reset !== 0); // Set password reset status
    } catch (error) {
      console.error('Error fetching account status:', error);
    }
  };

  // Verify session on component mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          fetchAccountStatus(); // Fetch account status if authenticated
        } else {
          navigate('/', { replace: true }); // Redirect to login if not authenticated
        }
      } catch (error) {
        navigate('/', { replace: true }); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true,
      });
    } finally {
      navigate('/', { replace: true }); // Redirect to login
      window.location.reload(); // Optional: Refresh the page to clear state
    }
  };

  // Handle service click
  const handleServiceClick = (serviceTitle) => {
    if (serviceTitle === 'Student Form') {
      navigate('/student-form');
    } else if (serviceTitle === 'Semester Form') {
      navigate('/student-dashboard/semforms');
    } else if (serviceTitle === 'Reset Credentials') {
      navigate('/reset-credentials');
    } else if (serviceTitle === 'Semester Enrollment') {
      navigate('/semester-enroll');
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
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar onLogoutClick={() => setShowLogoutModal(true)} />

        <div className="main-content-ad-dboard flex-grow-1">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Welcome {sessionStorage.getItem('studentId')}</h1>
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
                    <Button variant="danger" className="fs-5 px-5" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
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

      {/* Show password reset form if password is not reset */}
      {/* {!isPasswordReset && <ResetCredentials userType="student" />} */}
    </>
  );
};

export default StudentDashboard;