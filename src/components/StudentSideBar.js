import React, { useState } from 'react';
import { Nav, Image, Collapse } from 'react-bootstrap';
import pl_image from './res/login.jpg';

const StudentSideBar = ({ onLogoutClick }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [openAcademic, setOpenAcademic] = useState(false);
    const [openCourses, setOpenCourses] = useState(false);

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
                    <h4>Student</h4>
                </div>

                <Nav className="flex-column">
                    <Nav.Link href="/student-dashboard" className="text-white mb-2">
                        Dashboard Home
                    </Nav.Link>

                    {/* Profile Management */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenProfile(!openProfile)}
                            aria-controls="profile-collapse"
                            aria-expanded={openProfile}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            My Profile
                        </Nav.Link>
                        <Collapse in={openProfile}>
                            <div id="profile-collapse" className="ms-3">
                                <Nav.Link href="#view-profile" className="text-white">
                                    View Profile
                                </Nav.Link>
                                <Nav.Link href="#edit-profile" className="text-white">
                                    Edit Profile
                                </Nav.Link>
                            </div>
                        </Collapse>
                    </div>

                    {/* Academic Records */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenAcademic(!openAcademic)}
                            aria-controls="academic-collapse"
                            aria-expanded={openAcademic}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Academic Records
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

                    {/* Course Registration */}
                    <div className="mb-2">
                        <Nav.Link
                            onClick={() => setOpenCourses(!openCourses)}
                            aria-controls="courses-collapse"
                            aria-expanded={openCourses}
                            className="text-white"
                            style={{ cursor: 'pointer' }}
                        >
                            Course Registration
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

                    {/* Support */}
                    <Nav.Link href="#support" className="text-white mb-2">
                        Help & Support
                    </Nav.Link>

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

export default StudentSideBar;