import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/login.jpg';
import "bootstrap-icons/font/bootstrap-icons.css";

const StudentSideBar = ({ onLogoutClick }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [openAcademic, setOpenAcademic] = useState(false);
    const [openCourses, setOpenCourses] = useState(false);

    return (
        <>
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="text-center" style={{ width: '100%' }}>
                                <Image
                                    src={pl_image}
                                    roundedCircle
                                    className="border border-light mb-2"
                                    style={{ width: '70px', height: '70px' }}
                                    alt="Profile"
                                />
                                <h4>Student</h4>
                            </div>
                            <button 
                                onClick={() => setIsCollapsed(true)}
                                className="btn btn-link text-white"
                                style={{ 
                                    position: 'absolute', 
                                    right: '10px', 
                                    top: '10px',
                                    backgroundColor: 'transparent',
                                    border: 'none'
                                }}
                            >
                                <i className="bi bi-x-lg text-white"></i>
                            </button>
                        </div>
                    )}

                    <Nav className="flex-column">
                        {/* Dashboard Home */}
                        {isCollapsed ? (
                            <Nav.Link href="/student-dashboard" className="text-white text-center mb-3">
                                <i className="bi bi-house-door" style={{ fontSize: '1.75rem' }}></i>
                            </Nav.Link>
                        ) : (
                            <Nav.Link href="/student-dashboard" className="text-white mb-2">
                                Dashboard Home
                            </Nav.Link>
                        )}

                        {/* Profile Management */}
                        {isCollapsed ? (
                            <Nav.Link href="/student-profile" className="text-white text-center mb-3">
                                <i className="bi bi-person" style={{ fontSize: '1.75rem' }}></i>
                            </Nav.Link>
                        ) : (
                            <div className="mb-2">
                                <Nav.Link
                                    href='/student-profile'
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    My Profile
                                </Nav.Link>
                            </div>
                        )}

                        {/* Academic Records */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenAcademic(!openAcademic)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-folder" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <Nav.Link
                                    onClick={() => setOpenAcademic(!openAcademic)}
                                    className="text-white d-flex justify-content-between align-items-center"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Academic Records
                                    <i className={`bi ${openAcademic ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                </Nav.Link>
                                <Collapse in={openAcademic}>
                                    <div id="academic-collapse" className="ms-3">
                                        <Nav.Link href="#current-grades" className="text-white">
                                            Current Grades
                                        </Nav.Link>
                                        <Nav.Link href="#academic-transcript" className="text-white">
                                            Academic Transcript
                                        </Nav.Link>
                                        <Nav.Link href="#attendance-record" className="text-white">
                                            Attendance Record
                                        </Nav.Link>
                                    </div>
                                </Collapse>
                            </div>
                        )}

                        {/* Course Registration */}
                        {isCollapsed ? (
                            <div className="text-center mb-3">
                                <div 
                                    onClick={() => setOpenCourses(!openCourses)}
                                    className="text-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-book" style={{ fontSize: '1.75rem' }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <Nav.Link
                                    onClick={() => setOpenCourses(!openCourses)}
                                    className="text-white d-flex justify-content-between align-items-center"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Course Registration
                                    <i className={`bi ${openCourses ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                </Nav.Link>
                                <Collapse in={openCourses}>
                                    <div id="courses-collapse" className="ms-3">
                                        <Nav.Link href="#register-courses" className="text-white">
                                            Register Courses
                                        </Nav.Link>
                                        <Nav.Link href="#registered-courses" className="text-white">
                                            My Courses
                                        </Nav.Link>
                                        <Nav.Link href="#course-schedule" className="text-white">
                                            Class Schedule
                                        </Nav.Link>
                                    </div>
                                </Collapse>
                            </div>
                        )}

                        {/* Support */}
                        {isCollapsed ? (
                            <Nav.Link href="#support" className="text-white text-center mb-3">
                                <i className="bi bi-question-circle" style={{ fontSize: '1.75rem' }}></i>
                            </Nav.Link>
                        ) : (
                            <Nav.Link href="#support" className="text-white mb-2">
                                Help & Support
                            </Nav.Link>
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

export default StudentSideBar;