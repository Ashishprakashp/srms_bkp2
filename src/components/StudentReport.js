import React, { useState, useRef } from 'react';
import { Form, Button, Card, Table, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentReport = () => {
  const pdfRef = useRef();
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [detailsRes, gradesRes, accRes] = await Promise.all([
        axios.get(`http://localhost:5000/student-personal-details?registerNumber=${registerNumber}`),
        axios.get(`http://localhost:5000/api/students/${registerNumber}`),
        axios.get(`http://localhost:5000/student/${registerNumber}`)
      ]);

      setStudentData({
        ...detailsRes.data,
        ...gradesRes.data,
        ...accRes.data
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch student data');
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

  const groupCoursesBySemester = (courses) => {
    if (!courses) return {};
    return courses.reduce((acc, course) => {
      const semester = course.semester;
      if (!acc[semester]) acc[semester] = [];
      acc[semester].push(course);
      return acc;
    }, {});
  };

  const convertGradeToPoint = (grade) => {
    const gradeMap = {
      'S': 10, 'A+': 10, 'A': 9, 'B+': 8.5, 'B': 8, 
      'C+': 7.5, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'RA': 0
    };
    return gradeMap[grade] || 0;
  };

  const calculateSemesterGPA = (semesterCourses) => {
    if (!semesterCourses?.length) return 0;
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    semesterCourses.forEach(course => {
      if (!course.isReEnrolled && course.grade && course.grade !== 'F') {
        const gradePoint = convertGradeToPoint(course.grade);
        totalGradePoints += gradePoint * (course.credits || 0);
        totalCredits += course.credits || 0;
      }
    });
    
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  };

  const calculateOverallGPA = () => {
    if (!studentData?.enrolledCourses) return 0;
    const semesterGroups = groupCoursesBySemester(studentData.enrolledCourses);
    let totalWeightedGPA = 0;
    let totalSemesterCredits = 0;
    
    Object.entries(semesterGroups).forEach(([semester, courses]) => {
      const semesterKey = semester.split(' ')[0];
      const semesterData = studentData.semesterSubmissions?.[semesterKey];
      if (semesterData) {
        const semesterGPA = calculateSemesterGPA(courses);
        const semesterCredits = semesterData.totalCredits || 0;
        totalWeightedGPA += semesterGPA * semesterCredits;
        totalSemesterCredits += semesterCredits;
      }
    });
    
    return totalSemesterCredits > 0 ? totalWeightedGPA / totalSemesterCredits : 0;
  };

  const calculateCGPA = () => {
    if (!studentData?.semesterSubmissions) return 0;
    let totalScoredCredits = 0;
    let totalPossibleCredits = 0;
  
    Object.values(studentData.semesterSubmissions).forEach(semester => {
      totalScoredCredits += semester.scoredCredits || 0;
      totalPossibleCredits += semester.totalCredits || 0;
    });
  
    return totalPossibleCredits > 0 
      ? (totalScoredCredits / totalPossibleCredits) * 10
      : 0;
  };

  const calculateTotalCredits = () => {
    if (!studentData?.semesterSubmissions) return 0;
    return Object.values(studentData.semesterSubmissions).reduce(
      (sum, sem) => sum + (sem.scoredCredits || 0), 0
    );
  };

  const groupArrearsBySemester = (arrears) => {
    return arrears?.reduce((acc, arrear) => {
      const semKey = arrear.semester;
      if (!acc[semKey]) acc[semKey] = [];
      acc[semKey].push(arrear);
      return acc;
    }, {}) || {};
  };

  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add temporary styling for PDF
    const style = document.createElement('style');
    style.textContent = `
      .pdf-content {
        background-color: #f8f9fa !important;
        padding: 20px;
      }
      .card {
        border: 1px solid #dee2e6 !important;
        margin-bottom: 15px;
        background: white !important;
      }
      .table {
        background: white !important;
        border: 1px solid #dee2e6 !important;
      }
      th {
        background-color: #e9ecef !important;
      }
      h4, h5 {
        color: #2c3e50 !important;
      }
    `;
    document.head.appendChild(style);

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      windowHeight: input.scrollHeight,
      backgroundColor: '#f8f9fa'
    });

    document.head.removeChild(style);

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdf.internal.pageSize.getWidth();
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    position -= pageHeight;

    while (position > -imgHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      position -= pageHeight;
    }

    pdf.save(`${studentData.personalInformation.register}-report.pdf`);
  };

  const renderSemesterTables = () => {
    if (!studentData?.enrolledCourses || !studentData?.arrears) return null;
    const semesterGroups = groupCoursesBySemester(studentData.enrolledCourses);
    const arrearsBySemester = groupArrearsBySemester(studentData.arrears);

    return Object.entries(semesterGroups).map(([semester, courses]) => {
      const semesterKey = semester.split(' ')[0];
      const semesterData = studentData.semesterSubmissions?.[semesterKey];
      const semesterArrears = arrearsBySemester[semester] || [];
      const activeArrears = semesterArrears.filter(a => a.status === 'active');
      const closedArrears = semesterArrears.filter(a => a.status === 'closed');

      return (
        <Card key={semester} className="mb-4">
          <Card.Header>
            <h5>Semester: {semester}</h5>
            {semesterData && (
              <div className="mt-2">
                <strong>GPA:</strong> {((semesterData.scoredCredits/semesterData.totalCredits)*10).toFixed(2)} | 
                <strong> Credits:</strong> {semesterData.scoredCredits || 0}/
                {semesterData.totalCredits || 0} | 
                <strong> Arrears:</strong> {activeArrears.length} Active, {closedArrears.length} Closed
              </div>
            )}
          </Card.Header>
          <Card.Body>
            <h5>Course Grades</h5>
            <Table striped bordered hover responsive className="mb-4">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseCode}</td>
                    <td>
                      <Badge bg={course.grade === 'RA' ? 'warning' : 'success'}>
                        {course.grade}
                      </Badge>
                    </td>
                    <td>{course.gradeConfirmed ? 'Confirmed' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {semesterArrears.length > 0 && (
              <>
                <h5>Arrears History</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Attempts</th>
                      <th>Cleared Grade</th>
                      <th>Cleared session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterArrears.map((arrear, index) => (
                      <tr key={`arrear-${index}`}>
                        <td>{arrear.subject_code}</td>
                        <td>
                          <Badge bg={arrear.status === 'active' ? 'danger' : 'success'}>
                            {arrear.status}
                          </Badge>
                        </td>
                        <td>{arrear.attempts?.join(', ') || 'No attempts'}</td>
                        <td>{arrear.cleared_grade || '-'}</td>
                        <td>{arrear.cleared_at || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </Card.Body>
        </Card>
      );
    });
  };

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar/>
        <div className="main-content-ad-dboard flex-grow-1 overflow-y-auto p-4">
          {/* Search Form - Not included in PDF */}
          <Card className="mb-4">
            <Card.Header>
              <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard/student-mgmt')}>
                Back
              </Button>
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
                  <div className="mt-4 mb-4 float-end">
                    <Button 
                      variant="success" 
                      onClick={handleDownloadPDF}
                      disabled={!studentData}
                    >
                      Download Full Report
                    </Button>
                  </div>
                </Form.Group>
              </Form>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </Card.Body>
          </Card>

          {/* PDF Content */}
          <div ref={pdfRef} className="pdf-content">
            {studentData && (
              <>
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Personal Information</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Name:</strong> {studentData.personalInformation?.name || '-'}</p>
                        <p><strong>Register Number:</strong> {studentData.personalInformation?.register || '-'}</p>
                        <p><strong>Date of Birth:</strong> 
                          {studentData.personalInformation?.dob ? 
                            new Date(studentData.personalInformation.dob).toLocaleDateString() : '-'}
                        </p>
                        <p><strong>Gender:</strong> {studentData.personalInformation?.sex || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Blood Group:</strong> {studentData.personalInformation?.blood || '-'}</p>
                        <p><strong>Community:</strong> {studentData.personalInformation?.community || '-'}</p>
                        <p><strong>Email:</strong> {studentData.personalInformation?.mail || '-'}</p>
                        <p><strong>Contact:</strong> {studentData.personalInformation?.contact || '-'}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>
                    <h4>Academic Summary</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-3">
                        <p><strong>CGPA:</strong> {calculateCGPA().toFixed(2)}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>Total Credits Earned:</strong> {calculateTotalCredits()}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>Total Possible Credits:</strong> 
                          {Object.values(studentData.semesterSubmissions || {}).reduce(
                            (sum, sem) => sum + (sem.totalCredits || 0), 0
                          )}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>Current Semester:</strong> {studentData.enrolled}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {renderSemesterTables()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentReport;