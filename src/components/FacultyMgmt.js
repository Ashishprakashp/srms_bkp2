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

export default function FacultyLoginCr() {
    const navigate = useNavigate();
    const [fileName, setFileName] = useState("");
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
        userId: "",
        title: "--Title--",
        name: "",
        designation: "--Designation--",
        pwd: "",
        reset: 0,
    });
    const [showCreateLogin, setShowCreateLogin] = useState(false); // State to toggle UI
    const [showResetLogin, setShowResetLogin] = useState(false); // State to toggle Reset Login UI
    const [showAutoLoginCreation, setShowAutoLoginCreation] = useState(false); // State to toggle Auto Login Creation UI
    const [userData, setUserData] = useState([]); // State for user data in Reset Login
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user in Reset Login
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        const user = sessionStorage.getItem('user');
    
        if (!isAuthenticated || !user) {
          navigate('/'); // Redirect to login if not authenticated
        }
      }, [navigate]);

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
            ["User ID", "Title", "Courtesy Title", "Name", "Designation"], // Example row
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
        const { userId, title, name, designation } = user;
        if (!userId || !name || title === "--Title--" || designation === "--Designation--") {
            alert("Please fill all fields correctly!");
            return;
        }
        const newUser = { ...user, pwd: nanoid(12) };
        setUsers([...users, newUser]);
        setUser({
            userId: "",
            title: "--Title--",
            name: "",
            designation: "--Designation--",
            pwd: "",
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
        const inputElement = document.getElementById("file");
        if (!fileName || inputElement.files.length === 0) {
            alert("Please upload a file first!");
            return;
        }

        try {
            const jsonData = await readXLSFile(inputElement.files[0]);
            const formattedData = jsonData.map((item) => ({
                userId: item["User ID"] || "",
                title: item["Title"] || "--Title--",
                name: item["Name"] || "",
                designation: item["Designation"] || "--Designation--",
                pwd: nanoid(12),
                reset: 0,
            }));

            setUsers((prev) => [...prev, ...formattedData]);
            generateXLS(formattedData);
        } catch (error) {
            alert("Error reading file: " + error.message);
        }
    };

    const generateXLS = async (data) => {
        if (!data.length) return;
        const ws = XLSX.utils.json_to_sheet(
            data.map(({ userId, name, pwd }) => ({ "User ID": userId, Name: name, Password: pwd, reset: 0 }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FacultyCredentials");
        XLSX.writeFile(wb, `FACULTY_CREDENTIALS_${getTimestamp()}.xls`);
    };

    // Simulate search functionality for Reset Login
    const searchUser = (e) => {
        e.preventDefault();

        const userId = e.target.userId.value.trim();
        const userName = e.target.userName.value.trim();

        if (!userId && !userName) {
            alert("No User ID or name provided!");
            return;
        }

        // Simulate fetching user data
        const mockData = [
            { userId: "123", name: "John Doe", pwd: "oldpassword123" },
            { userId: "456", name: "Jane Smith", pwd: "oldpassword456" },
        ];

        if (mockData.length > 0) {
            setUserData(mockData);
            setSelectedUser(mockData[0]); // Select first result
            setErrorMessage("");
        } else {
            setUserData([]);
            setErrorMessage("No user found.");
        }
    };

    // Simulate password reset functionality for Reset Login
    const handleResetPassword = (e) => {
        e.preventDefault();

        const pwd1 = e.target.pwd1.value;
        const pwd2 = e.target.pwd2.value;

        if (pwd1 !== pwd2) {
            alert("Passwords do not match!");
            return;
        }

        if (!selectedUser?.userId) {
            alert("No user selected for password reset.");
            return;
        }

        // Simulate password reset
        alert(`Password reset for ${selectedUser.name} (${selectedUser.userId}) to: ${pwd1}`);
        setShowResetLogin(false);
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
                                    ['Manual Login Creation', 'card-1', () => setShowCreateLogin(true)],
                                    ['Auto Login Creation', 'card-2', () => setShowAutoLoginCreation(true)],
                                    ['Reset Login', 'card-2', () => setShowResetLogin(true)]
                                ].map(([title, cardClass, onClick], index) => (
                                    <Col key={index}>
                                        <Card className={`card-bg ${cardClass}`} onClick={onClick} style={{ cursor: 'pointer'}}>
                                            <Card.Body>
                                                <Card.Title>{title}</Card.Title>
                                                <Card.Text>
                                                    {`This is the content of ${title}`}
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
                                                    name="userId"
                                                    placeholder="User ID"
                                                    value={user.userId}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                            <Col>
                                                <Form.Select name="title" value={user.title} onChange={handleInputChange}>
                                                    <option>--Title--</option>
                                                    <option>Nil</option>
                                                    <option>Dr.</option>
                                                </Form.Select>
                                            </Col>
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
                                    <p className="text-muted">Upload faculty data in bulk using the Excel template format</p>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col xs={12} md={8} lg={6}>
                                    <Card className="shadow-sm border-0">
                                        <Card.Body className="p-4">
                                            <div className="text-center mb-5">
                                                <h4 className="mb-4">Step 1: Download Template</h4>
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
                                                <h4 className="mb-4">Step 2: Upload Filled Template</h4>
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
                                                    name="userId"
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
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>User ID</th>
                                                    <th>Name</th>
                                                    <th>Password</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userData.map((user, index) => (
                                                    <tr key={index}>
                                                        <td>{user.userId}</td>
                                                        <td>{user.name}</td>
                                                        <td>{user.pwd}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
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
                                                        name="pwd1"
                                                        placeholder="New Password"
                                                        className="field"
                                                        required
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="password"
                                                        name="pwd2"
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
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Designation</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.title}</td>
                                <td>{user.designation}</td>
                                <td>
                                    <Button variant="danger" onClick={() => removeUser(index)}>
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )}
    </>
);