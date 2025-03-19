import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDetailsApproval.css'; // Import the new CSS file

const StudentGradesApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentGroups, setStudentGroups] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true,
        });

        if (!response.data.authenticated) {
          navigate('/');
        } else {
          fetchStudentGroups();
        }
      } catch (error) {
        navigate('/');
      }
    };

    const fetchStudentGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/student-class/all');
        const students = response.data;

        // Group students by branch, regulation, from_year, to_year
        const groups = students.reduce((acc, student) => {
          const key = `${student.branch}-${student.regulation}-${student.from_year}-${student.to_year}-${student._class}`;
          if (!acc[key]) {
            acc[key] = {
              branch: student.branch,
              regulation: student.regulation,
              from_year: student.from_year,
              to_year: student.to_year,
              _class: student._class,
              students: [],
            };
          }
          acc[key].students.push(student);
          return acc;
        }, {});

        setStudentGroups(Object.values(groups));
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch student data');
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleEnable = async (group) => {
    try {
      const response = await axios.post('http://localhost:5000/student-class/update-can-enroll', {
        branch: group.branch,
        regulation: group.regulation,
        from_year: group.from_year,
        to_year: group.to_year,
        _class: group._class,
      });

      if (response.data.success) {
        alert(`Enabled ${response.data.updatedCount} students!`);
      } else {
        alert('Failed to enable students');
      }
    } catch (error) {
      console.error('Error enabling students:', error);
      alert('Error enabling students');
    }
  };

  const handleViewClassDetails = (group) => {
    // Navigate to the new page with class details
    navigate('/enrollment-details', {
      state: {
        branch: group.branch,
        regulation: group.regulation,
        from_year: group.from_year,
        to_year: group.to_year,
        _class: group._class,
      },
    });
  };

  if (loading) {
    return (
      <div className="student-approval-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-approval-error">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar />
        <div className="student-approval-content">
          <div className="p-4">
            <Button className="student-approval-back-btn" onClick={() => navigate('/admin-dashboard/student-mgmt')}>
              Back
            </Button>
            <h1 className="student-approval-title">Student Classes</h1>

            <Row xs={1} sm={2} md={3} className="g-4">
              {studentGroups.map((group, index) => (  
                <Col key={index}>
                  <Card className="student-approval-card">
                    <Card.Body>
                      <Card.Title>
                        {group.branch} - {group.regulation}
                      </Card.Title>
                      <Card.Subtitle className="student-approval-card-subtitle">
                        Batch: {group.from_year} - {group.to_year} <br />
                        Class: {group._class}
                      </Card.Subtitle>
                      <Card.Text>Total Students: {group.students.length}</Card.Text>
                      {/* <Button variant="primary" onClick={() => handleEnable(group)}>
                        Enable Enrollment
                      </Button> */}
                      <Button variant="secondary" className="ms-4" onClick={() => handleViewClassDetails(group)}>
                        View Details
                      </Button>
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

export default StudentGradesApproval;
