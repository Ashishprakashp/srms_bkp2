import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const GradeForm = () => {
  const  studentId  = sessionStorage.getItem('student'); // Get studentId from the URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        setStudent(response.data);
        console.log(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student details:', error);
        setError('Failed to fetch student details');
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Student Grades</h1>
      {student ? (
        <>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Student ID:</strong> {student.studentId}</p>
          <p><strong>Branch:</strong> {student.branch}</p>
          <p><strong>Regulation:</strong> {student.regulation}</p>
          <p><strong>Class:</strong> {student._class}</p>

          {/* Display message based on can_fill_grades and grades_filled */}
          {student.can_fill_grades !== '0' ? (
            <div style={{ color: 'green', fontWeight: 'bold' }}>
              You are enabled to fill grades.
            </div>
          ) : (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              You are not enabled to fill grades.
            </div>
          )}
        </>
      ) : (
        <div>No student data found.</div>
      )}
    </div>
  );
};

export default GradeForm;