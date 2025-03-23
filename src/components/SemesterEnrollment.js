import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Spinner, Table, Modal } from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import StudentSideBar from './StudentSideBar.js';
import { useNavigate } from 'react-router-dom';

const SemesterEnrollment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formEnabled, setFormEnabled] = useState(false);
  const [semesterData, setSemesterData] = useState([]);
  const [semesterNumber, setSemesterNumber] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [studentData,setStudentData] = useState([]);
  const branch = sessionStorage.getItem('branch');
  const isBtech = branch.startsWith('BTECH');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });
        const { can_enroll } = response.data;
        setStudentData(response.data);
        setFormEnabled(can_enroll !== "0");
        const sem_no = can_enroll ? can_enroll.split(" ")[0] : null;
        if (can_enroll !== "0") {
          const semester_response = await axios.get("http://localhost:5000/semester-details", {
            withCredentials: true,
            params: {
              course_name: branch,
              year: response.data.regulation,
              sem_no: sem_no,
            },
          });
          setSemesterData(semester_response.data.subjects);
          setSemesterNumber(can_enroll);
        }
      } catch (error) {
        console.error('Error fetching enrollment details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetails();
  }, [branch]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const enrollForSemester = async () => {
    try {
      const studentId = sessionStorage.getItem('student');
      const {branch,regulation,from_year,to_year} = studentData;
      const batch = from_year+"-"+to_year;
      await axios.post(`http://localhost:5000/student/enroll/${studentId}/${semesterNumber}`, {
        course_name: branch,
        year: regulation,
        sem_no: semesterNumber,
        batch: batch
      }, {
        withCredentials: true,
      });
      setShowModal(true); // Show success modal
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  return (
    <div>
      <TitleBar />
      <div className="d-flex flex-grow-1">
        <StudentSideBar />
        {formEnabled ? (
          <Container fluid className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
            <h3>{semesterNumber ? `${branch} Semester ${semesterNumber} Enrollment` : ''}</h3>
            <Table striped bordered hover className="rounded-3 mt-5">
              <thead className="table-primary">
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Subject Type</th>
                </tr>
              </thead>
              <tbody>
                {semesterData.map((subject, index) => (
                  <tr key={index}>
                    <td>{subject.subject_code}</td>
                    <td>{subject.subject_name}</td>
                    <td>{subject.credits}</td>
                    <td>{subject.subject_type}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button className='btn btn-primary float-end px-5 fw-bold mt-5' onClick={enrollForSemester}>
              Enroll
            </Button>
          </Container>
        ) : (
          <Container fluid className="p-4 d-flex align-items-center justify-content-center" style={{ height: 'calc(100vh - 56px)' }}>
            <div className="text-center">
              <h2 className="mb-4">This process is closed now!</h2>
              <Button variant="primary" onClick={() => navigate('/student-dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </Container>
        )}
      </div>

      {/* Success Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); window.location.reload(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enrollment Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have successfully enrolled in Semester {semesterNumber}!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => window.location.reload()}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SemesterEnrollment;
