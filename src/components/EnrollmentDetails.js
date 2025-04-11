import React, { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Button, Table, Pagination, Spinner, Modal, Form, FormGroup, FormLabel, FormControl, FormSelect } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBar from "./TitleBar.js";
import StudentSideBar from "./StudentSideBar.js";
import axios from "axios";

const EnrollmentDetails = () => {
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
        setSelectedSemester(response.data.semesters[0]);

        // Initialize sessionData and enrollmentStatus for each semester
        const initialSessionData = {};
        const initialEnrollmentStatus = {};
        response.data.semesters.forEach((semester) => {
          initialSessionData[semester] = { month: "", year: "" };
          initialEnrollmentStatus[semester] = false;
        });
        setSessionData(initialSessionData);
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
        console.log(response.data);
        const filteredStudents = response.data.filter(
          (student) =>
            student.branch === branch &&
            student.regulation === regulation &&
            student.from_year === from_year &&
            student.to_year === to_year &&
            student._class === _class
        );
        setStudents(filteredStudents);
        console.log(filteredStudents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [branch, regulation, from_year, to_year, _class]);

  // Handle navigation to a specific semester
  const handleSemesterNavigation = (semester) => {
    setSelectedSemester(semester);
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
            _class,
            from_year,
            to_year,
            sem_no: selectedSemester,
            session,
            initiated_by: sessionStorage.getItem("user"),
            status: "open",
            grades:false,
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
            _class,
            from_year,
            to_year,
            sem_no: selectedSemester,
            session,
            initiated_by: sessionStorage.getItem("user"),
            status: "complete",
            grades:false,
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
        grades:false
      });
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          can_enroll: selectedSemester,
          enrolled: 0,
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
        grades:false
      });
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          can_enroll: 0,
          enrolled: 0,
          grades:false
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
          grades:false,
        });
      } else {
        response = await axios.post("http://localhost:5000/disable-student-enroll", {
          register: registerno,
          sem_no: 0,
          grades:false,
        });
      }

      // Update the specific student in state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.studentId === registerno
            ? { ...student, can_enroll: val, enrolled: val ? val : 0 }
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

  // Filter students by semester
  const enrolledStudents = students.filter(
    
    (student) =>(student.enrolled?.toString()||"").startsWith(selectedSemester)
    
  );
  const pendingStudents = students.filter(
    (student) => !(student.enrolled?.toString()||"").startsWith(selectedSemester)
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
        <StudentSideBar />
        <Container fluid className="p-4" style={{ overflowY: "auto", height: "calc(100vh - 56px)" }}>
          <Button className="student-approval-back-btn" onClick={() => navigate('/student-enrollment')}>
                        Back
                      </Button>
          {/* Semester Navigation */}
          <Row className="mb-4">
            <Col>
              <Nav className="justify-content-center flex-wrap">
                {semesters.map((semester) => (
                  <Nav.Item key={semester} className="mb-2">
                    <Button
                      variant={selectedSemester === semester ? "primary" : "outline-primary"}
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
          {selectedSemester && (
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
                            value={sessionData[selectedSemester]?.month || ""}
                            disabled={isMonthDisabled}
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
                            value={sessionData[selectedSemester]?.year || ""}
                            disabled={isYearDisabled}
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
                  <h2>Enrolled Students (Semester {selectedSemester})</h2>
                  {enrolledStudents.length > 0 ? (
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
                            {/* <th>isEnabled?</th>
                            <th>isEnrolled?</th> */}
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentStudents(enrolledStudents, currentPageEnrolled).map((student) => (
                            <tr key={student.studentId}>
                              <td>{student.studentId}</td>
                              <td>{student.name}</td>
                              <td>{student.branch}</td>
                              <td>{student.regulation}</td>
                              <td>{student.from_year} - {student.to_year}</td>
                              <td>{student._class}</td>
                              {/* <td>{student.can_enroll!=='0' ? "Yes" : "No"}</td>
                              <td>{student.enrolled!=='0' ? "Yes" : "No"}</td> */}
                              <td>
                                <Button variant="primary" onClick={() => enableStudent(false, student.studentId)}>
                                  Revoke
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <Pagination>
                        {[...Array(Math.ceil(enrolledStudents.length / studentsPerPage)).keys()].map((number) => (
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
                  <h2>Enrollment-Pending Students (Semester {selectedSemester})</h2>
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
                            {/* <th>isEnabled?</th>
                            <th>isEnrolled?</th> */}
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
                              {/* <td>{student.can_enroll!=='0' ? "Yes" : "No"}</td>
                              <td>{student.enrolled!=='0' ? "Yes" : "No"}</td> */}
                              <td>
                                {student.can_enroll ? (
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

              {/* Enrollment Button */}
              <Row className="ms-4 me-4">
                <Button className="w-100 py-2" onClick={handleEnrollment}>
                  {enrollmentStatus[selectedSemester] ? "Close Enrollment" : "Open Enrollment"}
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
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default EnrollmentDetails;