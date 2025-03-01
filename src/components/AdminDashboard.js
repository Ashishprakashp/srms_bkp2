import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './AdminDashboard.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const imageUrl = "./res/card_bg_1.jpg";

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true
        });
        
        if (response.data.authenticated) {
          setUser(response.data.user);
        } else {
          navigate('/', { replace: true }); // Replace history entry
        }
      } catch (error) {
        navigate('/', { replace: true }); // Replace history entry
      } finally {
        setLoading(false);
      }
    };
  
    verifySession();
  }, [navigate]);



const handleLogout = async () => {
  try {
    await axios.post('http://localhost:5000/logout', {}, {
      withCredentials: true
    });
  } finally {
    navigate('/', { replace: true }); // Replace history entry
    window.location.reload(); // Optional: Refresh the page to clear state
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
        
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Welcome {user?.username}</h1>
            </div>

            {showLogoutModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content p-5">
                  <h3 className='text-center'>Confirm Logout ?</h3>
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
                ['Faculty Management', 'card-1', '/admin-dashboard/faculty-mgmt'],
                ['Student Management', 'card-2', '/admin-dashboard/student-mgmt'],
                ['Course Management', 'card-3', '/admin-dashboard/course-mgmt'],
                ['Grade Management', 'card-4', '/admin-dashboard/grade-mgmt']
              ].map(([title, cardClass, path], index) => (
                <Col key={index}>
                  <Card className={`card-bg ${cardClass}`} onClick={() => navigate(path)} >
                    <Card.Body>
                      <Card.Title>{title}</Card.Title>
                      <Card.Text>
                        {`Manage ${title.toLowerCase()} settings`}
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

export default AdminDashboard;