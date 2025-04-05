import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/login.jpg';
import "bootstrap-icons/font/bootstrap-icons.css";

const SideBar = ({ onLogoutClick }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [openFaculty, setOpenFaculty] = useState(false);
    const [openStudent, setOpenStudent] = useState(false);
    const [openCourse, setOpenCourse] = useState(false);
    const [openGrade, setOpenGrade] = useState(false);

    return (
        <>
            {/* Hamburger menu button (visible when sidebar is collapsed) */}
            {isCollapsed && (
                <button 
                    onClick={() => setIsCollapsed(false)}
                    className="btn position-fixed"
                    style={{
                        top: '10px',
                        left: '10px',
                        zIndex: 1000,
                        fontSize: '1.5rem',
                        padding: '20px',
                        backgroundColor: 'transparent',
                        border: 'none'
                    }}
                >
                    <i className="bi bi-list text-white" style={{ fontSize: '1.75rem' }}></i>
                </button>
            )}

            <div className="d-flex vh-100">
                <div
                    className="bg-dark text-white p-3"
                    style={{
                        width: isCollapsed ? '80px' : '250px',
                        height: '100%',
                        position: 'sticky',
                        top: 0,
                        overflow: isCollapsed ? 'hidden' : 'auto',
                        transition: 'width 0.3s ease',
                    }}
                >
                    {!isCollapsed && (
                        <div className="text-center mb-3">
                            <Image
                                src={pl_image}
                                roundedCircle
                                className="border border-light mb-2"
                                style={{ width: '70px', height: '70px' }}
                                alt="Profile"
                            />
                            <h4>Admin</h4>
                            <button 
                                onClick={() => setIsCollapsed(true)}
                                className="btn btn-link text-white position-absolute"
                                style={{ 
                                    right: '10px', 
                                    top: '10px',
                                    backgroundColor: 'transparent',
                                    border: 'none'
                                }}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    )}

                    <Nav className="flex-column">
                        {/* Dashboard Home */}
                        {isCollapsed ? (
                            <Nav.Link href="/admin-dashboard" className="text-white text-center mb-3">
                                <i className="bi bi-house-door" style={{ fontSize: '1.75rem' }}></i>
                            </Nav.Link>
                        ) : (
                            <Nav.Link href="/admin-dashboard" className="text-white mb-2">
                                Dashboard Home
                            </Nav.Link>
                        )}

                        {/* Faculty Management */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenFaculty(!openFaculty)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-person-vcard" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
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
                                    <i className={`bi ${openFaculty ? 'bi-chevron-up' : 'bi-chevron-down'} float-end`}></i>
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
                        )}

                        {/* Student Management */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenStudent(!openStudent)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-people" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
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
                                    <i className={`bi ${openStudent ? 'bi-chevron-up' : 'bi-chevron-down'} float-end`}></i>
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
                        )}

                        {/* Course Management */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenCourse(!openCourse)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-book" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
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
                                    <i className={`bi ${openCourse ? 'bi-chevron-up' : 'bi-chevron-down'} float-end`}></i>
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
                        )}

                        {/* Grade Management */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenGrade(!openGrade)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-clipboard2-check" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <Nav.Link
                                    onClick={() => setOpenGrade(!openGrade)}
                                    aria-controls="grade-collapse"
                                    aria-expanded={openGrade}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Grade Management
                                    <i className={`bi ${openGrade ? 'bi-chevron-up' : 'bi-chevron-down'} float-end`}></i>
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
                        )}

                        {/* Logout Section */}
                        <div className="mt-4 border-top pt-3">
                            {isCollapsed ? (
                                <div className="text-center">
                                    <div 
                                        onClick={onLogoutClick}
                                        className="text-white"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="bi bi-box-arrow-right" style={{ fontSize: '1.75rem' }}></i>
                                    </div>
                                </div>
                            ) : (
                                <Nav.Link
                                    onClick={onLogoutClick}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </Nav.Link>
                            )}
                        </div>
                    </Nav>
                </div>
            </div>
        </>
    );
};

export default SideBar;