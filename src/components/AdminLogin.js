import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./AdminLogin.css";
import TitleBar from './TitleBar.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [uname, setUname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const destroySession = async () => {
      try {
        await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
        console.log('Existing session destroyed.');
      } catch (error) {
        console.error('Error destroying session:', error);
      }
    };

    destroySession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:5000/adminlogin',
        { username: uname, password },
        { withCredentials: true }
      );

      if (response.data.message === 'Login successful') {
        sessionStorage.setItem('user', uname);
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          navigate('/admin-dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <>
      <TitleBar />
      <section className={`vh-100 fade-in-background ${showPopup ? "blurred-bg" : ""}`}
        style={{ background: `linear-gradient(to bottom, rgb(222, 236, 255), white)` }}
      >
        <Container fluid className="h-custom">
          <Row className="d-flex justify-content-center align-items-center h-100">
            <Col md={9} lg={6} xl={5}>
              <img 
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" 
                className="img-fluid" 
                alt="Sample" 
              />
            </Col>
            <Col md={8} lg={6} xl={4} className="offset-xl-1">
              <Form onSubmit={handleSubmit} className="p-5 fade-in-form custom-form">
                <Form.Label className='fs-2 mb-5 mt-5 fw-bold'>Admin Login</Form.Label>
                
                <Form.Group className={`mb-4 fs-4 ${shake ? 'shake' : ''} ${error ? 'error-field' : ''}`}>
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    className="fs-5"
                    type="text" 
                    placeholder="Enter Username" 
                    value={uname}
                    onChange={(e) => setUname(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className={`mb-3 fs-4 ${shake ? 'shake' : ''} ${error ? 'error-field' : ''}`}>
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    className="fs-5"
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                {error && (
                  <p className="text-danger fs-4">Invalid Username or Password</p>
                )}

                <div className="text-center text-lg-start mt-4 pt-2">
                  <Button variant="primary" type="submit" className="btn-lg custom-button">
                    Login
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Custom Success Popup */}
      {showPopup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <h2>✅ Login Successful</h2>
            <p>Welcome, {uname}! Redirecting...</p>
          </div>
        </div>
      )}
    </>
  );
}
