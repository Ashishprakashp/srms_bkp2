import React, { useState } from "react";
import { nanoid } from "nanoid";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Button, Table, Card } from "react-bootstrap";
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";
import { useNavigate } from "react-router-dom";
import Folder from "./res/folder.png";
import './AdminDashboard.css';
import { useEffect } from "react";
import axios from 'axios';

export default function FacultyLoginCr() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [fileName, setFileName] = useState("");
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
        facultyId: "",
        title: "--Title--",
        courtesy_title: "--Courtesy Title--",
        name: "",
        designation: "--Designation--",
        additional_role:"--Additional Role--",
        password: "",
        reset: 0,
    });
    const [showCreateLogin, setShowCreateLogin] = useState(false); // State to toggle UI
    const [showResetLogin, setShowResetLogin] = useState(false); // State to toggle Reset Login UI
    const [showAutoLoginCreation, setShowAutoLoginCreation] = useState(false); // State to toggle Auto Login Creation UI
    const [userData, setUserData] = useState([]); // State for user data in Reset Login
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user in Reset Login
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages

    // Update the useEffect block in FacultyLoginCr component
// Update the useEffect block to match CourseMgmt's authentication pattern
// Remove sessionCheck and only keep backend verification  

    const getTimestamp = () => new Date().toISOString().replace(/[-T:]/g, "_").split(".")[0];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFileName(file.name);
    };

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleDownloadTemplate = () => {
        // Sample data for the template
        const data = [
            ["Faculty ID", "Title", "Courtesy Title", "Name", "Designation","Additional Role"], // Example row
        ];

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        // Generate the file and trigger download
        XLSX.writeFile(wb, "template.xlsx");
    };

    const handleAddUser = () => {
        const { facultyId, title,courtesy_title, name, designation,additional_role } = user;
        if (!facultyId || !name || title === "--Title--" || courtesy_title=== "--Courtesy Title--"|| designation === "--Designation--" || additional_role === "--Designation--") {
            alert("Please fill all fields correctly!");
            return;
        }
        const newUser = { ...user, password: nanoid(12) };
        setUsers([...users, newUser]);
        setUser({
            facultyId: "",
            title: "--Title--",
            title: "--Courtesy Title--",
            name: "",
            designation: "--Designation--",
            additional_role: "--Additional Role--",
            password: "",
            reset: 0,
        });
    };

    const removeUser = (index) => setUsers(users.filter((_, i) => i !== index));

    const readXLSFile = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        const generateFile = async () => {
            const inputElement = document.getElementById("fileInput");
            if (!inputElement || inputElement.files.length === 0) {
                alert("Please upload a file first!");
                return;
            }
        
            try {
                // Read the Excel file
                const jsonData = await readXLSFile(inputElement.files[0]);
        
                // Validate the Excel data
                const requiredColumns = ["Faculty ID", "Title", "Courtesy Title", "Name", "Designation", "Additional Role"];
                const hasRequiredColumns = requiredColumns.every((column) =>
                    jsonData.some((row) => column in row)
                );
        
                if (!hasRequiredColumns) {
                    throw new Error("The uploaded file is missing required columns.");
                }
        
                // Format the data
                const formattedData = jsonData.map((item) => ({
                    facultyId: item["Faculty ID"] || "",
                    title: item["Title"] || "--Title--",
                    courtesy_title: item["Courtesy Title"] || "--Title--",
                    name: item["Name"] || "",
                    designation: item["Designation"] || "--Designation--",
                    additional_role: item["Additional Role"] || "--Additional Role--",
                    password: nanoid(12), // Generate a random password
                    reset: 0,
                }));
        
                // Update the users state
                setUsers(formattedData); // Replace existing data instead of appending
        
                // Generate the Excel file
                await generateXLS(formattedData);
        
                alert("File processed successfully!");
            } catch (error) {
                alert("Error reading or processing file: " + error.message);
            }
        };

    const generateXLS = async (data) => {
        if (!data.length){
            alert("Add at least 1 faculty!");
            return;
        } 
    
        try {
            // Convert data to Excel sheet
            const ws = XLSX.utils.json_to_sheet(
                data.map(({ facultyId, name, password }) => ({
                    "User ID": facultyId,
                    Name: name,
                    Password: password,
                    reset: 0,
                }))
            );
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "FacultyCredentials");
    
            // Send data to the backend
            const response = await axios.post('http://localhost:5000/admin-dashboard/faculty-mgmt/add', {
                users: data, // Use the `data` parameter instead of `users`
            });
    
            // Check if the request was successful
            if (response.status === 200) {
                // Save the Excel file
                XLSX.writeFile(wb, `FACULTY_CREDENTIALS_${getTimestamp()}.xls`);
                alert("Faculty credentials created successfully!");
            } else {
                alert("Error creating login!");
            }
        } catch (error) {
            console.error("Error generating XLS or sending data:", error);
            alert("An error occurred. Please try again.");
        } finally {
            // Clear the users state (assuming `setUsers` is a React state setter)
            setUsers([]);
        }
    };

    // Simulate search functionality for Reset Login
    const searchUser = async (e) => {
        e.preventDefault(); // Prevent form submission
    
        const formData = new FormData(e.target);
        const facultyId = formData.get("facultyId");
        const userName = formData.get("userName");
    
        if (!facultyId && !userName) {
            setErrorMessage("Please enter either Faculty ID or Name.");
            return;
        }
    
        try {
            // Fetch faculty data from the backend
            const response = await axios.post("http://localhost:5000/search-faculty", {
                facultyId,
                userName,
            });
    
            if (response.data.length === 0) {
                setErrorMessage("No faculty found with the given criteria.");
                setUserData([]);
                setSelectedUser(null);
            } else {
                setUsers(response.data);
                setSelectedUser(response.data);
                setUserData(response.data); // Update the userData state with fetched data
                setErrorMessage(""); // Clear any previous error messages
            }
        } catch (error) {
            console.error("Error fetching faculty data:", error);
            setErrorMessage("Failed to fetch faculty data. Please try again.");
            setUserData([]);
            setSelectedUser(null);
        }
    };

    // Simulate password reset functionality for Reset Login
    const handleResetPassword = async (e) => {
        e.preventDefault(); // Prevent form submission
    
        const formData = new FormData(e.target);
        const password1 = formData.get("password1");
        const password2 = formData.get("password2");
    
        if (password1 !== password2) {
            setErrorMessage("Passwords do not match.");
            return;
        }
    
        try {
            // Send the new password to the backend
            const response = await axios.post("http://localhost:5000/reset-faculty-password", {
                facultyId: selectedUser.facultyId,
                newPassword: password1,
            });
    
            if (response.status === 200) {
                alert("Password reset successfully!");
                setSelectedUser(null); // Clear the selected user
                setUserData([]); // Clear the user data
                setErrorMessage(""); // Clear any error messages
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setErrorMessage("Failed to reset password. Please try again.");
        }
    };

    return (
        <>
            <TitleBar />
            <div className="d-flex vh-100">
                <SideBar />
                <Container fluid className="p-4" style={{backgroundColor: '#e3eeff'}}>
                    {!showCreateLogin && !showResetLogin && !showAutoLoginCreation ? (
                        // Initial options as cards
                        <>
                            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>Back</Button>
                            <h1 className="mb-4">Faculty Management</h1>
                            <Row xs={1} sm={2} md={2} className="g-4">
    {[
        [
            'Manual Login Creation', 
            'card-1', 
            () => setShowCreateLogin(true),
            'Create login credentials manually by specifying details'
        ],
        [
            'Auto Login Creation', 
            'card-2', 
            () => setShowAutoLoginCreation(true),
            'Automatically generate secure login credentials by uploading xlsx file'
        ],
        [
            'Reset Login', 
            'card-2', 
            () => setShowResetLogin(true),
            'Reset existing user credentials or recover access to an account'
        ]
    ].map(([title, cardClass, onClick, description], index) => (
        <Col key={index}>
            <Card className={`card-bg ${cardClass}`} onClick={onClick} style={{ cursor: 'pointer'}}>
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        {description}
                    </Card.Text>
                </Card.Body>
            </Card>
        </Col>
    ))}
</Row>
                        </>
                    ) : showCreateLogin ? (
                        // Create Login UI
                        <>
                            <Button className="float-end px-4" onClick={() => setShowCreateLogin(false)}>Back</Button>
                            <Row className="mb-4">
                                <Col>
                                    <h1 className="text-center">Faculty Credentials Creation</h1>
                                </Col>
                            </Row>

                            <Row className="mb-4 mt-5">
                                <Col>
                                    <Form>
                                        <Row className="mb-3">
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="facultyId"
                                                    placeholder="Faculty ID"
                                                    value={user.facultyId}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                            <Col>
                                                <Form.Select name="courtesy_title" value={user.courtesy_title} onChange={handleInputChange}>
                                                    <option>--Courtesy Title--</option>
                                                    <option>Mr.</option>
                                                    <option>Ms.</option>
                                                    <option>Mrs.</option>
                                                </Form.Select>
                                            </Col>
                                            <Col>
                                                <Form.Select name="title" value={user.title} onChange={handleInputChange}>
                                                    <option>--Title--</option>
                                                    <option>Nil</option>
                                                    <option>Dr.</option>
                                                </Form.Select>
                                            </Col>
                                            
                                        </Row>
                                        <Row className="mb-3">
                                        <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="Name"
                                                    value={user.name}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                            <Col>
                                                <Form.Select name="designation" value={user.designation} onChange={handleInputChange}>
                                                    <option>--Designation--</option>
                                                    <option>Teaching Fellow</option>
                                                    <option>Asst. Professor</option>
                                                    <option>Professor</option>
                                                    <option>Head Of Dept.</option>
                                                </Form.Select>
                                            </Col>
                                            <Col>
                                                <Form.Select name="additional_role" value={user.additional_role} onChange={handleInputChange}>
                                                    <option>--Additional Role--</option>
                                                    <option>Nil</option>
                                                    <option>Faculty Advisor</option>
                                                    <option>Spokesperson</option>
                                                    
                                                    
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col className="text-center">
                                                <Button variant="primary" onClick={handleAddUser}>
                                                    Add Faculty
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <FacultyTable users={users} removeUser={removeUser} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col className="text-center">
                                    <Button variant="success" onClick={() => generateXLS(users)}>
                                        Generate & Download Credentials
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    ) : showAutoLoginCreation ? (
                        // Auto Login Creation UI - Updated Section
                        <>
                            <Button className="float-end px-4" onClick={() => setShowAutoLoginCreation(false)}>Back</Button>
                            <Row className="mb-4">
                                <Col className="text-center">
                                    <h1 className="mb-3">Auto Faculty Credentials Creation</h1>
                                    
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col xs={12} md={8} lg={6}>
                                    <Card className="shadow-sm border-0">
                                        <Card.Body className="p-4">
                                            <div className="text-center mb-5">
                                                
                                                <Button 
                                                    variant="outline-success" 
                                                    className="rounded-pill px-4 py-2"
                                                    onClick={handleDownloadTemplate}
                                                >
                                                    <i className="bi bi-file-earmark-arrow-down me-2"></i>
                                                    Download Excel Template
                                                </Button>
                                                <p className="text-muted small mt-2">
                                                    Use this template to maintain consistent formatting
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <h4 className="mb-4">Upload Filled Template</h4>
                                                <Form>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label 
                                                            htmlFor="fileInput" 
                                                            className="d-block cursor-pointer p-4 border-2 border-dashed rounded-3"
                                                            style={{
                                                                background: 'rgba(25, 135, 84, 0.05)',
                                                                borderColor: '#198754',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div className="mb-3">
                                                                <img 
                                                                    src={Folder} 
                                                                    alt="Upload" 
                                                                    style={{ width: '60px', opacity: 0.8 }}
                                                                    className="hover-effect"
                                                                />
                                                            </div>
                                                            <div className="text-success fw-medium mb-1">
                                                                Click to upload your .xlsx file
                                                            </div>
                                                            <div className="text-muted small">
                                                                Maximum file size: 5MB
                                                            </div>
                                                        </Form.Label>
                                                        <Form.Control 
                                                            type="file" 
                                                            onChange={handleFileChange} 
                                                            style={{ display: 'none' }} 
                                                            id="fileInput" 
                                                            accept=".xlsx"
                                                        />
                                                    </Form.Group>

                                                    {/* File Status Display */}
                                                    {fileName ? (
                                                        <div className="alert alert-success d-flex align-items-center justify-content-between mb-4">
                                                            <span>
                                                                <i className="bi bi-file-check me-2"></i>
                                                                {fileName}
                                                            </span>
                                                            <Button 
                                                                variant="link" 
                                                                className="p-0 text-danger"
                                                                onClick={() => {
                                                                    setFileName("");
                                                                    document.getElementById('fileInput').value = "";
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted mb-4">
                                                            <i className="bi bi-upload me-2"></i>
                                                            No file selected
                                                        </div>
                                                    )}

                                                    <div className="d-grid gap-2">
                                                        <Button 
                                                            variant="success" 
                                                            size="lg" 
                                                            className="rounded-pill py-2"
                                                            onClick={generateFile}
                                                            disabled={!fileName}
                                                        >
                                                            <i className="bi bi-file-earmark-zip me-2"></i>
                                                            Generate & Download Credentials
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        // Reset Login UI
                        <>
                            <Button className="float-end px-4" onClick={() => setShowResetLogin(false)}>Back</Button>
                            <Row className="mb-4">
                                <Col>
                                    <h1 className="text-center">Reset Faculty Password</h1>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <Form onSubmit={searchUser}>
                                        <Row className="mb-3">
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="facultyId"
                                                    placeholder="User ID"
                                                    className="field"
                                                />
                                            </Col>
                                            <Col className="text-center align-self-center">
                                                OR
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="userName"
                                                    placeholder="User Name"
                                                    className="field"
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col className="text-center">
                                                <Button type="submit" variant="primary">
                                                    Search Faculty
                                                </Button>
                                            </Col>
                                        </Row>
                                        {errorMessage && <div className="text-danger text-center">{errorMessage}</div>}
                                    </Form>
                                </Col>
                            </Row>

                            {userData.length > 0 && (
                                <Row className="mb-4">
                                    <Col>
                                        <FacultyTable users={users} />
                                    </Col>
                                </Row>
                            )}

                            {selectedUser && (
                                <Row className="mb-4">
                                    <Col>
                                        <Form onSubmit={handleResetPassword}>
                                            <Row className="mb-3">
                                                <Col>
                                                    <Form.Control
                                                        type="password"
                                                        name="password1"
                                                        placeholder="New Password"
                                                        className="field"
                                                        required
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="password"
                                                        name="password2"
                                                        placeholder="Re-Enter Password"
                                                        className="field"
                                                        required
                                                    />
                                                </Col>
                                            </Row>
                                            <Row className="mb-3">
                                                <Col className="text-center">
                                                    <Button type="submit" variant="success">
                                                        Reset Password
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                </Container>
            </div>
        </>
    );
}

const FacultyTable = ({ users, removeUser }) => (
    <>
        {users.length > 0 && (
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                <Table striped bordered hover responsive className="sticky-header">
                    <thead>
                        <tr>
                            <th>Faculty ID</th>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Courtesy Title</th>
                            <th>Designation</th>
                            <th>Additional Role</th>
                            {removeUser && 
                                <th>Action</th>
                            }
                            
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.facultyId}</td>
                                <td>{user.title}</td>
                                <td>{user.courtesy_title}</td>
                                <td>{user.name}</td>
                                <td>{user.designation}</td>
                                <td>{user.additional_role}</td>
                                {removeUser &&
                                    <td>
                                    <Button variant="danger" onClick={() => removeUser(index)}>
                                        Remove
                                    </Button>
                                </td>
                                }
                                
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )}
    </>
);