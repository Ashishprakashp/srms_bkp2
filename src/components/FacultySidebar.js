import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/profile.jpg';
import "bootstrap-icons/font/bootstrap-icons.css";

const FacultySideBar = ({ onLogoutClick }) => {
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
                            <h4>Faculty</h4>
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
                            <Nav.Link href="/faculty-dashboard" className="text-white text-center mb-3">
                                <i className="bi bi-house-door" style={{ fontSize: '1.75rem' }}></i>
                            </Nav.Link>
                        ) : (
                            <Nav.Link href="/faculty-dashboard" className="text-white mb-2">
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
                                    <Nav.Link href="/student-report" className="text-white text-center">
                                    <i className="bi bi-person-vcard" style={{ fontSize: '1.75rem' }}></i>
                                    </Nav.Link>
                                    
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
                                    href="/student-report"
                                >
                                    Generate Report
                                    
                                </Nav.Link>
                                
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
                                    <Nav.Link href="/student-query-system" className="text-white text-center ">
                                    <i className="bi bi-people" style={{ fontSize: '1.75rem' }}></i>
                                    </Nav.Link>
                                    
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
                                    href="/student-query-system"
                                >
                                    Query Student Data
                                    
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

export default FacultySideBar;