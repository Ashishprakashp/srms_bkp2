import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "./AdminLogin.css";
import TitleBar from './TitleBar.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    // State to store the username and password
    const navigate = useNavigate();
    const [uname, setUname] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:5000/adminlogin', {
                username: uname,
                password: password,
            });
    
            console.log('Full response:', response);
    
            if (response.data.message === 'Login successful') {
                navigate('/admin-dashboard');
            } else {
                console.log('Login failed:', response.data.message);
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
        }
    };
    return (
        <>
            <TitleBar />
            <section className="vh-100">
                <Container fluid className="h-custom">
                    <Row className="d-flex justify-content-center align-items-center h-100">
                        {/* Image Column */}
                        <Col md={9} lg={6} xl={5}>
                            <img 
                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" 
                                className="img-fluid" 
                                alt="Sample" 
                            />
                        </Col>
                        {/* Form Column */}
                        <Col md={8} lg={6} xl={4} className="offset-xl-1">
                            <Form onSubmit={handleSubmit}>
                                {/* Username input */}
                                <Form.Group className="mb-4">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter Username" 
                                        className="form-control-lg"
                                        value={uname}
                                        onChange={(e) => setUname(e.target.value)}
                                    />
                                </Form.Group>

                                {/* Password input */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Enter password" 
                                        className="form-control-lg"
                                        value={password} // Bind the input value to the state
                                        onChange={(e) => setPassword(e.target.value)} // Update the state on change
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    {/* Checkbox */}
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Remember me" 
                                    />
                                </div>

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

                {/* Footer */}
                <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
                    <div className="text-white mb-3 mb-md-0">
                        Copyright © 2025. All rights reserved.
                    </div>
                    <div>
                        <a href="#!" className="text-white me-4">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#!" className="text-white me-4">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#!" className="text-white me-4">
                            <i className="fab fa-google"></i>
                        </a>
                        <a href="#!" className="text-white">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}