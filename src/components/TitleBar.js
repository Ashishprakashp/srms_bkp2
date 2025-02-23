import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './res/AnnaUniLogo.png';

export default function TitleBar() {
    return (
        <Navbar bg="primary" variant="dark" className="shadow-sm">
            <Container>
                <Navbar.Brand href="#" className="d-flex align-items-center">
                    <img
                        src={logo}
                        alt="Logo"
                        width="70"
                        height="70"
                        className="d-inline-block align-top me-3"
                    />
                    <div className="d-flex flex-column ms-5">
                        <span className="fw-bold fs-3">Student Record Management System</span>
                        <span className="fw-bold fs-6">Department of IST</span>
                    </div>
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}
