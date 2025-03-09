// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Table, Pagination, Button, Spinner, Modal } from 'react-bootstrap';
// import axios from 'axios';
// import TitleBar from './TitleBar.js';
// import SideBar from './SideBar.js';

// const ClassDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { branch, regulation, from_year, to_year, _class } = location.state;

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [studentsPerPage] = useState(10); // Number of students per page
//   const [selectedStudent, setSelectedStudent] = useState(null); // For popup
//   const [showModal, setShowModal] = useState(false); // For popup visibility

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/student-class/all');
//         const filteredStudents = response.data.filter(
//           (student) =>
//             student.branch === branch &&
//             student.regulation === regulation &&
//             student.from_year === from_year &&
//             student.to_year === to_year &&
//             student._class === _class
//         );
//         setStudents(filteredStudents);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching students:', error);
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [branch, regulation, from_year, to_year, _class]);

//   // Group students by filled status
//   const filledStudents = students.filter((student) => student.filled === 1 && student.approved === 0);
//   const unfilledStudents = students.filter((student) => student.filled === 0 && student.approved === 0);
//   const approvedStudents = students.filter((student) => student.approved === 1);


//   // Pagination logic
//   const indexOfLastStudent = currentPage * studentsPerPage;
//   const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
//   const currentFilledStudents = filledStudents.slice(indexOfFirstStudent, indexOfLastStudent);
//   const currentUnfilledStudents = unfilledStudents.slice(indexOfFirstStudent, indexOfLastStudent);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handleApprove = async () => {
//     try {
//       // Collect all file paths from the selected student
//       const filePaths = [
//         selectedStudent.personalInformation?.passportPhoto,
//         selectedStudent.education?.xMarksheet,
//         selectedStudent.education?.xiiMarksheet,
//         selectedStudent.education?.ugProvisionalCertificate,
//         selectedStudent.entranceAndWorkExperience?.scorecard,
//         ...(selectedStudent.entranceAndWorkExperience?.workExperience?.map(work => work.certificate) || []),
//       ].filter(Boolean); // Remove undefined/null values
  
//       // Call the backend API to move files
//       const response = await axios.post('http://localhost:5000/move-files', { filePaths });

//       const response2 = await axios.post('http://localhost:5000/move-student', {
//         registerNumber: selectedStudent.personalInformation.register
//       });
  
//       if (response.status === 200) {
//         alert('Files moved successfully!');
//         setShowModal(false); // Close the modal
//       }
//     } catch (error) {
//       console.error('Error moving files:', error);
//       alert('Failed to move files.');
//     }
//   };

//   // Handle View button click
//   const handleView = async (student) => {
//     try {
//       // Fetch student details from the API
//       const response = await axios.get(`http://localhost:5000/students-details/${student.studentId}`);
//       console.log(response.data);
//       // Set the fetched student details as selectedStudent
//       setSelectedStudent(response.data);
      
//       // Show the modal
//       setShowModal(true);
//     } catch (error) {
//       console.error('Error fetching student details:', error);
//       // Optionally, show an error message to the user
//     }
//   };

//   const renderFileLink = (label, filePath) => {
//     if (!filePath) return null;
  
//     // Construct the correct URL
//     const fileUrl = `http://localhost:5000/file?path=${encodeURIComponent(filePath)}`;
  
//     return (
//       <div className="mt-2">
//         <strong>{label}:</strong><br />
//         <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
//           View {label}
//         </a>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//       </div>
//     );
//   }

//   return (
//     <>
//       <TitleBar/>
//       <div className="d-flex vh-100">
//         <SideBar />
    
//         <div className="flex-grow-1 p-4" style={{ marginLeft: '20px', marginRight: '20px' }}>
//           <Button className="mb-4" onClick={() => navigate(-1)}>
//             Back
//           </Button>
//           <h1 className="mb-4">
//             {branch} - {regulation} ({from_year} - {to_year}) {_class}
//           </h1>

//           {/* Table for Filled Students */}
//           <h2>Filled Students</h2>
//           <Table striped bordered hover className="mb-4 w-100">
//             <thead>
//               <tr>
//                 <th>Student ID</th>
//                 <th>Name</th>
//                 <th>Branch</th>
//                 <th>Regulation</th>
//                 <th>Batch</th>
//                 <th>Class</th>
//                 <th>isEnabled?</th>
//                 <th>Filled?</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentFilledStudents.map((student) => (
//                 <tr key={student.studentId}>
//                   <td>{student.studentId}</td>
//                   <td>{student.name}</td>
//                   <td>{student.branch}</td>
//                   <td>{student.regulation}</td>
//                   <td>
//                     {student.from_year} - {student.to_year}
//                   </td>
//                   <td>{student._class}</td>
//                   <td>{student.can_fill ? 'Yes' : 'No'}</td>
//                   <td>{student.filled ? 'Yes' : 'No'}</td>
//                   <td>
//                     <Button
//                       variant="primary"
//                       onClick={() => handleView(student)}
//                     >
//                       View
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>

//           {/* Table for Unfilled Students */}
//           <h2>Unfilled Students</h2>
//           <Table striped bordered hover className="w-100">
//             <thead>
//               <tr>
//                 <th>Student ID</th>
//                 <th>Name</th>
//                 <th>Branch</th>
//                 <th>Regulation</th>
//                 <th>Batch</th>
//                 <th>Class</th>
//                 <th>isEnabled?</th>
//                 <th>Filled?</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentUnfilledStudents.map((student) => (
//                 <tr key={student.studentId}>
//                   <td>{student.studentId}</td>
//                   <td>{student.name}</td>
//                   <td>{student.branch}</td>
//                   <td>{student.regulation}</td>
//                   <td>
//                     {student.from_year} - {student.to_year}
//                   </td>
//                   <td>{student._class}</td>
//                   <td>{student.can_fill ? 'Yes' : 'No'}</td>
//                   <td>{student.filled ? 'Yes' : 'No'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>

          

// // Then add this new table section before the Pagination component:
// <h2>Approved Students</h2>
// <Table striped bordered hover className="mb-4 w-100">
//   <thead>
//     <tr>
//       <th>Student ID</th>
//       <th>Name</th>
//       <th>Branch</th>
//       <th>Regulation</th>
//       <th>Batch</th>
//       <th>Class</th>
//       <th>Approved</th>
//       <th>Action</th>
//     </tr>
//   </thead>
//   <tbody>
//     {approvedStudents.map((student) => (
//       <tr key={student.studentId}>
//         <td>{student.studentId}</td>
//         <td>{student.name}</td>
//         <td>{student.branch}</td>
//         <td>{student.regulation}</td>
//         <td>{student.from_year} - {student.to_year}</td>
//         <td>{student._class}</td>
//         <td>{student.approved ? 'Yes' : 'No'}</td>
//         <td>
//           <Button
//             variant="primary"
//             onClick={() => handleView(student)}
//           >
//             View
//           </Button>
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </Table>

//           {/* Pagination */}
//           <Pagination>
//             {[...Array(Math.ceil(students.length / studentsPerPage)).keys()].map((number) => (
//               <Pagination.Item
//                 key={number + 1}
//                 active={number + 1 === currentPage}
//                 onClick={() => paginate(number + 1)}
//               >
//                 {number + 1}
//               </Pagination.Item>
//             ))}
//           </Pagination>

//           {/* Popup for Student Details */}
//           <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//             <Modal.Header closeButton>
//               <Modal.Title>Student Details</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//               {selectedStudent && (
//                 <div>
//                   {/* Personal Information */}
//                   <h5>Personal Information</h5>
//                   <p><strong>Name:</strong> {selectedStudent.personalInformation?.name}</p>
//                   <p><strong>Register Number:</strong> {selectedStudent.personalInformation?.register}</p>
//                   <p><strong>Date of Birth:</strong> {selectedStudent.personalInformation?.dob && new Date(selectedStudent.personalInformation.dob).toLocaleDateString()}</p>
//                   <p><strong>Gender:</strong> {selectedStudent.personalInformation?.sex}</p>
//                   <p><strong>Blood Group:</strong> {selectedStudent.personalInformation?.blood}</p>
//                   <p><strong>Community:</strong> {selectedStudent.personalInformation?.community}</p>
//                   <p><strong>Cutoff:</strong> {selectedStudent.personalInformation?.cutoff}</p>
//                   <p><strong>Special Category:</strong> {selectedStudent.personalInformation?.splcategory}</p>
//                   <p><strong>Scholarship:</strong> {selectedStudent.personalInformation?.scholarship}</p>
//                   <p><strong>Volunteer Work:</strong> {selectedStudent.personalInformation?.volunteer}</p>
//                   <p><strong>Contact:</strong> {selectedStudent.personalInformation?.contact}</p>
//                   <p><strong>Email:</strong> {selectedStudent.personalInformation?.mail}</p>
//                   <p><strong>Father's Assistance:</strong> {selectedStudent.personalInformation?.fa}</p>
//                   <p><strong>Passport Photo:</strong></p>
//                   {selectedStudent.personalInformation?.passportPhoto && (
//                     <img
//                       src={`http://localhost:5000/file?path=${encodeURIComponent(selectedStudent.personalInformation.passportPhoto)}`}
//                       alt="Passport Photo"
//                       style={{ width: '100px', height: '100px' }}
//                     />
//                   )}

//                   {/* Family Information */}
//                   <h5 className="mt-4">Family Information</h5>
//                   <p><strong>Father's Name:</strong> {selectedStudent.familyInformation?.fatherName}</p>
//                   <p><strong>Father's Occupation:</strong> {selectedStudent.familyInformation?.fatherOcc}</p>
//                   <p><strong>Father's Income:</strong> {selectedStudent.familyInformation?.fatherInc}</p>
//                   <p><strong>Mother's Name:</strong> {selectedStudent.familyInformation?.motherName}</p>
//                   <p><strong>Mother's Occupation:</strong> {selectedStudent.familyInformation?.motherOcc}</p>
//                   <p><strong>Mother's Income:</strong> {selectedStudent.familyInformation?.motherInc}</p>
//                   <p><strong>Parent's Address:</strong> {selectedStudent.familyInformation?.parentAddr}</p>
//                   <p><strong>Parent's Contact:</strong> {selectedStudent.familyInformation?.parentContact}</p>
//                   <p><strong>Parent's Email:</strong> {selectedStudent.familyInformation?.parentMail}</p>
//                   <p><strong>Guardian's Address:</strong> {selectedStudent.familyInformation?.guardianAddr}</p>
//                   <p><strong>Guardian's Contact:</strong> {selectedStudent.familyInformation?.guardianContact}</p>
//                   <p><strong>Guardian's Email:</strong> {selectedStudent.familyInformation?.guardianMail}</p>

//                   {/* Education Details */}
//                   <h5 className="mt-4">Education Details</h5>
//                   <h6>Class X</h6>
//                   <p><strong>School:</strong> {selectedStudent.education?.xSchool}</p>
//                   <p><strong>Board:</strong> {selectedStudent.education?.xBoard}</p>
//                   <p><strong>Year of Passing:</strong> {selectedStudent.education?.xYear}</p>
//                   <p><strong>Percentage:</strong> {selectedStudent.education?.xPercentage}</p>
//                   <p><strong>Marksheet:</strong></p>
//                   {selectedStudent.education?.xMarksheet && (
//                     renderFileLink('X Marksheet', selectedStudent.education.xMarksheet)
//                   )}

//                   <h6 className="mt-3">Class XII</h6>
//                   <p><strong>School:</strong> {selectedStudent.education?.xiiSchool}</p>
//                   <p><strong>Board:</strong> {selectedStudent.education?.xiiBoard}</p>
//                   <p><strong>Year of Passing:</strong> {selectedStudent.education?.xiiYear}</p>
//                   <p><strong>Percentage:</strong> {selectedStudent.education?.xiiPercentage}</p>
//                   <p><strong>Marksheet:</strong></p>
//                   {selectedStudent.education?.xiiMarksheet && (
//                     renderFileLink('XII Marksheet', selectedStudent.education.xiiMarksheet)
//                   )}

//                   {branch !== 'BTECH' && (
//                     <>
//                       {/* UG Details */}
//                       <h6 className="mt-3">UG Details</h6>
//                       <p><strong>College:</strong> {selectedStudent.education?.ugCollege}</p>
//                       <p><strong>Year of Passing:</strong> {selectedStudent.education?.ugYear}</p>
//                       <p><strong>Percentage:</strong> {selectedStudent.education?.ugPercentage}</p>
//                       <p><strong>Provisional Certificate:</strong></p>
//                       {selectedStudent.education?.ugProvisionalCertificate && (
//                         renderFileLink('UG Provisional Certificate', selectedStudent.education.ugProvisionalCertificate)
//                       )}

//                       {/* Entrance Exam Details */}
//                       <h5 className="mt-4">Entrance Exam Details</h5>
//                       <p><strong>Entrance Exam:</strong> {selectedStudent.entranceAndWorkExperience?.entrance}</p>
//                       <p><strong>Registration Number:</strong> {selectedStudent.entranceAndWorkExperience?.entranceRegister}</p>
//                       <p><strong>Score:</strong> {selectedStudent.entranceAndWorkExperience?.entranceScore}</p>
//                       <p><strong>Year:</strong> {selectedStudent.entranceAndWorkExperience?.entranceYear}</p>
//                       <p><strong>Scorecard:</strong></p>
//                       {selectedStudent.entranceAndWorkExperience?.scorecard && (
//                         renderFileLink('Scorecard', selectedStudent.entranceAndWorkExperience.scorecard)
//                       )}

//                       {/* Work Experience */}
//                       {selectedStudent.entranceAndWorkExperience?.workExperience?.length > 0 && (
//                         <>
//                           <h5 className="mt-4">Work Experience</h5>
//                           {selectedStudent.entranceAndWorkExperience.workExperience.map((work, index) => (
//                             <div key={index} className="mb-3">
//                               <p><strong>Employer:</strong> {work.employerName}</p>
//                               <p><strong>Role:</strong> {work.role}</p>
//                               <p><strong>Experience (Years):</strong> {work.expYears}</p>
//                               <p><strong>Certificate:</strong></p>
//                               {work.certificate && (
//                                 renderFileLink('Certificate', work.certificate)
//                               )}
//                             </div>
//                           ))}
//                         </>
//                       )}
//                     </>
//                   )}

//                   {/* Declaration */}
//                   <h5 className="mt-4">Declaration</h5>
//                   <p><strong>Accepted:</strong> {selectedStudent.acceptance ? 'Yes' : 'No'}</p>
//                 </div>
//               )}
//             </Modal.Body>
//             <Modal.Footer>
//     <Button variant="secondary" onClick={() => setShowModal(false)}>
//       Close
//     </Button>
//     <Button variant="primary" className="ms-3" onClick={handleApprove}>
//       Approve
//     </Button>
//   </Modal.Footer>
//           </Modal>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ClassDetails;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Pagination, Button, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';

const ClassDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branch, regulation, from_year, to_year, _class } = location.state;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Separate pagination states for each table
  const [currentPageFilled, setCurrentPageFilled] = useState(1);
  const [currentPageUnfilled, setCurrentPageUnfilled] = useState(1);
  const [currentPageApproved, setCurrentPageApproved] = useState(1);
  const [studentsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/student-class/all');
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
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [branch, regulation, from_year, to_year, _class]);

  // Group students
  const filledStudents = students.filter((student) => student.filled === 1 && student.approved === 0);
  const unfilledStudents = students.filter((student) => student.filled === 0 && student.approved === 0);
  const approvedStudents = students.filter((student) => student.approved === 1);

  // Pagination functions
  const paginateFilled = (pageNumber) => setCurrentPageFilled(pageNumber);
  const paginateUnfilled = (pageNumber) => setCurrentPageUnfilled(pageNumber);
  const paginateApproved = (pageNumber) => setCurrentPageApproved(pageNumber);

  // Get current students for each table
  const getCurrentStudents = (students, currentPage) => {
    const indexOfLast = currentPage * studentsPerPage;
    const indexOfFirst = indexOfLast - studentsPerPage;
    return students.slice(indexOfFirst, indexOfLast);
  };

  const handleApprove = async () => {
    try {
      // File moving logic
      const filePaths = [
        selectedStudent.personalInformation?.passportPhoto,
        selectedStudent.education?.xMarksheet,
        selectedStudent.education?.xiiMarksheet,
        selectedStudent.education?.ugProvisionalCertificate,
        selectedStudent.entranceAndWorkExperience?.scorecard,
        ...(selectedStudent.entranceAndWorkExperience?.workExperience?.map(work => work.certificate) || []),
      ].filter(Boolean);

      await axios.post('http://localhost:5000/move-files', { filePaths });
      await axios.post('http://localhost:5000/move-student', {
        registerNumber: selectedStudent.personalInformation.register
      });

      // Update approval status
      await axios.patch(`http://localhost:5000/students/${selectedStudent.studentId}/approve`, { approved: 1 });
      
      // Update local state
      setStudents(students.map(student => 
        student.studentId === selectedStudent.studentId 
          ? { ...student, approved: 1 } 
          : student
      ));

      alert('Student approved successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve student.');
    }
  };

  const handleView = async (student) => {
    try {
      const response = await axios.get(`http://localhost:5000/students-details/${student.studentId}`);
      setSelectedStudent(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const renderFileLink = (label, filePath) => {
    if (!filePath) return null;
    const fileUrl = `http://localhost:5000/file?path=${encodeURIComponent(filePath)}`;
    return (
      <div className="mt-2">
        <strong>{label}:</strong><br />
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
          View {label}
        </a>
      </div>
    );
  };

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
    <>
      <TitleBar/>
      <div className="d-flex vh-100">
        <SideBar />
    
        <div className="flex-grow-1 p-4" style={{ marginLeft: '20px', marginRight: '20px' }}>
          <Button className="mb-4" onClick={() => navigate(-1)}>
            Back
          </Button>
          <h1 className="mb-4">
            {branch} - {regulation} ({from_year} - {to_year}) {_class}
          </h1>

          {/* Filled Students Table */}
          <h2>Filled Students</h2>
          <Table striped bordered hover className="mb-4 w-100">
            {/* Table Header */}
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Regulation</th>
                <th>Batch</th>
                <th>Class</th>
                <th>isEnabled?</th>
                <th>Filled?</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentStudents(filledStudents, currentPageFilled).map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.branch}</td>
                  <td>{student.regulation}</td>
                  <td>{student.from_year} - {student.to_year}</td>
                  <td>{student._class}</td>
                  <td>{student.can_fill ? 'Yes' : 'No'}</td>
                  <td>{student.filled ? 'Yes' : 'No'}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleView(student)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {[...Array(Math.ceil(filledStudents.length / studentsPerPage)).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPageFilled}
                onClick={() => paginateFilled(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>

          {/* Unfilled Students Table */}
          <h2>Unfilled Students</h2>
          <Table striped bordered hover className="mb-4 w-100">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Regulation</th>
                <th>Batch</th>
                <th>Class</th>
                <th>isEnabled?</th>
                <th>Filled?</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentStudents(unfilledStudents, currentPageUnfilled).map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.branch}</td>
                  <td>{student.regulation}</td>
                  <td>{student.from_year} - {student.to_year}</td>
                  <td>{student._class}</td>
                  <td>{student.can_fill ? 'Yes' : 'No'}</td>
                  <td>{student.filled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {[...Array(Math.ceil(unfilledStudents.length / studentsPerPage)).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPageUnfilled}
                onClick={() => paginateUnfilled(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>

          {/* Approved Students Table */}
          <h2>Approved Students</h2>
          <Table striped bordered hover className="mb-4 w-100">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Regulation</th>
                <th>Batch</th>
                <th>Class</th>
                <th>Approved</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentStudents(approvedStudents, currentPageApproved).map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.branch}</td>
                  <td>{student.regulation}</td>
                  <td>{student.from_year} - {student.to_year}</td>
                  <td>{student._class}</td>
                  <td>{student.approved ? 'Yes' : 'No'}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleView(student)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {[...Array(Math.ceil(approvedStudents.length / studentsPerPage)).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPageApproved}
                onClick={() => paginateApproved(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>

          {/* Student Details Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Student Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedStudent && (
                <div>
                  {/* Personal Information */}
                  <h5>Personal Information</h5>
                  <p><strong>Name:</strong> {selectedStudent.personalInformation?.name}</p>
                  <p><strong>Register Number:</strong> {selectedStudent.personalInformation?.register}</p>
                  <p><strong>Date of Birth:</strong> {selectedStudent.personalInformation?.dob && new Date(selectedStudent.personalInformation.dob).toLocaleDateString()}</p>
                  <p><strong>Gender:</strong> {selectedStudent.personalInformation?.sex}</p>
                  <p><strong>Blood Group:</strong> {selectedStudent.personalInformation?.blood}</p>
                  <p><strong>Community:</strong> {selectedStudent.personalInformation?.community}</p>
                  <p><strong>Cutoff:</strong> {selectedStudent.personalInformation?.cutoff}</p>
                  <p><strong>Special Category:</strong> {selectedStudent.personalInformation?.splcategory}</p>
                  <p><strong>Scholarship:</strong> {selectedStudent.personalInformation?.scholarship}</p>
                  <p><strong>Volunteer Work:</strong> {selectedStudent.personalInformation?.volunteer}</p>
                  <p><strong>Contact:</strong> {selectedStudent.personalInformation?.contact}</p>
                  <p><strong>Email:</strong> {selectedStudent.personalInformation?.mail}</p>
                  <p><strong>Father's Assistance:</strong> {selectedStudent.personalInformation?.fa}</p>
                  <p><strong>Passport Photo:</strong></p>
                  {selectedStudent.personalInformation?.passportPhoto && (
                    <img
                      src={`http://localhost:5000/file?path=${encodeURIComponent(selectedStudent.personalInformation.passportPhoto)}`}
                      alt="Passport Photo"
                      style={{ width: '100px', height: '100px' }}
                    />
                  )}

                  {/* Family Information */}
                  <h5 className="mt-4">Family Information</h5>
                  <p><strong>Father's Name:</strong> {selectedStudent.familyInformation?.fatherName}</p>
                  <p><strong>Father's Occupation:</strong> {selectedStudent.familyInformation?.fatherOcc}</p>
                  <p><strong>Father's Income:</strong> {selectedStudent.familyInformation?.fatherInc}</p>
                  <p><strong>Mother's Name:</strong> {selectedStudent.familyInformation?.motherName}</p>
                  <p><strong>Mother's Occupation:</strong> {selectedStudent.familyInformation?.motherOcc}</p>
                  <p><strong>Mother's Income:</strong> {selectedStudent.familyInformation?.motherInc}</p>
                  <p><strong>Parent's Address:</strong> {selectedStudent.familyInformation?.parentAddr}</p>
                  <p><strong>Parent's Contact:</strong> {selectedStudent.familyInformation?.parentContact}</p>
                  <p><strong>Parent's Email:</strong> {selectedStudent.familyInformation?.parentMail}</p>
                  <p><strong>Guardian's Address:</strong> {selectedStudent.familyInformation?.guardianAddr}</p>
                  <p><strong>Guardian's Contact:</strong> {selectedStudent.familyInformation?.guardianContact}</p>
                  <p><strong>Guardian's Email:</strong> {selectedStudent.familyInformation?.guardianMail}</p>

                  {/* Education Details */}
                  <h5 className="mt-4">Education Details</h5>
                  <h6>Class X</h6>
                  <p><strong>School:</strong> {selectedStudent.education?.xSchool}</p>
                  <p><strong>Board:</strong> {selectedStudent.education?.xBoard}</p>
                  <p><strong>Year of Passing:</strong> {selectedStudent.education?.xYear}</p>
                  <p><strong>Percentage:</strong> {selectedStudent.education?.xPercentage}</p>
                  <p><strong>Marksheet:</strong></p>
                  {selectedStudent.education?.xMarksheet && (
                    renderFileLink('X Marksheet', selectedStudent.education.xMarksheet)
                  )}

                  <h6 className="mt-3">Class XII</h6>
                  <p><strong>School:</strong> {selectedStudent.education?.xiiSchool}</p>
                  <p><strong>Board:</strong> {selectedStudent.education?.xiiBoard}</p>
                  <p><strong>Year of Passing:</strong> {selectedStudent.education?.xiiYear}</p>
                  <p><strong>Percentage:</strong> {selectedStudent.education?.xiiPercentage}</p>
                  <p><strong>Marksheet:</strong></p>
                  {selectedStudent.education?.xiiMarksheet && (
                    renderFileLink('XII Marksheet', selectedStudent.education.xiiMarksheet)
                  )}

                  {branch !== 'BTECH' && (
                    <>
                      {/* UG Details */}
                      <h6 className="mt-3">UG Details</h6>
                      <p><strong>College:</strong> {selectedStudent.education?.ugCollege}</p>
                      <p><strong>Year of Passing:</strong> {selectedStudent.education?.ugYear}</p>
                      <p><strong>Percentage:</strong> {selectedStudent.education?.ugPercentage}</p>
                      <p><strong>Provisional Certificate:</strong></p>
                      {selectedStudent.education?.ugProvisionalCertificate && (
                        renderFileLink('UG Provisional Certificate', selectedStudent.education.ugProvisionalCertificate)
                      )}

                      {/* Entrance Exam Details */}
                      <h5 className="mt-4">Entrance Exam Details</h5>
                      <p><strong>Entrance Exam:</strong> {selectedStudent.entranceAndWorkExperience?.entrance}</p>
                      <p><strong>Registration Number:</strong> {selectedStudent.entranceAndWorkExperience?.entranceRegister}</p>
                      <p><strong>Score:</strong> {selectedStudent.entranceAndWorkExperience?.entranceScore}</p>
                      <p><strong>Year:</strong> {selectedStudent.entranceAndWorkExperience?.entranceYear}</p>
                      <p><strong>Scorecard:</strong></p>
                      {selectedStudent.entranceAndWorkExperience?.scorecard && (
                        renderFileLink('Scorecard', selectedStudent.entranceAndWorkExperience.scorecard)
                      )}

                      {/* Work Experience */}
                      {selectedStudent.entranceAndWorkExperience?.workExperience?.length > 0 && (
                        <>
                          <h5 className="mt-4">Work Experience</h5>
                          {selectedStudent.entranceAndWorkExperience.workExperience.map((work, index) => (
                            <div key={index} className="mb-3">
                              <p><strong>Employer:</strong> {work.employerName}</p>
                              <p><strong>Role:</strong> {work.role}</p>
                              <p><strong>Experience (Years):</strong> {work.expYears}</p>
                              <p><strong>Certificate:</strong></p>
                              {work.certificate && (
                                renderFileLink('Certificate', work.certificate)
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {/* Declaration */}
                  <h5 className="mt-4">Declaration</h5>
                  <p><strong>Accepted:</strong> {selectedStudent.acceptance ? 'Yes' : 'No'}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleApprove}>
                Approve
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default ClassDetails;