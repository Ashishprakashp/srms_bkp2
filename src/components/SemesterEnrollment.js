import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Page1 from './Page1.js';
import Page2 from './Page2.js';
import Page3 from './Page3.js';
import Page4 from './Page4.js';
import Page5 from './Page5.js';
import { Container, Row, Col, Button, Nav, Spinner } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import StudentSideBar from './StudentSideBar.js';
import { useNavigate } from 'react-router-dom';

const SemesterEnrollment= () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formEnabled, setFormEnabled] = useState(false);
  const branch = sessionStorage.getItem('branch');
  const isBtech = branch.startsWith('BTECH'); // Check if branch starts with BTECH
  const totalPages = isBtech ? 4 : 5; // Skip Page 4 for BTECH students

  
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });
        console.log(response.data);
        const { 
          studentId: fetchedStudentId, 
          name,
          branch, 
          regulation, 
          from_year, 
          to_year,
          can_fill ,
          facultyAdvisor,
          can_enroll,
          enrolled,

        } = response.data;
        console.log(can_enroll);
        // Check if form submission is allowed
        setFormEnabled(can_enroll !== 0);

        
      } catch (error) {
        console.error('Error fetching enrollment details:', error);
      } finally {
        setLoading(false);
        
      }
    };

    fetchStudentDetails();
  });

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
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1">
        <StudentSideBar />
        {formEnabled ? (
          <Container fluid className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
            <p>Enabled To Enroll</p>
          </Container>
        ) : (
          <Container fluid className="p-4 d-flex align-items-center justify-content-center"
            style={{ height: 'calc(100vh - 56px)' }}>
            <div className="text-center">
              <h2 className="mb-4">This process is closed now!</h2>
              <Button variant="primary" onClick={() => navigate('/student-dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </Container>
        )}
      </div>
    </div>
  );
};

export default SemesterEnrollment;