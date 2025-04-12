import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/profile.jpg';
import "bootstrap-icons/font/bootstrap-icons.css";

const StudentSideBar = ({ onLogoutClick }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [openAcademic, setOpenAcademic] = useState(false);
    const [openCourses, setOpenCourses] = useState(false);

    return (
        <div className="d-flex vh-100 position-relative">
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
                {/* Hamburger Toggle - Now sticky within the sidebar */}
                {isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(false)}
                        className="btn position-sticky"
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
                        <Nav.Link href="/student-form" className="text-white text-center mb-3">
                            <i className="bi bi-person-vcard" style={{ fontSize: '1.75rem' }}></i>
                        </Nav.Link>
                    ) : (
                        <div className="mb-2">
                            <Nav.Link
                                href='/student-form'
                                className="text-white"
                                style={{ cursor: 'pointer' }}
                            >
                                Student Details Form
                            </Nav.Link>
                        </div>
                    )}

                    {/* Course Registration */}
                    {isCollapsed ? (
                        <Nav.Link href="/semester-enroll" className="text-white text-center mb-3">
                            <i className='bi-clipboard2-check' style={{ fontSize: '1.75rem' }}></i>
                        </Nav.Link>
                    ) : (
                        <div className="mb-2">
                            <Nav.Link
                                href='/semester-enroll'
                                className="text-white"
                                style={{ cursor: 'pointer' }}
                            >
                                Semester Enrollment
                            </Nav.Link>
                        </div>
                    )}

                    {/* Support */}
                    {isCollapsed ? (
                        <Nav.Link href="/student-dashboard/semforms" className="text-white text-center mb-3">
                            <i className="bi bi-book" style={{ fontSize: '1.75rem' }}></i>
                        </Nav.Link>
                    ) : (
                        <div className="mb-2">
                            <Nav.Link
                                href='/semforms'
                                className="text-white"
                                style={{ cursor: 'pointer' }}
                            >
                                Semester Grades Upload
                            </Nav.Link>
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
                                Logout
                            </Nav.Link>
                        )}
                    </div>
                </Nav>
            </div>
        </div>
    );
};

export default StudentSideBar;