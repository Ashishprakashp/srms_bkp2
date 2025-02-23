import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/login.jpg';

const SideBar = () => {
    // State to manage dropdown visibility
    const [openFaculty, setOpenFaculty] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);
    const [openCourse, setOpenCourse] = useState(false);
    const [openGrade, setOpenGrade] = useState(false);

    return (
        <div className="d-flex vh-100">
            {/* Sidebar */}
            <div
                className="bg-dark text-white p-3"
                style={{
                    width: '250px',
                    height: '100%', // Full viewport height
                    position: 'sticky', // Sticky position
                    top: 0, // Stick to the top
                    overflowY: 'auto', // Enable scrolling if content overflows
                }}
            >
                <div className="text-center mb-3">
                    <Image
                        src={pl_image}
                        roundedCircle
                        className="border border-light mb-2"
                        style={{ width: '70px', height: '70px' }}
                        alt="Profile"
                    />
                    <h4>My Sidebar</h4>
                </div>

                <Nav className="flex-column">
                    {/* Home */}
                    <Nav.Link href="#" className="text-white mb-2">
                        Home
                    </Nav.Link>

                    {/* Faculty Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenFaculty(!openFaculty)}
                            aria-controls="faculty-collapse"
                            aria-expanded={openFaculty}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Faculty Management
                        </Nav.Link>
                        <Collapse in={openFaculty}>
                            <div id="faculty-collapse" className="ms-3">
                                <Nav.Link href="#" className="text-white">
                                    Create Faculty
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    Reset Faculty Password
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    View Faculty List
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Student Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenStudent(!openStudent)}
                            aria-controls="student-collapse"
                            aria-expanded={openStudent}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Student Management
                        </Nav.Link>
                        <Collapse in={openStudent}>
                            <div id="student-collapse" className="ms-3">
                                <Nav.Link href="#" className="text-white">
                                    Create Student
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    Reset Student Password
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    View Student List
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Course Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenCourse(!openCourse)}
                            aria-controls="course-collapse"
                            aria-expanded={openCourse}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Course Management
                        </Nav.Link>
                        <Collapse in={openCourse}>
                            <div id="course-collapse" className="ms-3">
                                <Nav.Link href="#" className="text-white">
                                    Add Course
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    Edit Course
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    View Course List
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Grade Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenGrade(!openGrade)}
                            aria-controls="grade-collapse"
                            aria-expanded={openGrade}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Grade Management
                        </Nav.Link>
                        <Collapse in={openGrade}>
                            <div id="grade-collapse" className="ms-3">
                                <Nav.Link href="#" className="text-white">
                                    Add Grades
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    Edit Grades
                                </Nav.Link>
                                <Nav.Link href="#" className="text-white">
                                    View Grades
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>
                </Nav>
            </div>
        </div>
    );
};

export default SideBar;