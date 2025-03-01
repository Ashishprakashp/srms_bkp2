import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/login.jpg';

const SideBar = ({ onLogoutClick }) => {
    const [openFaculty, setOpenFaculty] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);
    const [openCourse, setOpenCourse] = useState(false);
    const [openGrade, setOpenGrade] = useState(false);

    return (
        <div className="d-flex vh-100">
            <div
                className="bg-dark text-white p-3"
                style={{
                    width: '250px',
                    height: '100%',
                    position: 'sticky',
                    top: 0,
                    overflowY: 'auto',
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
                    <h4>Admin</h4>
                </div>

                <Nav className="flex-column">
                    <Nav.Link href="/admin-dashboard" className="text-white mb-2">
                        Dashboard Home
                    </Nav.Link>

                    {/* Faculty Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenFaculty(!openFaculty)}
                            aria-controls="faculty-collapse"
                            aria-expanded={openFaculty}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                            href="admin-dashboard/faculty-mgmt"
                        >
                            Faculty Management
                        </Nav.Link>
                        <Collapse in={openFaculty}>
                            <div id="faculty-collapse" className="ms-3">
                                <Nav.Link href="#create-faculty" className="text-white">
                                    Create Faculty
                                </Nav.Link>
                                <Nav.Link href="#reset-faculty" className="text-white">
                                    Reset Password
                                </Nav.Link>
                                <Nav.Link href="#faculty-list" className="text-white">
                                    View Faculty
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
                            href="/admin-dashboard/student-mgmt"
                        >
                            Student Management
                        </Nav.Link>
                        <Collapse in={openStudent}>
                            <div id="student-collapse" className="ms-3">
                                <Nav.Link href="#create-student" className="text-white">
                                    Create Student
                                </Nav.Link>
                                <Nav.Link href="#reset-student" className="text-white">
                                    Reset Password
                                </Nav.Link>
                                <Nav.Link href="#student-list" className="text-white">
                                    View Students
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
                            href="/admin-dashboard/course-mgmt"
                        >
                            Course Management
                        </Nav.Link>
                        <Collapse in={openCourse}>
                            <div id="course-collapse" className="ms-3">
                                <Nav.Link href="#add-course" className="text-white">
                                    Add Course
                                </Nav.Link>
                                <Nav.Link href="#edit-course" className="text-white">
                                    Edit Course
                                </Nav.Link>
                                <Nav.Link href="#course-list" className="text-white">
                                    Course List
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
                                <Nav.Link href="#add-grades" className="text-white">
                                    Add Grades
                                </Nav.Link>
                                <Nav.Link href="#edit-grades" className="text-white">
                                    Edit Grades
                                </Nav.Link>
                                <Nav.Link href="#view-grades" className="text-white">
                                    View Grades
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Logout Section */}
                    <div className="mt-4 border-top pt-3">
                        <Nav.Link
                            onClick={onLogoutClick}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </Nav.Link>
                    </div>
                </Nav>
            </div>
        </div>
    );
};

export default SideBar;