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
  const [arrears,setArrears] = useState([]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentId = sessionStorage.getItem('student');
        const response = await axios.get(`http://localhost:5000/student/${studentId}`, {
          withCredentials: true,
        });
        
        const { can_enroll, regulation } = response.data;
        setStudentData(response.data);
        setFormEnabled(can_enroll !== "0");
        
        if (can_enroll !== "0") {
          const sem_no = can_enroll.split(" ")[0];
          
          // Fetch both current semester and arrears
          const [semesterResponse, arrearsResponse] = await Promise.all([
            axios.get("http://localhost:5000/semester-details", {
              withCredentials: true,
              params: {
                course_name: branch,
                year: regulation,
                sem_no: sem_no,
              },
            }),
            axios.get(`http://localhost:5000/get-arrears/${studentId}`, {
              withCredentials: true,
            })
          ]);
  
          // Combine current semester subjects with arrears
          const currentSemesterSubjects = semesterResponse.data.subjects.map(subj => ({
            ...subj,
            is_arrear: false  // Mark all current semester subjects as non-arrears
          }));
  
          // Filter out arrears that are already in current semester (shouldn't happen but just in case)
          const currentSemesterCodes = new Set(currentSemesterSubjects.map(s => s.subject_code));
          const uniqueArrears = arrearsResponse.data.filter(
            arrear => !currentSemesterCodes.has(arrear.subject_code) && arrear.status==='active'
          );
          setArrears(uniqueArrears);
          // Combine both arrays
          const mergedData = [...currentSemesterSubjects, ...uniqueArrears];
          
          setSemesterData(mergedData);
          setSemesterNumber(can_enroll);
          console.log("Combined current semester and arrears:", mergedData);
        }
      } catch (error) {
        console.error('Error fetching enrollment details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudentDetails();
  }, [branch]);

  // Function to determine row style based on subject type
  // In the SemesterEnrollment component, modify the getRowStyle function:
const getRowStyle = (subject) => {
  // Check if subject exists in arrears array
  const isArrear = arrears.some(a => a.subject_code === subject.subject_code);
  
  // Base style with important flags
  const baseStyle = {
    '--bs-table-bg': getBackgroundColor(subject.subject_type),
    backgroundColor: `${getBackgroundColor(subject.subject_type)} !important`,
    background: `${getBackgroundColor(subject.subject_type)} !important`,
  };

  if (isArrear) {
    return {
      '--bs-table-bg': '#ffcccc',
      backgroundColor: '#ffcccc !important',
      background: '#ffcccc !important',
    };
  }

  return baseStyle;
};

// Add color mapping function
const getBackgroundColor = (type) => {
  switch(type) {
    case 'FC': return '#e3f2fd'; // Light blue
    case 'RMC': return '#fff3e0'; // Light purple
    case 'PCC': return '#e8f5e9'; // Light green
    case 'PEC': return '#f3e5f5'; // Light orange
    case 'EEC': return '#fce4ec'; // Light pink
    default: return 'transparent';
  }
};

 

  const enrollForSemester = async () => {
    try {
      const studentId = sessionStorage.getItem('student');
      const {branch,regulation,from_year,to_year} = studentData;
      const batch = from_year+"-"+to_year;
      await axios.post(`http://localhost:5000/student/enroll/${studentId}/${semesterNumber}`, {
        course_name: branch,
        year: regulation,
        sem_no: semesterNumber,
        batch: batch,
        arrears: arrears,
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
            <div className="d-flex justify-content-end mb-3 me-3">
                        <Button onClick={() => navigate('/student-dashboard')} className='fs-5 fw-bold'>
                          Back
                        </Button>
                      </div>
            <h3 className='fw-bold'>{semesterNumber ? `${branch} Semester ${semesterNumber} Enrollment` : ''}</h3>
            <Table  bordered hover className="rounded-3 mt-5">
              <thead className="table-primary fs-5">
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Subject Type</th>
                </tr>
              </thead>
              <tbody>
                {semesterData.map((subject, index) => (
                  <tr key={index} style={getRowStyle(subject)} className='fs-5'>
                    <td>{subject.subject_code}</td>
                    <td>{subject.subject_name}</td>
                    <td>{subject.credits}</td>
                    <td>
                      {subject.is_arrear ? 'ARREAR' : subject.subject_type}
                    </td>
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
              <h2 className="mb-4 fw-bold">This process is closed now!</h2>
              <Button variant="primary" className='fs-5 fw-bold' onClick={() => navigate('/student-dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </Container>
        )}
      </div>

      {/* Success Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); window.location.reload(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title className='fw-bold'>Enrollment Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body className='fs-5'>
          <p>You have successfully enrolled in Semester {semesterNumber}!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className='fs-5' onClick={() => window.location.reload()}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SemesterEnrollment;