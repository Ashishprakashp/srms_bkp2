import React, { useState, useRef } from 'react';
import { Form, Button, Card, Table, Spinner, Badge ,Col,Row,Container} from 'react-bootstrap';
import axios from 'axios';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    
    // First, filter to keep only the most recent attempt of each course
    const uniqueCourses = courses.reduce((acc, course) => {
      const existingCourse = acc.find(c => c.courseCode === course.courseCode);
      
      if (!existingCourse) {
        acc.push(course);
      } else if (new Date(course.gradeSubmittedAt) > new Date(existingCourse.gradeSubmittedAt)) {
        // Replace with the more recent attempt
        acc = acc.filter(c => c.courseCode !== course.courseCode);
        acc.push(course);
      }
      
      return acc;
    }, []);
    
    // Then group by semester
    return uniqueCourses.reduce((acc, course) => {
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

  const handleDownloadPDF = async () => {
    console.log(studentData);
    if (!studentData) return;
  
    // Wait briefly to ensure all data is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Create new PDF document in portrait orientation
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Add logo
    const logoUrl = '/AnnaUniLogo.png';
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20);
  
    // Header text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTMENT OF INFORMATION SCIENCE AND TECHNOLOGY', 115, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('COLLEGE OF ENGINEERING GUIDY CAMPUS', 115, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('ANNA UNIVERSITY, CHENNAI – 600 025', 115, 25, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);
  
    // Student Information Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT ACADEMIC REPORT', 105, 35, { align: 'center' });
  
    // Define consistent table styles
    const tableStyles = {
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      margin: { left: 20, right: 20 }
    };
  
    // Personal Information Table
    autoTable(doc, {
      startY: 45,
      head: [['Name', 'Reg.No', 'Branch', 'Class', 'Batch', 'Gender']],
      body: [
        [
          studentData.personalInformation?.name || '-',
          studentData.personalInformation?.register || '-',
          studentData.branch || '-',
          studentData.class || '-',
          studentData.batch || '-',
          studentData.personalInformation?.sex || '-'
        ]
      ],
      ...tableStyles
    });
  
    // Academic Summary Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['CGPA', 'Total Credits Earned', 'Total Possible Credits', 'Current Semester']],
      body: [
        [
          calculateCGPA().toFixed(2),
          calculateTotalCredits(),
          Object.values(studentData.semesterSubmissions || {}).reduce(
            (sum, sem) => sum + (sem.totalCredits || 0), 0
          ),
          studentData.enrolled || '-'
        ]
      ],
      ...tableStyles
    });
  
    // Semester-wise Performance
    const semesterGroups = groupCoursesBySemester(studentData.enrolledCourses || []);
    const arrearsBySemester = groupArrearsBySemester(studentData.arrears || []);
  
    let currentY = doc.lastAutoTable.finalY + 15; // Initial space
  
    Object.entries(semesterGroups).forEach(([semester, courses], index) => {
      const semesterKey = semester.split(' ')[0];
      const semesterData = studentData.semesterSubmissions?.[semesterKey];
      const semesterArrears = arrearsBySemester[semester] || [];
      
      // Add space between semesters (except first one)
      if (index > 0) {
        currentY += 10;
      }
  
      // Semester heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Semester ${semesterKey}`, 105, currentY, { align: 'center' });
      
      // Semester Header Table
      autoTable(doc, {
        startY: currentY + 8,
        head: [['Semester', 'GPA', 'Credits Earned', 'Total Credits']],
        body: [
          [
            semester.split(' ')[1],
            semesterData ? ((semesterData.scoredCredits/semesterData.totalCredits)*10).toFixed(2) : '-',
            semesterData?.scoredCredits || '0',
            semesterData?.totalCredits || '0'
          ]
        ],
        ...tableStyles
      });
  
      // Course Grades Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Course Code', 'Grade', 'Status']],
        body: courses.map(course => [
          course.courseCode,
          course.grade || '-',
          course.gradeConfirmed ? 'Confirmed' : 'Pending'
        ]),
        ...tableStyles,
        styles: {
          ...tableStyles.styles,
          fontSize: 9
        }
      });
  
      // Arrears History Section (only if arrears exist)
      if (semesterArrears.length > 0) {
        // Add "Arrear History" title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Arrear History', 20, doc.lastAutoTable.finalY + 8);
        
        // Arrears History Table
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 12, // Space after title
          head: [['Course Code', 'Status', 'Attempts', 'Cleared Grade', 'Cleared Session']],
          body: semesterArrears.map(arrear => [
            arrear.subject_code,
            arrear.status,
            arrear.attempts?.join(', ') || 'No attempts',
            arrear.cleared_grade || '-',
            arrear.cleared_at || '-'
          ]),
          ...tableStyles,
          styles: {
            ...tableStyles.styles,
            fontSize: 9
          }
        });
      }
  
      // Update currentY for next semester
      currentY = doc.lastAutoTable.finalY + 15;
    });
  
    // Footer
    doc.setFontSize(10);
    doc.text('© Anna University - Department of IST', 105, doc.internal.pageSize.height - 15, { align: 'center' });
  
    // Save the PDF
    doc.save(`${studentData.personalInformation?.register || 'student'}_academic_report.pdf`);
  };
  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar/>
        <div className="main-content-ad-dboard flex-grow-1 overflow-y-auto p-4" style={{ backgroundColor: '#f5f7fb' }}>
          {/* Search Form - Not included in PDF */}
          <Card className="mb-4 mt-4 border-0" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', backgroundColor: '#ffffff' }}>
            <Card.Header className="bg-primary text-white" style={{ borderBottom: '2px solid #1a73e8' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0" style={{ fontWeight: 600 }}>Student Performance Viewer</h4>
                <Button
                  variant="light"
                  className="px-4"
                  style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', fontWeight: 500 }}
                  onClick={() => navigate(
                    sessionStorage.getItem('faculty') 
                      ? '/faculty-dashboard' 
                      : '/admin-dashboard/student-mgmt'
                  )}
                >
                  Back
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="registerNumber" className="mb-4">
                  <Form.Label className='fs-5' style={{ color: '#3c4043', fontWeight: 500 }}>Enter Student Register Number</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g., 2023178110"
                      required
                      className="py-2"
                      style={{ border: '1px solid #dadce0', borderRadius: '4px' }}
                    />
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="ms-2 px-4 py-2"
                      disabled={loading}
                      style={{ fontWeight: 500, backgroundColor: '#1a73e8', border: 'none' }}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Searching...
                        </>
                      ) : 'Search'}
                    </Button>
                  </div>
                </Form.Group>
                
                {studentData && (
                  <div className="d-flex justify-content-end mt-3">
                    <Button 
                      variant="success" 
                      onClick={handleDownloadPDF}
                      className="px-4 py-2"
                      style={{ fontWeight: 500, backgroundColor: '#0b8043', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download Full Report
                    </Button>
                  </div>
                )}
              </Form>

              {error && (
                <div className="alert alert-danger mt-3" style={{ backgroundColor: '#fce8e6', color: '#d93025', border: '1px solid #f5c6cb' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* PDF Content */}
          <div ref={pdfRef} className="pdf-content">
            {studentData && (
              <>
                <Card className="mb-4 border-0" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Card.Header className="bg-light" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                    <h4 className="mb-0" style={{ color: '#202124', fontWeight: 600 }}>
                      <i className="bi bi-person-vcard me-2" style={{ color: '#1a73e8' }}></i>
                      Personal Information
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <Container>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Name</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.name || '-'}</p>
                          </div>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Register Number</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.register || '-'}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Date of Birth</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>
                              {studentData.personalInformation?.dob ? 
                                new Date(studentData.personalInformation.dob).toLocaleDateString() : '-'}
                            </p>
                          </div>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Gender</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.sex || '-'}</p>
                          </div>
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Blood Group</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.blood || '-'}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Community</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.community || '-'}</p>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Email</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.mail || '-'}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <h6 className="mb-1" style={{ color: '#5f6368', fontWeight: 500 }}>Contact</h6>
                            <p className="fs-5" style={{ color: '#202124', fontWeight: 400 }}>{studentData.personalInformation?.contact || '-'}</p>
                          </div>
                        </Col>
                      </Row>
                    </Container>
                  </Card.Body>
                </Card>

                <Card className="mb-4 border-0" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Card.Header className="bg-light" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                    <h4 className="mb-0" style={{ color: '#202124', fontWeight: 600 }}>
                      <i className="bi bi-graph-up me-2" style={{ color: '#1a73e8' }}></i>
                      Academic Summary
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center">
                      <Col md={3} className="mb-3">
                        <div className="p-3 rounded" style={{ backgroundColor: '#e8f0fe' }}>
                          <h6 style={{ color: '#5f6368', fontWeight: 500 }}>CGPA</h6>
                          <h3 style={{ color: '#1a73e8', fontWeight: 600 }}>{calculateCGPA().toFixed(2)}</h3>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="p-3 rounded" style={{ backgroundColor: '#e6f4ea' }}>
                          <h6 style={{ color: '#5f6368', fontWeight: 500 }}>Credits Earned</h6>
                          <h3 style={{ color: '#0b8043', fontWeight: 600 }}>{calculateTotalCredits()}</h3>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="p-3 rounded" style={{ backgroundColor: '#fce8e6' }}>
                          <h6 style={{ color: '#5f6368', fontWeight: 500 }}>Possible Credits</h6>
                          <h3 style={{ color: '#d93025', fontWeight: 600 }}>
                            {Object.values(studentData.semesterSubmissions || {}).reduce(
                              (sum, sem) => sum + (sem.totalCredits || 0), 0
                            )}
                          </h3>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="p-3 rounded" style={{ backgroundColor: '#fef7e0' }}>
                          <h6 style={{ color: '#5f6368', fontWeight: 500 }}>Current Semester</h6>
                          <h3 style={{ color: '#e37400', fontWeight: 600 }}>{studentData.enrolled}</h3>
                        </div>
                      </Col>
                    </Row>
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
}

export default StudentReport;