import React, { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Button, Table, Pagination, Spinner, Modal, Form, FormGroup, FormLabel, FormControl, FormSelect, Badge, Alert} from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";
import axios from "axios";

const ClassGradesDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [currentPageEnrolled, setCurrentPageEnrolled] = useState(1);
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [studentsPerPage] = useState(5);
  const { branch, regulation, from_year, to_year, _class } = location.state;
  const [course_id, setCourseId] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState({});
  const [isMonthDisabled, setIsMonthDisabled] = useState(false);
  const [isYearDisabled, setIsYearDisabled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [session,setSession] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);
const [studentGrades, setStudentGrades] = useState(null);
const [marksheetUrl, setMarksheetUrl] = useState(null);

const [approvedStudents, setApprovedStudents] = useState([]);
const [approvedLoading, setApprovedLoading] = useState(true);
const [month_,setMonth]=useState('');
const [year_,setYear]=useState('');
const [path,setPath]=useState(null);

  // Fetch semester numbers from the database
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get("http://localhost:5000/get-semester-numbers", {
          params: {
            course_name: branch,
            regulation: regulation,
          },
        });
        setSemesters(response.data.semesters);
        setSelectedSemester(response.data.semesters[0].toString());
        
        // Initialize sessionData and enrollmentStatus for each semester
        const initialSessionData = {};
        const initialEnrollmentStatus = {};
        response.data.semesters.forEach((semester) => {
          initialSessionData[semester] = { month: "", year: "" };
          initialEnrollmentStatus[semester] = false;
        });
        setSessionData(initialSessionData);
        setSession(sessionData[Number(selectedSemester)].month+ " "+ sessionData[Number(selectedSemester)].year);
        setEnrollmentStatus(initialEnrollmentStatus);
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };

    fetchSemesters();
  }, [branch, regulation]);

  // Fetch enrollment data (month, year, and status) for the selected semester
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      if (!selectedSemester) return;

      try {
        const response = await axios.get("http://localhost:5000/get-enrollment-data", {
          params: {
            branch,
            regulation,
            from_year,
            to_year,
            _class,
            sem_no: selectedSemester,

          },
        });

        if (response.data) {
          const { month, year, status } = response.data;
          console.log("MONTH: "+month);
          setMonth(month);
          setYear(year);
          console.log("YEAR: "+year);
          // Update sessionData and enrollmentStatus for the selected semester
          setSessionData((prevData) => ({
            ...prevData,
            [selectedSemester]: { month, year },
          }));
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [selectedSemester]: status === "open",
          }));

          // Disable month and year fields if enrollment is open
          setIsMonthDisabled(status === "open");
          setIsYearDisabled(status === "open");
        } else {
          // If no enrollment data is found, reset the fields and enable them
          setSessionData((prevData) => ({
            ...prevData,
            [selectedSemester]: { month: "", year: "" },
          }));
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [selectedSemester]: false,
          }));
          setIsMonthDisabled(false);
          setIsYearDisabled(false);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);

        // If an error occurs, reset the fields and enable them
        setSessionData((prevData) => ({
          ...prevData,
          [selectedSemester]: { month: "", year: "" },
        }));
        setEnrollmentStatus((prevStatus) => ({
          ...prevStatus,
          [selectedSemester]: false,
        }));
        setIsMonthDisabled(false);
        setIsYearDisabled(false);
      }
    };

    fetchEnrollmentData();
  }, [selectedSemester, branch, regulation, from_year, to_year, _class]);

  // Fetch all students from the database
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/student-class/all");
        const filteredStudents = response.data.filter(
          (student) =>
            student.branch === branch &&
            student.regulation === regulation &&
            student.from_year === from_year &&
            student.to_year === to_year &&
            student._class === _class
        );
        setStudents(filteredStudents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [branch, regulation, from_year, to_year, _class]);


  useEffect(() => {
    if (selectedSemester) {
      fetchApprovedStudents();
    }
  }, [selectedSemester]); // Re-fetch when semester changes
  console.log("Session data: "+sessionData[Number(selectedSemester)]);
  const fetchApprovedStudents = async () => {
    try {
      setApprovedLoading(true);
      const response = await axios.get('http://localhost:5000/approved-students', {
        params: {
          branch,
          regulation,
          semester: selectedSemester,
          session: month_+" "+ year_,
        }
      });
      console.log(response.data);
      setApprovedStudents(response.data);
    } catch (error) {
      console.error('Error fetching approved students:', error);
    } finally {
      setApprovedLoading(false);
    }
  };

  const handleView = async (studentId) => {
    try {
      setLoading(true);
      setSelectedStudent(studentId);
      
      // Fetch student details
      const student = students.find(s => s.studentId === studentId);
      
      console.log("Semester: "+selectedSemester);
      console.log("Session: "+sessionData[Number(selectedSemester)].month+ " "+ sessionData[Number(selectedSemester)].year);
      // Fetch grade details for the selected semester
      const sess = sessionData[Number(selectedSemester)].month+ " "+ sessionData[Number(selectedSemester)].year;
      const gradesResponse = await axios.get(
        `http://localhost:5000/student-grades/${studentId}/${selectedSemester}/${sess}`
      );
      
      const gradeData = gradesResponse.data;
      
      if (!gradeData.courses || gradeData.courses.length === 0) {
        throw new Error('No grade data found for this semester');
      }
      
      setStudentGrades({
        ...gradeData,
        studentName: student.name,
        studentId: studentId,
        semester: selectedSemester
      });
      
      // Generate marksheet URL if available
      if (gradeData.marksheetPath) {
        setPath(gradeData.marksheetPath);
        try {
          const marksheetResponse = await axios.get(
            `http://localhost:5000/marksheet/${studentId}/${selectedSemester}`,
            { responseType: 'blob' }
          );
          const url = URL.createObjectURL(marksheetResponse.data);
          setMarksheetUrl(url);
        } catch (error) {
          console.error('Error loading marksheet:', error);
          setMarksheetUrl(null);
        }
      } else {
        setMarksheetUrl(null);
      }
      
      setShowGradeModal(true);
    } catch (error) {
      console.error('Error fetching grade details:', error);
      alert(`Failed to load grade details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post('http://localhost:5000/admin/approve-grades', {
        studentId: selectedStudent,
        semester: selectedSemester,
        session: sessionData[Number(selectedSemester)].month+ " "+ sessionData[Number(selectedSemester)].year,
        approvedBy: sessionStorage.getItem('user')
      });
      
      // Update local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.studentId === selectedStudent 
            ? { ...student, grades_approved: '1' } 
            : student
        )
      );
      // if(path){
      //   const filePaths = [path];
      //   await axios.post('http://localhost:5000/move-files', { filePaths });
      // }
      
      setShowGradeModal(false);
      alert('Grades approved successfully');
    } catch (error) {
      console.error('Error approving grades:', error);
      alert('Failed to approve grades');
    }
  };
  
  const handleReject = async () => {
    try {
      await axios.post('http://localhost:5000/admin/reject-grades', {
        studentId: selectedStudent,
        semester: selectedSemester,
        session:sessionData[Number(selectedSemester)].month+ " "+ sessionData[Number(selectedSemester)].year,
        rejectedBy: sessionStorage.getItem('user')
      });
      
      // Update local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.studentId === selectedStudent 
            ? { 
                ...student, 
                grades_filled: '0',
                can_fill_grades: selectedSemester // Allow them to resubmit
              } 
            : student
        )
      );
      
      setShowGradeModal(false);
      alert('Grades rejected. Student can resubmit.');
    } catch (error) {
      console.error('Error rejecting grades:', error);
      alert('Failed to reject grades');
    }
  };


  // Handle navigation to a specific semester
  const handleSemesterNavigation = (semester) => {
    setSelectedSemester(semester.toString());
    setCurrentPageEnrolled(1);
    setCurrentPagePending(1);
  };

  // Handle month change
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSessionData((prevData) => ({
      ...prevData,
      [selectedSemester]: { ...prevData[selectedSemester], month },
    }));
  };

  // Handle year change
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSessionData((prevData) => ({
      ...prevData,
      [selectedSemester]: { ...prevData[selectedSemester], year },
    }));
  };

  // Handle enrollment opening/closing
  const handleEnrollment = async () => {
    const { month, year } = sessionData[selectedSemester];
    if (!month || !year) {
      alert("Enter the month and year of the session!");
    } else {
      setShowModal(true);
    }
  };

  // Handle confirmation of enrollment opening/closing
  const handleConfirmation = async (confirmed) => {
    if (confirmed) {
      const { month, year } = sessionData[selectedSemester];
      const session = `${month} ${year}`;
  
      if (!enrollmentStatus[selectedSemester]) {
        // Check if any other semester's enrollment is already open (only when opening a new enrollment)
        const isAnotherSemesterOpen = Object.keys(enrollmentStatus).some(
          (semester) => semester !== selectedSemester && enrollmentStatus[semester]
        );
  
        if (isAnotherSemesterOpen) {
          alert("Another semester's enrollment is already open. Please close it before opening a new one.");
          return;
        }
  
        // Open enrollment
        try {
          await axios.post("http://localhost:5000/admin/set-enrollment", {
            branch,
            regulation,
            from_year,
            to_year,
            sem_no: selectedSemester,
            session,
            initiated_by: sessionStorage.getItem("user"),
            status: "open",
            grades:true,
          }, { withCredentials: true });
  
          await enableAll();
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [selectedSemester]: true,
          }));
          setIsMonthDisabled(true);
          setIsYearDisabled(true);
        } catch (error) {
          console.log("Error during enrollment!", error);
        }
      } else {
        // Close enrollment
        try {
          await axios.post("http://localhost:5000/admin/set-enrollment", {
            branch,
            regulation,
            from_year,
            to_year,
            sem_no: selectedSemester,
            session,
            initiated_by: sessionStorage.getItem("user"),
            status: "complete",
            grades:true
          }, { withCredentials: true });
          await disableAll();
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [selectedSemester]: false,
          }));
          setIsMonthDisabled(false);
          setIsYearDisabled(false);
        } catch (error) {
          console.log("Error closing enrollment!", error);
        }
      }
    }
    setShowModal(false);
  };

  // Enable all students for the selected semester
  const enableAll = async () => {
    try {
      const { month, year } = sessionData[selectedSemester];
      await axios.post(`http://localhost:5000/student/enrollment/enable-all/${selectedSemester}`, {
        branch,
        year: regulation,
        from_year,
        to_year,
        _class,
        sess_month: month,
        sess_year: year,
        grades:true
      });
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          can_fill_grades: selectedSemester,
          grades_filled: '0',
        }))
      );
    } catch (error) {
      console.log("Error enabling students!", error);
    }
  };

  // Disable all students for the selected semester
  const disableAll = async () => {
    try {
      await axios.post(`http://localhost:5000/student/enrollment/disable-all/${selectedSemester}`, {
        branch,
        year: regulation,
        from_year,
        to_year,
        _class,
        grades:true
      });
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          can_fill_grades: '0',
        }))
      );
    } catch (error) {
      console.log("Error disabling students!", error);
    }
  };

  // Revoke enrollment for all students in the selected semester
  const revokeAll = async () => {
    try {
      const response = await axios.post("http://localhost:5000/student/enrollment/revoke-all", {
        branch: branch,
        year: regulation,
        from_year: from_year,
        to_year: to_year,
        _class: _class,
      });
      console.log("revoke: " + response.data);
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.enrolled === selectedSemester
            ? { ...student, can_enroll: 0, enrolled: 0 }
            : student
        )
      );
    } catch (error) {
      console.log("Error revoking students!", error);
    }
  };

  // Enable/disable a specific student
  const enableStudent = async (val, registerno) => {
    try {
      let response;
      if (val) {
        response = await axios.post("http://localhost:5000/enable-student-enroll", {
          register: registerno,
          sem_no: selectedSemester,
          grades:true,
        });
      } else {
        response = await axios.post("http://localhost:5000/disable-student-enroll", {
          register: registerno,
          sem_no: 0,
          grades:true,
        });
      }

      // Update the specific student in state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.studentId === registerno
            ? { ...student, can_fill_grades: val?selectedSemester:'0' }
            : student
        )
      );

      console.log(response.data);
    } catch (error) {
      console.log("Error toggling student enable state:", error);
    }
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  //console.log("Current session: "+month_+" "+year_);
  // Filter students by semester
  const gradeFilledStudents = students.filter(
    (student) => student.grades_filled === selectedSemester && student.grades_approved!==month_+" "+year_
  );
  const pendingStudents = students.filter(
    (student) => student.grades_filled !== selectedSemester && student.grades_approved!==month_+" "+year_
  );

  // Pagination functions
  const paginateEnrolled = (pageNumber) => setCurrentPageEnrolled(pageNumber);
  const paginatePending = (pageNumber) => setCurrentPagePending(pageNumber);

  // Get current students for each table
  const getCurrentStudents = (students, currentPage) => {
    const indexOfLast = currentPage * studentsPerPage;
    const indexOfFirst = indexOfLast - studentsPerPage;
    return students.slice(indexOfFirst, indexOfLast);
  };

  return (
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1">
        <SideBar />
        <Container fluid className="p-4" style={{ overflowY: "auto", height: "calc(100vh - 56px)" }}>
          {/* Semester Navigation */}
          <Row className="mb-4">
            <Col>
              <Nav className="justify-content-center flex-wrap">
                {semesters.map((semester) => (
                  <Nav.Item key={semester} className="mb-2">
                    <Button
                      variant={selectedSemester === semester.toString() ? "primary" : "outline-primary"}
                      className="mx-1"
                      onClick={() => handleSemesterNavigation(semester)}
                    >
                      Semester {semester}
                    </Button>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
          </Row>

          {/* Render tables based on the selected semester */}
          {Number(selectedSemester) && (
            <>
              <Row>
                              <Col>
                                <Form>
                                  <Row className="align-items-center">
                                    <Col>
                                      <FormGroup className="mb-3">
                                        <FormLabel>MONTH:</FormLabel>
                                        <FormSelect
                                          name="session_month"
                                          onChange={handleMonthChange}
                                          value={sessionData[Number(selectedSemester)]?.month || ""}
                                          disabled={(sessionData[Number(selectedSemester)].month==='')?false:true}
                                        >
                                          <option value="">Select Month</option>
                                          <option value="NOV">NOV</option>
                                          <option value="APR">APR</option>
                                        </FormSelect>
                                      </FormGroup>
                                    </Col>
                                    <Col>
                                      <FormGroup className="mb-3">
                                        <FormLabel>YEAR:</FormLabel>
                                        <FormControl
                                          name="session_year"
                                          type="number"
                                          placeholder="YEAR"
                                          onChange={handleYearChange}
                                          value={sessionData[Number(selectedSemester)]?.year || ""}
                                          disabled={(sessionData[Number(selectedSemester)].year.length!==4)?false:true}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                </Form>
                              </Col>
                            </Row>
              {/* Enrolled Students Table */}
              <Row className="mb-4">
                <Col>
                  <h2>Grades Filled Students (Semester {selectedSemester})</h2>
                  {gradeFilledStudents.length > 0 ? (
                    <>
                      <button className="btn btn-danger float-end mb-5" onClick={revokeAll}>Revoke All</button>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Regulation</th>
                            <th>Batch</th>
                            <th>Class</th>
                            <th>isEnabled?</th>
                            <th>isFilled?</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentStudents(gradeFilledStudents, currentPageEnrolled).map((student) => (
                            <tr key={student.studentId}>
                              <td>{student.studentId}</td>
                              <td>{student.name}</td>
                              <td>{student.branch}</td>
                              <td>{student.regulation}</td>
                              <td>{student.from_year} - {student.to_year}</td>
                              <td>{student._class}</td>
                              <td>{student.can_fill_grades!=='0' ? "Yes" : "No"}</td>
                              <td>{student.grades_filled!=='0' ? "Yes" : "No"}</td>
                              <td>
                                <Button variant="primary" onClick={() => handleView(student.studentId)}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <Pagination>
                        {[...Array(Math.ceil(gradeFilledStudents.length / studentsPerPage)).keys()].map((number) => (
                          <Pagination.Item
                            key={number + 1}
                            active={number + 1 === currentPageEnrolled}
                            onClick={() => paginateEnrolled(number + 1)}
                          >
                            {number + 1}
                          </Pagination.Item>
                        ))}
                      </Pagination>
                    </>
                  ) : (
                    <p>No Students</p>
                  )}
                </Col>
              </Row>

              {/* Enrollment-Pending Students Table */}
              <Row className="mb-4">
                <Col>
                  <h2>Grade-Filling-Pending Students (Semester {selectedSemester})</h2>
                  {pendingStudents.length > 0 ? (
                    <>
                      <button className="btn btn-success float-end ms-5 me-4 mb-5" onClick={enableAll}>Enable All</button>
                      <button className="btn btn-danger float-end mb-5" onClick={disableAll}>Disable All</button>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Regulation</th>
                            <th>Batch</th>
                            <th>Class</th>
                            <th>isEnabled?</th>
                            <th>isFilled?</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentStudents(pendingStudents, currentPagePending).map((student) => (
                            <tr key={student.studentId}>
                              <td>{student.studentId}</td>
                              <td>{student.name}</td>
                              <td>{student.branch}</td>
                              <td>{student.regulation}</td>
                              <td>{student.from_year} - {student.to_year}</td>
                              <td>{student._class}</td>
                              <td>{student.can_fill_grades==="0" ? "No" : "Yes"}</td>
                              <td>{student.grades_filled==="0" ? "No" : "Yes"}</td>
                              <td>
                                {student.can_fill_grades!=='0' ? (
                                  <button className="btn btn-danger" onClick={() => enableStudent(false, student.studentId)}>
                                    Disable
                                  </button>
                                ) : (
                                  <button className="btn btn-success" onClick={() => enableStudent(true, student.studentId)}>
                                    Enable
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <Pagination>
                        {[...Array(Math.ceil(pendingStudents.length / studentsPerPage)).keys()].map((number) => (
                          <Pagination.Item
                            key={number + 1}
                            active={number + 1 === currentPagePending}
                            onClick={() => paginatePending(number + 1)}
                          >
                            {number + 1}
                          </Pagination.Item>
                        ))}
                      </Pagination>
                    </>
                  ) : (
                    <p>No Students</p>
                  )}
                </Col>
              </Row>

              {/* Approved Students Table */}
{/* Approved Students Table */}
<Row className="mb-4">
  <Col>
    <h2>Approved Students (Semester {selectedSemester})</h2>
    {approvedLoading ? (
      <Spinner animation="border" />
    ) : approvedStudents.length > 0 ? (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Student ID</th>
            {/* <th>Name</th> */}
            <th>GPA</th>
            <th>Approved On</th>
            <th>Approved By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {approvedStudents.map((student) => {
            // Handle both Map and plain object formats
            const semesterData = student.semesterSubmissions instanceof Map
              ? student.semesterSubmissions.get(selectedSemester)
              : student.semesterSubmissions[selectedSemester];
            
            return (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                {/* <td>{student.name}</td> */}
                <td>{semesterData?.gpa || 'N/A'}</td>
                <td>
                  {semesterData?.verifiedAt 
                    ? new Date(semesterData.verifiedAt).toLocaleString() 
                    : 'N/A'}
                </td>
                <td>{semesterData?.verifiedBy || 'N/A'}</td>
                <td>
                <Button variant="primary" onClick={() => handleView(student.studentId)}>
                                  View
                                </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    ) : (
      <p>No approved students for this semester</p>
    )}
  </Col>
</Row>

              {/* Enrollment Button */}
              <Row className="ms-4 me-4">
                <Button className="w-100 py-2" onClick={handleEnrollment}>
                  {enrollmentStatus[selectedSemester] ? "Close Grades Enrollment" : "Open Grades Enrollment"}
                </Button>
              </Row>

              {/* Confirmation Modal */}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Enrollment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {!enrollmentStatus[selectedSemester] ? (
                    <p>Are you sure you want to open enrollment?</p>
                  ) : pendingStudents.length > 0 ? (
                    <p>{pendingStudents.length} students have not enrolled. Are you sure you want to close enrollment?</p>
                  ) : (
                    <p>All students have enrolled. Are you sure you want to close enrollment?</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => handleConfirmation(false)}>
                    No
                  </Button>
                  <Button variant="primary" onClick={() => handleConfirmation(true)}>
                    Yes
                  </Button>
                </Modal.Footer>
              </Modal>
              {/* Grade Details Modal */}
<Modal 
  show={showGradeModal} 
  onHide={() => setShowGradeModal(false)}
  size="lg"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      Grade Details - {studentGrades?.studentName} (Semester {selectedSemester})
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {loading ? (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Loading grade details...</p>
      </div>
    ) : (
      <>
        <Row className="mb-3">
          <Col md={6}>
            <h5>Student Information</h5>
            <p><strong>ID:</strong> {studentGrades?.studentId}</p>
            <p><strong>Name:</strong> {studentGrades?.studentName}</p>
            <p><strong>Semester:</strong> {selectedSemester}</p>
            <p><strong>GPA:</strong> {studentGrades?.gpa}</p>
            <p><strong>Submitted On:</strong> {new Date(studentGrades?.submissionDate).toLocaleString()}</p>
          </Col>
          <Col md={6}>
            <h5>Course Grades</h5>
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades?.courses?.map((course, index) => (
                  <tr 
                    key={index} 
                    className={course.isArrear ? 'table-warning' : ''}
                  >
                    <td>
                      {course.courseCode}
                      {course.isArrear && (
                        <Badge bg="danger" className="ms-2">Arrear Attempt</Badge>
                      )}
                    </td>
                    <td>
                      {course.grade}
                      
                    </td>
                    <td>
                      {course.isArrear ? (
                        <>
                          <div>Re-enrolled</div>
                          <div className="small text-muted">
                            Originally from: {course.originalSemester}
                          </div>
                        </>
                      ) : 'Regular'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <h5>Marksheet</h5>
            {marksheetUrl ? (
              <div className="border rounded p-2">
                <embed 
                  src={marksheetUrl} 
                  type="application/pdf" 
                  width="100%" 
                  height="400px"
                />
                <div className="mt-2">
                  <Badge bg="info">
                    Verified: {studentGrades?.verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                No marksheet uploaded for this semester
              </Alert>
            )}
          </Col>
        </Row>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
      Close
    </Button>
    {!studentGrades?.verified && (
      <>
        <Button variant="danger" onClick={handleReject}>
          <i className="bi bi-x-circle-fill me-1"></i> Reject
        </Button>
        <Button variant="success" onClick={handleApprove}>
          <i className="bi bi-check-circle-fill me-1"></i> Approve
        </Button>
      </>
    )}
  </Modal.Footer>
</Modal>
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default ClassGradesDetails;