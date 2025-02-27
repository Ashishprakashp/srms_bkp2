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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [password, setPassword] = useState('');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showRegulationsModal, setShowRegulationsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [regulations, setRegulations] = useState([]);

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fetch-courses-admin', {
          withCredentials: true
        });
        if (response.data.length !== 0) {
          setCourses(response.data);
        } else {
          console.log("No courses found!");
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleCourseClick = async (course) => {
    try {
      setSelectedCourse(course);
      const response = await axios.get(
        `http://localhost:5000/fetch-regulations/${course._id}`,
        { withCredentials: true }
      );
      setRegulations(response.data);
      setShowRegulationsModal(true);
    } catch (error) {
      console.error('Error fetching regulations:', error);
      alert('Failed to fetch regulations');
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!courseName.trim()) {
        alert('Please enter a valid course name');
        return;
      }
      const response = await axios.post(
        'http://localhost:5000/create-course',
        {
          course_name: courseName.trim()
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      handleClose();
      setCourseName('');
      const fetchResponse = await axios.get('http://localhost:5000/fetch-courses-admin', {
        withCredentials: true
      });
      setCourses(fetchResponse.data);
    } catch (error) {
      if (error.response?.data?.field === 'course_name') {
        alert(`Course creation failed: ${error.response.data.message}`);
      } else {
        alert('Failed to create course. Please try again.');
      }
    }
  };

  const handleRemoveClick = (course) => {
    setCourseToDelete(course);
    setShowConfirmationModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/delete-course',
        {
          course_id: courseToDelete._id,
          password: password
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        setCourses(prev => prev.filter(c => c._id !== courseToDelete._id));
        alert('Course deleted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Deletion failed');
    } finally {
      setShowConfirmationModal(false);
      setPassword('');
      setCourseToDelete(null);
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
            <Row xs={1} sm={1} md={1} className="g-4">
              <Col>
                <Card className="card-bg-cr card-1" onClick={handleShow}>
                  <Card.Body>
                    <Card.Title>Create Course</Card.Title>
                    <Card.Text>Create and manage courses</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              {courses.map((course, index) => (
                <Col key={index}>
                  <Card className="card-bg-cr">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div 
                        className="flex-grow-1" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCourseClick(course)}
                      >
                        <Card.Title className="mb-0">{course.course_name}</Card.Title>
                      </div>
                      <Button
                        variant="gray"
                        className="ms-2"
                        style={{
                          backgroundColor: '#c8ccd0',
                          color: 'white',
                          border: 'none',
                        }}
                        onClick={() => handleRemoveClick(course)}
                      >
                        Remove
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Alert: Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="password">
              <Form.Label className='fs-5'>
                All data associated with the course will be deleted. Confirm by entering the password...
              </Form.Label>
              <Form.Control
                className='fs-5'
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Regulations Modal */}
      <Modal 
        show={showRegulationsModal} 
        onHide={() => setShowRegulationsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Regulations for {selectedCourse?.course_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {regulations.length === 0 ? (
            <div className="text-center py-3">No regulations found</div>
          ) : (
            <div className="regulation-list">
              {regulations.map((regulation, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Card.Title>{regulation.title}</Card.Title>
                    <Card.Text>{regulation.description}</Card.Text>
                    <div className="text-muted small">
                      Last updated: {new Date(regulation.updatedAt).toLocaleDateString()}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegulationsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseMgmt;