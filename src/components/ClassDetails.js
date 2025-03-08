import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Pagination, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ClassDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branch, regulation, from_year, to_year, _class } = location.state;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10); // Number of students per page

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

  // Group students by filled status
  const filledStudents = students.filter((student) => student.filled === 1);
  const unfilledStudents = students.filter((student) => student.filled === 0);

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentFilledStudents = filledStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const currentUnfilledStudents = unfilledStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="p-4">
      <Button className="mb-4" onClick={() => navigate(-1)}>
        Back
      </Button>
      <h1 className="mb-4">
        {branch} - {regulation} ({from_year} - {to_year}) {_class}
      </h1>

      {/* Table for Filled Students */}
      <h2>Filled Students</h2>
      <Table striped bordered hover className="mb-4">
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
          {currentFilledStudents.map((student) => (
            <tr key={student.studentId}>
              <td>{student.studentId}</td>
              <td>{student.name}</td>
              <td>{student.branch}</td>
              <td>{student.regulation}</td>
              <td>
                {student.from_year} - {student.to_year}
              </td>
              <td>{student._class}</td>
              <td>{student.can_fill ? 'Yes' : 'No'}</td>
              <td>{student.filled ? 'Yes' : 'No'}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/student-details/${student.studentId}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Table for Unfilled Students */}
      <h2>Unfilled Students</h2>
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
            <th>Filled?</th>
          </tr>
        </thead>
        <tbody>
          {currentUnfilledStudents.map((student) => (
            <tr key={student.studentId}>
              <td>{student.studentId}</td>
              <td>{student.name}</td>
              <td>{student.branch}</td>
              <td>{student.regulation}</td>
              <td>
                {student.from_year} - {student.to_year}
              </td>
              <td>{student._class}</td>
              <td>{student.can_fill ? 'Yes' : 'No'}</td>
              <td>{student.filled ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        {[...Array(Math.ceil(students.length / studentsPerPage)).keys()].map((number) => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default ClassDetails;