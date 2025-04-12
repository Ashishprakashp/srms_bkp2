import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Image, Card, Row, Col, Button } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const StudentMgmt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Authentication check before rendering
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/check-auth', {
          withCredentials: true,
        });

        if (!response.data.authenticated) {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      } finally {
        
      }
    };

    verifyAuth();
  }, [navigate]);

  

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div 
  className="main-content-ad-dboard flex-grow-1" 
  style={{ backgroundColor: '#e3eeff', overflowY: 'auto' }}
>
          <div className="p-4 w-100">
            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>
              Back
            </Button>
            <h1 className="mb-4">Student Management</h1>

            {/* Cards Grid */}
            <Row xs={1} sm={2} md={3} className="g-4 mt-5">
  {[
    [
      'Create Login', 
      'card1', 
      '/admin-dashboard/student-mgmt/create-login',
      'Create new student login credentials '
    ],
    [
      'Reset Login', 
      'card2', 
      '',
      'Reset forgotten passwords for student users'
    ],
    [
      'Student Details Approval', 
      'card3', 
      '/student-details-approval',
      'Initiate, Review and approve student-submitted personal and academic information'
    ],
    [
      'Semester Enrollment', 
      'card4', 
      '/student-enrollment',
      'Initiate and Manage semester enrollment for students'
    ],
    [
      'Semester Grades Approval', 
      'card4', 
      '/student-grades-approval',
      'Initiate, manage and approve final grades of students for each semester'
    ],
    [
      'Generate Report', 
      'card1', 
      '/student-report',
      'Create academic performance report for student'
    ],
    [
      'Query Student Data', 
      'card4', 
      '/student-query-system',
      'Dynamically query and retrieve student academic and personal details'
    ],
  ].map(([title, cardClass, path, description], index) => (
    <Col key={index}>
      <Card 
        className={`card-bg ${cardClass}`} 
        onClick={() => path && navigate(path)}
      >
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            {description}
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

export default StudentMgmt;
