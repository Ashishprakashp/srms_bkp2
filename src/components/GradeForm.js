import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Table, Button, Alert, Spinner, Card, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import StudentSideBar from './StudentSideBar.js';

const GradeForm = () => {
  const studentId = sessionStorage.getItem('student');
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState({
    allGradesSubmitted: false,
    submittedGrades: {}
  });
  const [gpa, setGpa] = useState(null);
  const [gradesAlreadyFilled, setGradesAlreadyFilled] = useState(false);
  // Grade to grade point mapping
  const gradePoints = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'RA': 0,
    'SA': 0,
    'W': 0
  };

  // Allowed grades with descriptions
  const allowedGrades = [
    { value: 'O', description: 'Outstanding (90-100)' },
    { value: 'A+', description: 'Excellent (80-89)' },
    { value: 'A', description: 'Very Good (70-79)' },
    { value: 'B+', description: 'Good (60-69)' },
    { value: 'B', description: 'Above Average (50-59)' },
    { value: 'C', description: 'Average (40-49)' },
    { value: 'RA', description: 'Reappear (Below 40)' },
    { value: 'SA', description: 'Shortage of Attendance' },
    { value: 'W', description: 'Withdrawal' },
  ];

  // Calculate GPA whenever grades change
  useEffect(() => {
    if (subjects.length > 0 && Object.keys(grades).length > 0) {
      let totalCredits = 0;
      let weightedSum = 0;
      let hasValidGrades = false;

      subjects.forEach(subject => {
        const grade = grades[subject.subject_code];
        if (grade && gradePoints[grade] !== undefined) {
          totalCredits += subject.credits;
          weightedSum += subject.credits * gradePoints[grade];
          hasValidGrades = true;
        }
      });

      if (hasValidGrades && totalCredits > 0) {
        const calculatedGpa = (weightedSum / totalCredits).toFixed(2);
        setGpa(calculatedGpa);
      } else {
        setGpa(null);
      }
    }
  }, [grades, subjects]);

  useEffect(() => {
    const checkGradesStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        if (response.data.grades_filled === response.data.can_fill_grades) {
          setGradesAlreadyFilled(true);
        }
      } catch (error) {
        console.error('Error checking grade status:', error);
      }
    };
    
    checkGradesStatus();
  }, [studentId]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        setStudent(response.data);
        
        if (response.data.can_fill_grades !== "0") {
          const subjectsResponse = await axios.get("http://localhost:5000/semester-details", {
            withCredentials: true,
            params: {
              course_name: response.data.branch,
              year: response.data.regulation,
              sem_no: response.data.can_fill_grades,
            }
          });
          
          setSubjects(subjectsResponse.data.subjects);
          const initialGrades = {};
          subjectsResponse.data.subjects.forEach(subject => {
            initialGrades[subject.subject_code] = '';
          });
          setGrades(initialGrades);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch student details');
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleGradeChange = (subjectCode, grade) => {
    const upperGrade = grade.toUpperCase();
    if (allowedGrades.some(g => g.value === upperGrade) || grade === '') {
      setGrades(prev => ({
        ...prev,
        [subjectCode]: upperGrade
      }));
    }
  };

  if (gradesAlreadyFilled) {
    return (
      <div className="alert alert-info mt-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Grades for semester {student?.can_fill_grades} have already been submitted.
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        e.target.value = '';
      } else {
        setMarksheet(file);
      }
    } else {
      alert('Please upload a PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all grades are entered
    if (!isFormComplete()) {
      alert('Please complete all grade fields and upload marksheet');
      return;
    }
  
    const formData = new FormData();
    formData.append('marksheet', marksheet); // The file object
    formData.append('studentId', studentId);
    formData.append('semester', student.can_fill_grades);
    formData.append('grades', JSON.stringify(grades));
    formData.append('calculatedGpa', gpa);
  
    try {
      const response = await axios.post('http://localhost:5000/submit-grades', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        console.log("Grades submitted!");
      }
    } catch (error) {
      console.log("Error: ",error);
    }
  };
  

  const isFormComplete = () => {
    return (
      Object.values(grades).every(grade => 
        allowedGrades.some(g => g.value === grade)
      ) && 
      marksheet !== null &&
      gpa !== null
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Alert variant="danger" className="w-50 text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <TitleBar />
      <div className="d-flex vh-100 bg-light">
        <StudentSideBar />
        <div className="flex-grow-1 p-4 overflow-auto">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 text-primary">
                <i className="bi bi-journal-bookmark-fill me-2"></i>
                Semester {student?.can_fill_grades} Grade Submission
              </h2>
              <Badge bg={student?.can_fill_grades !== '0' ? 'success' : 'secondary'} className="fs-6">
                {student?.can_fill_grades !== '0' ? 'Active Submission' : 'Not Available'}
              </Badge>
            </div>

            {student && (
              <>
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Body className="p-4">
                    <Row>
                      <Col md={4} className="border-end">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-person-badge fs-4 text-muted me-3"></i>
                          <div>
                            <h6 className="mb-0 text-muted">Student Information</h6>
                            <p className="mb-0 fw-bold">{student.name}</p>
                            <p className="mb-0 text-muted small">{student.studentId}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={4} className="border-end">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-book fs-4 text-muted me-3"></i>
                          <div>
                            <h6 className="mb-0 text-muted">Academic Details</h6>
                            <p className="mb-0 fw-bold">{student.branch}</p>
                            <p className="mb-0 text-muted small">{student.regulation} Regulation</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-building fs-4 text-muted me-3"></i>
                          <div>
                            <h6 className="mb-0 text-muted">Class Information</h6>
                            <p className="mb-0 fw-bold">Section {student.class}</p>
                            <p className="mb-0 text-muted small">Semester {student.can_fill_grades}</p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* GPA Display Card */}
                {gpa !== null && (
                  <Card className="mb-4 shadow-sm border-success">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 text-success">
                            <i className="bi bi-calculator-fill me-2"></i>
                            Calculated GPA
                          </h5>
                          <small className="text-muted">
                            (Not final until official confirmation)
                          </small>
                        </div>
                        <div>
                          <Badge bg="success" className="fs-4 px-3 py-2">
                            {gpa}
                          </Badge>
                        </div>
                      </div>
                      <Alert variant="warning" className="mt-2 mb-0">
                        <small>
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          This is a preliminary calculation. Final GPA will be confirmed after official verification.
                        </small>
                      </Alert>
                    </Card.Body>
                  </Card>
                )}

                {/* Grade Reference Card */}
                <Card className="mb-4 shadow-sm ">
                  
                  <Card.Body>
                    <div className="d-flex flex-wrap gap-2">
                      {allowedGrades.map((grade, index) => (
                        <OverlayTrigger
                          key={index}
                          placement="top"
                          overlay={<Tooltip>{grade.description}</Tooltip>}
                        >
                          <Badge 
                            bg="light" 
                            text="dark"
                            className="p-2 border d-flex align-items-center"
                            style={{ cursor: 'help' }}
                          >
                            <strong className="me-2">{grade.value}</strong>
                            <span className="text-muted">{grade.description}</span>
                          </Badge>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </Card.Body>
                  </Card>

                {student.can_fill_grades !== '0' ? (
                  <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                      <Form onSubmit={handleSubmit}>
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="bg-primary text-white">
                              <tr>
                                <th className="text-center">#</th>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th className="text-center">Credits</th>
                                <th className="text-center">Type</th>
                                <th className="text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subjects.length > 0 ? (
                                subjects.map((subject, index) => {
                                  const isGradeSubmitted = submissionStatus.submittedGrades[subject.subject_code] !== undefined;
                                  const currentGrade = isGradeSubmitted 
                                    ? submissionStatus.submittedGrades[subject.subject_code] 
                                    : grades[subject.subject_code] || '';

                                  return (
                                    <tr key={subject._id} className={isGradeSubmitted ? 'bg-light' : ''}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="fw-bold">{subject.subject_code}</td>
                                      <td>{subject.subject_name}</td>
                                      <td className="text-center">{subject.credits}</td>
                                      <td className="text-center">
                                        <Badge bg="info" className="text-uppercase">
                                          {subject.subject_type}
                                        </Badge>
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-center">
                                          <Form.Control
                                            type="text"
                                            value={currentGrade}
                                            onChange={(e) => handleGradeChange(subject.subject_code, e.target.value)}
                                            disabled={submissionStatus.allGradesSubmitted || isGradeSubmitted}
                                            className="text-center"
                                            style={{ width: '100px' }}
                                            placeholder="Enter grade"
                                            list="gradeSuggestions"
                                          />
                                          <datalist id="gradeSuggestions">
                                            {allowedGrades.map((grade, idx) => (
                                              <option key={idx} value={grade.value}>
                                                {grade.description}
                                              </option>
                                            ))}
                                          </datalist>
                                        </div>
                                        {isGradeSubmitted && (
                                          <div className="text-center mt-1">
                                            <Badge bg="success" pill>
                                              <i className="bi bi-check-circle-fill me-1"></i>
                                              Submitted
                                            </Badge>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="6" className="text-center py-4">
                                    <Alert variant="info" className="mb-0">
                                      <i className="bi bi-info-circle-fill me-2"></i>
                                      No subjects found for this semester
                                    </Alert>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>

                        {/* Marksheet Upload Section */}
                        <Card className="mt-4 border-0 shadow-sm">
                          <Card.Body>
                            <h5 className="mb-3 text-primary">
                              <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                              Upload Official Marksheet
                            </h5>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1">
                                <Form.Group controlId="formMarksheet">
                                  <Form.Label className="d-block mb-2">
                                    Please upload your semester marksheet (PDF only, max 5MB)
                                  </Form.Label>
                                  <div className="d-flex align-items-center">
                                    <Form.Control
                                      type="file"
                                      id="marksheetUpload"
                                      accept=".pdf"
                                      onChange={handleFileChange}
                                      className="me-3"
                                      disabled={submissionStatus.allGradesSubmitted}
                                      style={{ display: 'none' }}
                                    />
                                    <label htmlFor="marksheetUpload" className="btn btn-outline-secondary me-3">
                                      <i className="bi bi-upload me-2"></i>
                                      Choose File
                                    </label>
                                    {marksheet ? (
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-file-earmark-pdf text-danger fs-4 me-2"></i>
                                        <div>
                                          <p className="mb-0 fw-bold">{marksheet.name}</p>
                                          <small className="text-muted">
                                            {(marksheet.size / (1024 * 1024)).toFixed(2)} MB
                                          </small>
                                        </div>
                                        <Button 
                                          variant="link" 
                                          className="text-danger ms-2"
                                          onClick={() => setMarksheet(null)}
                                          disabled={submissionStatus.allGradesSubmitted}
                                        >
                                          <i className="bi bi-x-circle-fill"></i>
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-muted">No file selected</span>
                                    )}
                                  </div>
                                </Form.Group>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <div>
                            {!isFormComplete() && !submissionStatus.allGradesSubmitted && (
                              <Alert variant="warning" className="mb-0">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {!marksheet 
                                  ? 'Please upload your marksheet' 
                                  : !gpa 
                                    ? 'Please enter valid grades for all courses'
                                    : 'Please complete all requirements'
                                }
                              </Alert>
                            )}
                          </div>
                          {!submissionStatus.allGradesSubmitted ? (
                            <Button 
                              variant="primary" 
                              type="submit"
                              className="px-4 py-2 rounded-pill"
                              disabled={!isFormComplete()}
                            >
                              <i className="bi bi-send-fill me-2"></i>
                              Submit Grades & Marksheet
                            </Button>
                          ) : (
                            <Alert variant="success" className="mb-0 d-flex align-items-center">
                              <i className="bi bi-check-circle-fill me-2"></i>
                              All materials have been successfully submitted!
                            </Alert>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="shadow-sm border-0">
                    <Card.Body className="text-center py-5">
                      <i className="bi bi-lock-fill fs-1 text-secondary mb-3"></i>
                      <h4 className="text-secondary">Grade Submission Not Available</h4>
                      <p className="text-muted">
                        You are not currently enabled to submit grades for any semester.
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeForm;