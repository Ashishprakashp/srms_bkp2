import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./AdminLogin.css";
import TitleBar from './TitleBar.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [uname, setUname] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:5000/adminlogin',
        { username: uname, password },
        { withCredentials: true }
      );

      if (response.data.message === 'Login successful') {
        // Optional: Store username in sessionStorage for UI purposes
        sessionStorage.setItem('user', uname);
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <TitleBar />
      <section className="vh-100">
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
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter Username" 
                    value={uname}
                    onChange={(e) => setUname(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="btn-lg" 
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  >
                    Login
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>

        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">
            Copyright © 2025. All rights reserved.
          </div>
          {/* Social links remain same */}
        </div>
      </section>
    </>
  );
}