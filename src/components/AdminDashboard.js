import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './AdminDashboard.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, '', window.location.href);

    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const user = sessionStorage.getItem('user');

    if (!isAuthenticated || !user) {
      navigate('/', { replace: true });
      return;
    }

    const handleNavigation = (event) => {
      window.history.replaceState(null, '', window.location.href);
      if (!sessionStorage.getItem('isAuthenticated')) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('beforeunload', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('beforeunload', handleNavigation);
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    navigate('/', { replace: true });
    window.location.reload();
  };

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar onLogoutClick={() => setShowLogoutModal(true)} />
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Welcome to the Dashboard</h1>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content">
                  <h3>Confirm Logout</h3>
                  <p>Are you sure you want to log out of your account?</p>
                  <div className="modal-buttons">
                    <Button
                      variant="secondary"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleLogout}
                    >
                      Confirm Logout
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
                ['Grade Management', 'card-4', '']
              ].map(([title, cardClass, path], index) => (
                <Col key={index}>
                  <Card 
                    className={`card-bg ${cardClass}`} 
                    onClick={() => path && navigate(path, { replace: true })}
                  >
                    <Card.Body>
                      <Card.Title>{title}</Card.Title>
                      <Card.Text>
                        {`This is the content of ${title}`}
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