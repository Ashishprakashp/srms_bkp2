import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './AdminDashboard.css';
import FacultySideBar from './FacultySidebar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const imageUrl = "./res/card_bg_1.jpg";
  const facultyId = sessionStorage.getItem('faculty'); // Assuming this stores faculty ID

  useEffect(() => {
    const fetchFacultyDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/faculty/${facultyId}`, {
          withCredentials: true
        });
        console.log(response.data);
        setFacultyDetails(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch faculty details');
        console.error('Error fetching faculty details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) {
      fetchFacultyDetails();
    }
  }, [facultyId]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true
      });
      sessionStorage.clear();
    } finally {
      navigate('/faculty-login', { replace: true });
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <FacultySideBar onLogoutClick={() => setShowLogoutModal(true)} />
        
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Welcome {facultyDetails.title+" "+facultyDetails.courtesy_title+" "+facultyDetails.name}</h1>
            </div>

            {showLogoutModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content p-5">
                  <h3 className='text-center'>Confirm Logout?</h3>
                  <div className="modal-buttons mt-5" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="secondary" className='fs-5 px-5' onClick={() => setShowLogoutModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" className='fs-5 px-5' onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Row xs={1} sm={2} md={3} className="g-4">
              {[
                ["Generate Report", 'card-1', '/student-report'],
                ["Query Student Data", 'card-2', '/student-query-system'],
              ].map(([title, cardClass, path], index) => (
                <Col key={index}>
                  <Card className={`card-bg ${cardClass}`} onClick={() => navigate(path)}>
                    <Card.Body>
                      <Card.Title>{title}</Card.Title>
                      <Card.Text>
                        {`Manage ${title.toLowerCase()} activities`}
                      </Card.Text>
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

export default FacultyDashboard;