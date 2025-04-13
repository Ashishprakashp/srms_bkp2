import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Table, Button, Alert, Spinner, Card, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import StudentSideBar from './StudentSideBar.js';
import { useNavigate } from 'react-router-dom';

const GradeForm = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [clearedArrears, setClearedArrears] = useState([]);
  const studentId = sessionStorage.getItem('student');
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gpa, setGpa] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [scoredCredits, setScoredCredits] = useState(0);
  const [gradesAlreadyFilled, setGradesAlreadyFilled] = useState(false);
  const [arrears, setArrears] = useState([]);
  const [newArrears, setNewArrears] = useState([]);
  const [semesterCreditsUpdates, setSemesterCreditsUpdates] = useState({});
  const [originalGrades, setOriginalGrades] = useState({});
  const [semesterNumber,setSemesterNumber] = useState('0');
  const [hasRejectedGrades, setHasRejectedGrades] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);

  const gradePoints = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 
    'RA': 0,
    //  'SA': 0, 'W': 0
  };

  const getRowStyle = (subject) => {
    const isArrear = arrears.some(a => a.subject_code === subject.subject_code);
    const isCleared = clearedArrears.includes(subject.subject_code);
    
    const baseStyle = {
      '--bs-table-bg': getBackgroundColor(subject.subject_type),
      backgroundColor: `${getBackgroundColor(subject.subject_type)} !important`,
      background: `${getBackgroundColor(subject.subject_type)} !important`,
    };

    if (isArrear) {
      return {
        ...baseStyle,
        '--bs-table-bg': isCleared ? '#e8f5e9' : '#fff3e0',
        backgroundColor: isCleared ? '#e8f5e9 !important' : '#fff3e0 !important',
        background: isCleared ? '#e8f5e9 !important' : '#fff3e0 !important',
      };
    }

    return baseStyle;
  };

  const allowedGrades = [
    { value: 'O', description: 'Outstanding (90-100)' },
    { value: 'A+', description: 'Excellent (80-89)' },
    { value: 'A', description: 'Very Good (70-79)' },
    { value: 'B+', description: 'Good (60-69)' },
    { value: 'B', description: 'Above Average (50-59)' },
    { value: 'C', description: 'Average (40-49)' },
    { value: 'RA', description: 'Reappear (Below 40)' },
    // { value: 'SA', description: 'Shortage of Attendance' },
    // { value: 'W', description: 'Withdrawal' },
  ];

  const getBackgroundColor = (type) => {
    switch(type) {
      case 'FC': return '#e3f2fd';
      case 'RMC': return '#fff3e0';
      case 'PCC': return '#e8f5e9';
      case 'PEC': return '#f3e5f5';
      case 'EEC': return '#fce4ec';
      default: return 'transparent';
    }
  };

  useEffect(() => {
    const calculateGpaAndCgpa = async () => {
      if (subjects.length > 0 && Object.keys(grades).length > 0) {
        let currentSemesterCredits = 0;
        let currentSemesterWeightedSum = 0;
        const semesterUpdates = {};
        const newlyCleared = [];
        const detectedNewArrears = [];
    
        subjects.forEach(subject => {
          const grade = grades[subject.subject_code];
          if (grade && gradePoints[grade] !== undefined) {
            const isArrear = arrears.some(a => a.subject_code === subject.subject_code);
            
            if (isArrear) {
              const arrearData = arrears.find(a => a.subject_code === subject.subject_code);
              const sem = arrearData.originalSemester;
              console.log("Arrear: "+sem);
              // Check if this arrear belongs to current semester
              if (sem.split(" ")[0] === semesterNumber) {
                // Treat as normal grade for current semester GPA
                currentSemesterCredits += subject.credits * 10;
                if (gradePoints[grade] >= 5) {
                  currentSemesterWeightedSum += subject.credits * gradePoints[grade];
                  // Also mark as cleared arrear (regardless of which semester it belongs to)
                  newlyCleared.push(subject.subject_code);
                }
                if (grade === 'RA') detectedNewArrears.push(subject.subject_code);
              } else {
                // Only affects CGPA (through semesterUpdates)
                if (gradePoints[grade] >= 5) {
                  if (!semesterUpdates[sem]) {
                    semesterUpdates[sem] = { credits: 0, weighted: 0 };
                  }
                  semesterUpdates[sem].credits += subject.credits * 10;
                  semesterUpdates[sem].weighted += subject.credits * gradePoints[grade];
                  newlyCleared.push(subject.subject_code);
                }
              }
            } else {
              // Normal subject
              currentSemesterCredits += subject.credits * 10;
              if (gradePoints[grade] >= 5) {
                currentSemesterWeightedSum += subject.credits * gradePoints[grade];
              }
              if (grade === 'RA') detectedNewArrears.push(subject.subject_code);
            }
          }
        });
    
        setSemesterCreditsUpdates(semesterUpdates);
        setClearedArrears(newlyCleared);
        setNewArrears(detectedNewArrears);
    
        if (currentSemesterCredits > 0) {
          const calculatedGpa = (currentSemesterWeightedSum / currentSemesterCredits * 10).toFixed(2);
          setGpa(calculatedGpa);
          setTotalCredits(currentSemesterCredits);
          setScoredCredits(currentSemesterWeightedSum);
        }
    
        try {
          const response = await axios.get(`http://localhost:5000/student-grades-prev-sems/${studentId}`);
          if (response.data.success) {
            let totalCumulativeCredits = currentSemesterCredits;
            let totalCumulativeWeightedSum = currentSemesterWeightedSum;
    
            Object.entries(response.data.semesterSubmissions || {}).forEach(([sem, data]) => {
              if(sem===semesterNumber)return;
              if (semesterUpdates[sem]) {
                totalCumulativeCredits += semesterUpdates[sem].credits;
                totalCumulativeWeightedSum += semesterUpdates[sem].weighted;
              } else {
                totalCumulativeCredits += data.totalCredits;
                totalCumulativeWeightedSum += data.scoredCredits ;
              }
            });
    
            Object.entries(semesterUpdates).forEach(([sem, { credits, weighted }]) => {
              if (!response.data.semesterSubmissions[sem]) {
                totalCumulativeCredits += credits;
                totalCumulativeWeightedSum += weighted;
              }
            });
    
            const calculatedCgpa = totalCumulativeCredits > 0 
              ? ((totalCumulativeWeightedSum / totalCumulativeCredits)*10).toFixed(2)
              : 0;
            setCgpa(calculatedCgpa);
          }
        } catch (error) {
          console.error('Error fetching previous grades:', error);
          setCgpa(null);
        }
      }
    };
    calculateGpaAndCgpa();
  }, [grades, subjects, studentId, arrears]);

  useEffect(() => {
    const checkGradesStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        if (response.data.grades_filled !== '0' ) {
          setGradesAlreadyFilled(true);
        }
      } catch (error) {
        console.error('Error checking grade status:', error);
      }
    };
    checkGradesStatus();
  }, [studentId]);

  function findGradeByCourseCode(responseData, courseCode) {
    if(responseData.data==="")return null;
    const course = responseData.data.courses.find(
      (c) => c.courseCode === courseCode
    );
    return course ? course.grade : null;
  }

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        setStudent(response.data);
        console.log("Semester: "+response.data.can_fill_grades.split(' ')[0]);
        setSemesterNumber(response.data.can_fill_grades.split(' ')[0]);
        let existingGradesResponse=null;

        if(response.data.grades_filled !=='0' && response.data.can_fill_grades!=='0'){

        }
          existingGradesResponse = await axios.get(
            `http://localhost:5000/get-submitted-grades/${studentId}/${Number(response.data.can_fill_grades.split(' ')[0])}`
          );
          console.log(existingGradesResponse);
          if(existingGradesResponse){
            setGrades(existingGradesResponse.data.grades);
            // Check for rejection
          if (existingGradesResponse.data?.rejectReason) {
            setHasRejectedGrades(true);
            setRejectionDetails({
              reason: existingGradesResponse.data.rejectReason,
              rejectedBy: existingGradesResponse.data.rejectedBy,
              rejectedAt: new Date(existingGradesResponse.data.rejectedAt).toLocaleString()
            });
            setIsEditMode(true); // Automatically enable edit mode for resubmission
          }
          }else{

          }
          
        
          console.error('Error fetching existing grades:', error);
        
        // if (response.data.grades_filled !== "0") {
        //   try {
        //     const existingGradesResponse = await axios.get(
        //       `http://localhost:5000/get-submitted-grades/${studentId}/${Number(response.data.can_fill_grades.split(' ')[0])}`
        //     );
        //     console.log(existingGradesResponse);
        //     setGrades(existingGradesResponse.data.grades);
        //     setOriginalGrades(existingGradesResponse.data.grades);
        //   } catch (error) {
        //     console.error('Error fetching existing grades:', error);
        //   }
        // }
        
        if (response.data.can_fill_grades !== "0") {
          const subjectsResponse = await axios.get("http://localhost:5000/semester-details", {
            params: {
              course_name: response.data.branch,
              year: response.data.regulation,
              sem_no: response.data.can_fill_grades,
            }
          });
          console.log("subjects response: ",subjectsResponse);
          const arrearsResponse = await axios.get(`http://localhost:5000/get-arrears/${studentId}`);
          arrearsResponse.data = arrearsResponse.data.filter(
            arrear => arrear.status === 'active'|| 
            (arrear.status === 'closed' && arrear.cleared_at === response.data.can_fill_grades)
          );
          const arrearsWithSemester = arrearsResponse.data
  .filter(arrear => arrear.semester !== semesterNumber) // Skip if semester matches
  .map(arrear => ({
    ...arrear,
    originalSemester: arrear.semester
  }));
          setArrears(arrearsWithSemester);

          const initialGrades = {};
          subjectsResponse.data.subjects.forEach(subject => {
            initialGrades[subject.subject_code] = findGradeByCourseCode(existingGradesResponse, subject.subject_code);
          });
          if (Object.keys(grades).length === 0) {
            setGrades(initialGrades);
          }

          const uniqueSubjects = new Set();

          const mergedData = [
            ...subjectsResponse.data.subjects,
            ...arrearsWithSemester
          ].filter(item => {
            // Use subject_code for subjects and some unique identifier for arrears
            const key = item.subject_code || `${item.course_code}_${item.semester}`;
            if (!uniqueSubjects.has(key)) {
              uniqueSubjects.add(key);
              return true;
            }
            return false;
          });
          setSubjects(mergedData);
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

  const toggleEditMode = () => {
    if (!isEditMode) {
      setOriginalGrades({...grades});
    } else {
      setGrades({...originalGrades});
    }
    setIsEditMode(!isEditMode);
    console.log("session: "+student.can_fill_grades.split(" ")[1] + " " + student.can_fill_grades.split(" ")[2]);
  };

  const handleGradeChange = (subjectCode, grade) => {
    const upperGrade = grade.toUpperCase();
    if (allowedGrades.some(g => g.value === upperGrade) || grade === '') {
      setGrades(prev => ({
        ...prev,
        [subjectCode]: upperGrade
      }));
    }
  };

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
    
    if (!isFormComplete()) {
      alert('Please complete all grade fields and upload marksheet');
      return;
    }

    const formData = new FormData();
    formData.append('marksheet', marksheet);
    formData.append('studentId', studentId);
    formData.append('semester', student.can_fill_grades.split(" ")[0]);
    formData.append('grades', JSON.stringify(grades));
    formData.append('calculatedGpa', gpa);
    formData.append('totalCredits', totalCredits);
    formData.append('scoredCredits', scoredCredits);
    formData.append('semesterCredits', JSON.stringify(semesterCreditsUpdates));
    formData.append('clearedArrears', JSON.stringify(clearedArrears));
    formData.append('newArrears', JSON.stringify(newArrears));
    formData.append('session', student.can_fill_grades.split(" ")[1] + " " + student.can_fill_grades.split(" ")[2]);
    formData.append('isEdit', isEditMode);

    try {
      const response = await axios.post('http://localhost:5000/submit-grades', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setHasRejectedGrades(false);
        setRejectionDetails(null);
        alert(isEditMode ? "Grades Updated Successfully!" : "Grades Submitted Successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting grades:", error.response?.data || error.message);
      alert(`Failed to ${isEditMode ? 'update' : 'submit'} grades: ${error.response?.data?.error || error.message}`);
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
        
        <div className="flex-grow-1 p-4 overflow-auto position-relative">
          <div className="d-flex justify-content-end mb-3 me-3">
            <Button onClick={() => navigate('/student-dashboard')} className='fs-5 fw-bold'>
              Back
            </Button>
          </div>
          <div className="container-fluid">
            {(!isEditMode && student?.can_fill_grades !== '0' && gradesAlreadyFilled) ? (
              <Alert variant="info" className="mt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Grades for semester {student?.can_fill_grades} have already been submitted.
                    {!isEditMode && " Click 'Edit Grades' to make changes."}
                  </div>
                  <Button 
                    variant={isEditMode ? 'warning' : 'primary'} 
                    onClick={toggleEditMode}
                  >
                    {isEditMode ? (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel Edit
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Grades
                      </>
                    )}
                  </Button>
                </div>
              </Alert>
            ) : (
              <></>
            )}
            {hasRejectedGrades && (
  <Alert variant="danger" className="mt-4">
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Your grades submission has been rejected!</strong>
        <div className="mt-2">
          <p className="mb-1"><strong>Reason:</strong> {rejectionDetails.reason}</p>
          <p className="mb-1"><strong>Action required:</strong> Please review and resubmit your grades</p>
          <small className="text-muted">
            Rejected by {rejectionDetails.rejectedBy} on {rejectionDetails.rejectedAt}
          </small>
        </div>
      </div>
      <Button 
        variant="outline-danger"
        onClick={() => {
          setHasRejectedGrades(false);
          setIsEditMode(true);
        }}
      >
        <i className="bi bi-arrow-clockwise me-2"></i>
        Resubmit Grades
      </Button>
    </div>
  </Alert>
)}
            <>
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

                    {(gpa !== null || cgpa !== null) && (
                      <Card className="mb-4 shadow-sm border-success">
                        <Card.Body className="p-3">
                          <Row>
                            <Col md={6} className="border-end">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <h5 className="mb-0 text-success">
                                    <i className="bi bi-calculator-fill me-2"></i>
                                    Current Semester GPA
                                  </h5>
                                  <small className="text-muted">Based on entered grades</small>
                                </div>
                                <div>
                                  <Badge bg="success" className="fs-4 px-3 py-2">{gpa}</Badge>
                                </div>
                              </div>
                              <div className="small text-muted">
                                <span className="me-3">Credits: {scoredCredits}/{totalCredits}</span>
                              </div>
                            </Col>
                            <Col md={6}>
                              
                              {cgpa !== null && (
                                <>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                      <h5 className="mb-0 text-primary">
                                        <i className="bi bi-graph-up me-2"></i>
                                        Projected CGPA
                                      </h5>
                                      <small className="text-muted">Including previous semesters</small>
                                    </div>
                                    <div>
                                      <Badge bg="primary" className="fs-4 px-3 py-2">{cgpa}</Badge>
                                    </div>
                                  </div>
                                </>
                              )}
                              {Object.keys(semesterCreditsUpdates).length > 0 && (
                                <div className="mb-2">
                                  <h6 className="text-muted">Arrears Cleared:  {clearedArrears.length}</h6>
                                  
                                </div>
                              )}
                            </Col>
                          </Row>
                          <Alert variant="warning" className="mt-2 mb-0">
                            <small>
                              <i className="bi bi-exclamation-triangle-fill me-2"></i>
                              These are preliminary calculations. Final results will be confirmed after official verification.
                            </small>
                          </Alert>
                        </Card.Body>
                      </Card>
                    )}

                    <Card className="mb-4 shadow-sm">
                      <Card.Body>
                        <div className="d-flex flex-wrap gap-2">
                          {allowedGrades.map((grade, index) => (
                            <OverlayTrigger
                              key={index}
                              placement="top"
                              overlay={<Tooltip>{grade.description}</Tooltip>}
                            >
                              <Badge bg="light" text="dark" className="p-2 border d-flex align-items-center" style={{ cursor: 'help' }}>
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
                              <Table hover className="mb-0 border border-black">
                                <thead>
                                  <tr style={{ backgroundColor: '#0d6efd', color: 'white' }}>
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
                                      const isArrear = arrears.some(a => a.subject_code === subject.subject_code);
                                      const isCleared = clearedArrears.includes(subject.subject_code);
                                      const gradeValue = grades[subject.subject_code] || '';

                                      return (
                                        <tr 
                                          key={subject._id} 
                                          style={getRowStyle(subject)}
                                        >
                                          <td className="text-center">{index + 1}</td>
                                          <td className="fw-bold">
                                            {subject.subject_code}
                                            {isArrear && (
                                              <OverlayTrigger
                                                placement="right"
                                                overlay={<Tooltip>{isCleared ? 'Arrear cleared' : 'Pending arrear'}</Tooltip>}
                                              >
                                                <Badge bg={isCleared ? 'success' : 'danger'} className="ms-2">
                                                  {isCleared ? '✓' : 'Arrear'}
                                                </Badge>
                                              </OverlayTrigger>
                                            )}
                                          </td>
                                          <td>{subject.subject_name}</td>
                                          <td className="text-center">{subject.credits}</td>
                                          <td className="text-center">
                                            <Badge bg="info" className="text-uppercase">
                                              {subject.subject_type}
                                            </Badge>
                                          </td>
                                          <td>
                                            <div className="d-flex justify-content-center align-items-center">
                                              <Form.Control
                                                type="text"
                                                value={gradeValue}
                                                onChange={(e) => handleGradeChange(subject.subject_code, e.target.value)}
                                                className="text-center"
                                                style={{ width: '110px' }}
                                                placeholder="Enter grade"
                                                list={`gradeSuggestions-${index}`}
                                                disabled={(gradesAlreadyFilled && !isEditMode)||(hasRejectedGrades)}
                                                readOnly={gradesAlreadyFilled && !isEditMode}
                                              />
                                              <datalist id={`gradeSuggestions-${index}`}>
                                                {allowedGrades.map((grade, idx) => (
                                                  <option key={idx} value={grade.value}>{grade.description}</option>
                                                ))}
                                              </datalist>
                                              {isArrear && gradeValue && gradePoints[gradeValue] >= 5 && (
                                                <OverlayTrigger placement="right" overlay={<Tooltip>Arrear will be cleared</Tooltip>}>
                                                  <span className="ms-2 text-success"><i className="bi bi-check-circle-fill"></i></span>
                                                </OverlayTrigger>
                                              )}
                                            </div>
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
                                          style={{ display: 'none' }}
                                          disabled={(gradesAlreadyFilled && !isEditMode)||(hasRejectedGrades)}
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
                                {!isFormComplete() && (
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
                              <Button 
  variant="primary" 
  type="submit"
  className="px-4 py-2 rounded-pill"
  disabled={!isFormComplete() || (gradesAlreadyFilled && !isEditMode)}
>
  <i className="bi bi-send-fill me-2"></i>
  {hasRejectedGrades ? 'Resubmit Grades' : (gradesAlreadyFilled ? 'Update Grades' : 'Submit Grades & Marksheet')}
</Button>
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
              </>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeForm;