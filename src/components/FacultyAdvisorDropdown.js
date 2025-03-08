import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Form } from "react-bootstrap";

const FacultyAdvisorDropdown = ({ selectedUser, handleInputChange }) => {
    const [facultyAdvisors, setFacultyAdvisors] = useState([]);

    // Fetch faculty advisors
    useEffect(() => {
        const fetchFacultyAdvisors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/faculty/advisors');
                setFacultyAdvisors(response.data);
            } catch (error) {
                console.error('Error fetching faculty advisors:', error);
            }
        };

        fetchFacultyAdvisors();
    }, []);

    return (
        <Form.Select
            name="facultyAdvisor"
            value={selectedUser.facultyAdvisor}
            onChange={handleInputChange}
        >
            <option>--Faculty Advisor--</option>
            {facultyAdvisors.map((faculty) => (
                <option key={faculty.facultyId} value={faculty.facultyId}>
                    {faculty.name} ({faculty.facultyId})
                </option>
            ))}
        </Form.Select>
    );
};

export default FacultyAdvisorDropdown;