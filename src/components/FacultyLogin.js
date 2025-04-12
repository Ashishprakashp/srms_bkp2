import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./StudentLogin.css"; // Create this CSS file for custom styles
import TitleBar from './TitleBar.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FacultyLogin() {
  const navigate = useNavigate();
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');

  // Destroy existing session on component mount
  useEffect(() => {
    const destroySession = async () => {
      try {
        await axios.post('http://localhost:5000/logout', {}, {
          withCredentials: true
        });
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
        'http://localhost:5000/facultylogin',
        { facultyId, password },
        { withCredentials: true }
      );

      
      console.log('Login response:', response.data); // Debugging line

      if (response.data.message === 'Login successful') {
        // Store student ID in sessionStorage for UI purposes
        sessionStorage.setItem('faculty', facultyId);
        navigate('/faculty-dashboard', { replace: true }); // Redirect to dashboard
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <TitleBar />
      <section 
        className="vh-100 slide-in-background" // Add the animation class here
        style={{ 
          background: `linear-gradient(to bottom, #a1c4fd, #c2e9fb)`, // Soft blue gradient
        }}
      >
        <Container fluid className="h-custom">
          <Row className="d-flex justify-content-center align-items-center h-100">
            <Col md={8} lg={6} xl={5}>
              <img 
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" 
                className="img-fluid" 
                alt="Sample" 
              />
            </Col>
            <Col md={6} lg={5} xl={4} className="offset-xl-1">
              <Form 
                onSubmit={handleSubmit} 
                className='p-4 slide-in-form' // Reduced padding
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
                  border: '1px solid rgba(255, 255, 255, 0.3)', // Light border
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)', // Blur effect
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', // Soft shadow
                  maxWidth: '400px', // Reduced width
                  margin: 'auto', // Center the form
                }}
              >
                <Form.Label className='fs-2 mb-5 mt-4 fw-bold text-primary'>Faculty Login</Form.Label>
                <Form.Group className="mb-3 fs-5">
                  <Form.Label className="text-secondary">Faculty ID</Form.Label>
                  <Form.Control 
                    className="fs-5"
                    type="text" 
                    placeholder="Enter Faculty ID" 
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3 fs-5">
                  <Form.Label className="text-secondary">Password</Form.Label>
                  <Form.Control 
                    className="fs-5"
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="text-center text-lg-start mt-5 pt-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="btn-lg w-100 fs-4" 
                    style={{ 
                      padding: '0.5rem', 
                      backgroundColor: '#4a90e2', // Soft blue color
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Login
                  </Button>
                </div>

                
              </Form>
            </Col>
          </Row>
        </Container>

        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-dark">
          <div className="text-white mb-3 mb-md-0">
            Copyright © 2025. All rights reserved.
          </div>
        </div>
      </section>
    </>
  );
}