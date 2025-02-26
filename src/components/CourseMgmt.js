import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import './CourseMgmt.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseMgmt = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true
        });
        
        if (!response.data.authenticated) {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleCreateCourse = async () => {
    try {
      if (!courseName.trim()) {
        alert('Please enter a valid course name');
        return;
      }
      console.log(courseName.trim());
      const response = await axios.post(
        'http://localhost:5000/create-course',
        {
          course_name: courseName.trim() // Trim whitespace
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Course created:', response.data);
      handleClose();
      setCourseName(''); // Reset input field
    } catch (error) {
      console.error('Detailed error:', error.response?.data);
      
      if (error.response?.data?.field === 'course_name') {
        alert(`Course creation failed: ${error.response.data.message}`);
      } else {
        alert('Failed to create course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar />
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>
              Back
            </Button>
            <h1 className="mb-4">Course Management</h1>
            <Row xs={1} sm={2} md={1} className="g-4">
              {[['Create Course', 'card-1']].map(([title, cardClass], index) => (
                <Col key={index}>
                  <Card className={`card-bg-cr ${cardClass}`} onClick={handleShow}>
                    <Card.Body>
                      <Card.Title>{title}</Card.Title>
                      <Card.Text>
                        {`Create and manage ${title.toLowerCase()}`}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="courseName">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCourse}>
            Create Course
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseMgmt;