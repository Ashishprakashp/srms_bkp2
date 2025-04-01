import React, { useState } from 'react';
import { Form, Button, Card, Table, Spinner, Accordion } from 'react-bootstrap';
import axios from 'axios';

const StudentReport = () => {
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/students/${registerNumber}`);
      setStudentData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student data');
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (registerNumber.trim()) {
      fetchStudentData();
    }
  };

  const groupCoursesBySemester = () => {
    if (!studentData?.enrolledCourses) return {};
    
    return studentData.enrolledCourses.reduce((acc, course) => {
      const semester = course.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(course);
      return acc;
    }, {});
  };

  const renderSemesterTables = () => {
    const semesterGroups = groupCoursesBySemester();
    return Object.entries(semesterGroups).map(([semester, courses]) => (
      <Card key={semester} className="mb-4">
        <Card.Header>
          <h5>Semester: {semester}</h5>
          {studentData.semesterSubmissions[semester.split(' ')[0]] && (
            <div className="mt-2">
              <strong>GPA:</strong> {studentData.semesterSubmissions[semester.split(' ')[0]].gpa.toFixed(2)} | 
              <strong> Credits:</strong> {studentData.semesterSubmissions[semester.split(' ')[0]].scoredCredits}/
              {studentData.semesterSubmissions[semester.split(' ')[0]].totalCredits} | 
              <strong> Status:</strong> {studentData.semesterSubmissions[semester.split(' ')[0]].verified ? 
                'Verified' : 'Pending Verification'}
            </div>
          )}
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Grade</th>
                <th>Session</th>
                <th>Status</th>
                <th>Re-enrolled</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.courseCode}</td>
                  <td>{course.grade}</td>
                  <td>{course.session}</td>
                  <td>{course.gradeConfirmed ? 'Confirmed' : 'Pending'}</td>
                  <td>{course.isReEnrolled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    ));
  };

  return (
    <div className="main-content-ad-dboard flex-grow-1 overflow-y-auto p-4">
      <Card className="mb-4">
        <Card.Header>
          <h4>Student Performance Viewer</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="registerNumber" className="mb-3">
              <Form.Label>Enter Student Register Number</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g., 2023178110"
                  required
                />
                <Button variant="primary" type="submit" className="ms-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Searching...
                    </>
                  ) : 'Search'}
                </Button>
              </div>
            </Form.Group>
          </Form>

          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </Card.Body>
      </Card>

      {studentData && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <h4>Student Details</h4>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Register Number:</strong> {studentData.studentId}</p>
                  <p><strong>Batch:</strong> {studentData.batch}</p>
                  <p><strong>Branch:</strong> {studentData.branch}</p>
                  <p><strong>Regulation:</strong> {studentData.regulation}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Overall GPA:</strong> {calculateOverallGPA(studentData).toFixed(2)}</p>
                  <p><strong>Total Credits:</strong> {calculateTotalCredits(studentData)}</p>
                  <p><strong>Last Updated:</strong> {new Date(studentData.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <h4 className="mb-3">Semester-wise Performance</h4>
          {renderSemesterTables()}
        </>
      )}
    </div>
  );
};

// Helper functions
const calculateOverallGPA = (studentData) => {
  if (!studentData.semesterSubmissions) return 0;
  
  const semesters = Object.values(studentData.semesterSubmissions);
  if (semesters.length === 0) return 0;
  
  const totalGPA = semesters.reduce((sum, sem) => sum + sem.gpa, 0);
  return totalGPA / semesters.length;
};

const calculateTotalCredits = (studentData) => {
  if (!studentData.semesterSubmissions) return 0;
  
  return Object.values(studentData.semesterSubmissions).reduce(
    (sum, sem) => sum + sem.scoredCredits, 0
  );
};

export default StudentReport;