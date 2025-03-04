import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form, Button, Table, Card } from "react-bootstrap";
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";
import { useNavigate } from "react-router-dom";
import Folder from "./res/folder.png";
import './AdminDashboard.css';
import axios from 'axios';

export default function StudentLoginCr() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [fileName, setFileName] = useState("");
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
        studentId: "",
        name: "",
        branch: "--Branch--",
        regulation: "--Regulation--",
        from_year:"",
        to_year:"",
        password: "",
        reset: 0,
    });
    const [showCreateLogin, setShowCreateLogin] = useState(false); // State to toggle UI
    const [showAutoLoginCreation, setShowAutoLoginCreation] = useState(false); // State to toggle Auto Login Creation UI
    const [courses, setCourses] = useState([]); // State to store courses from the database
    const [regulations, setRegulations] = useState([]); // State to store regulations for the selected branch

    // Authentication check
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/check-auth', {
                    withCredentials: true
                });

                if (!response.data.authenticated) {
                    navigate('/');
                }
            } catch (error) {
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [navigate]);

    // Fetch courses from the database on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/fetch-courses');
                setCourses(response.data); // Set the fetched courses
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    // Fetch regulations for the selected branch
    const fetchRegulations = async (course_name) => {
        try {
            console.log(course_name);
            const response = await axios.get(`http://localhost:5000/fetch-regulations-admin/${course_name}`);
            console.log(response.data);
            setRegulations(response.data); // Set the fetched regulations
        } catch (error) {
            console.error("Error fetching regulations:", error);
        }
    };

    const getTimestamp = () => new Date().toISOString().replace(/[-T:]/g, "_").split(".")[0];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFileName(file.name);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });

        // If the branch is changed, fetch regulations for the new branch
        if (name === "branch" && value !== "--Branch--") {
            fetchRegulations(value);
        }
    };

    const handleDownloadTemplate = () => {
        // Sample data for the template
        const data = [
            ["Student ID", "Name", "Branch", "Regulation","Start year","End year"], // Example row
        ];

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        // Generate the file and trigger download
        XLSX.writeFile(wb, "student_template.xlsx");
    };

    const handleAddUser = () => {
        const { studentId, name, branch, regulation } = user;
        if (!studentId || !name || branch === "--Branch--" || regulation === "--Regulation--") {
            alert("Please fill all fields correctly!");
            return;
        }
        const newUser = { ...user, password: nanoid(12) };
        setUsers([...users, newUser]);
        setUser({
            studentId: "",
            name: "",
            branch: "--Branch--",
            regulation: "--Regulation--",
            from_year:"",
            to_year:"",
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
            const requiredColumns = ["Student ID", "Name", "Branch", "Regulation","Start year","End year"];
            const hasRequiredColumns = requiredColumns.every((column) =>
                jsonData.some((row) => column in row)
            );

            if (!hasRequiredColumns) {
                throw new Error("The uploaded file is missing required columns.");
            }

            // Format the data
            const formattedData = jsonData.map((item) => ({
                studentId: item["Student ID"] || "",
                name: item["Name"] || "",
                branch: item["Branch"] || "--Branch--",
                regulation: item["Regulation"] || "--Regulation--",
                from_year: item["Start year"] ||"",
                to_year: item["End year"] ||"",
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
        if (!data.length) {
            alert("Add at least 1 student!");
            return;
        }

        try {
            // Convert data to Excel sheet
            const ws = XLSX.utils.json_to_sheet(
                data.map(({ studentId, name, branch, regulation, password }) => ({
                    "User ID": studentId,
                    Name: name,
                    Branch: branch,
                    Regulation: regulation,
                    Password: password
                }))
            );
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "StudentCredentials");

            // Send data to the backend
            const response = await axios.post('http://localhost:5000/admin-dashboard/student-mgmt/create-login', {
                users: data, // Use the `data` parameter instead of `users`
            });

            // Check if the request was successful
            if (response.status === 200) {
                // Save the Excel file
                XLSX.writeFile(wb, `STUDENT_CREDENTIALS_${getTimestamp()}.xls`);
                alert("Student credentials created successfully!");
            } else {
                alert("Error creating login!");
            }
        } catch (error) {
            console.error("Error generating XLS or sending data:", error);
            alert("An error occurred. Please try again.");
        } finally {
            // Clear the users state
            setUsers([]);
        }
    };

    return (
        <>
            <TitleBar />
            <div className="d-flex vh-100">
                <SideBar />
                <Container fluid className="p-4" style={{ backgroundColor: '#e3eeff' }}>
                    {!showCreateLogin && !showAutoLoginCreation ? (
                        // Initial options as cards
                        <>
                            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>Back</Button>
                            <h1 className="mb-4">Student Management</h1>
                            <Row xs={1} sm={2} md={2} className="g-4">
                                {[
                                    ['Manual Login Creation', 'card-1', () => setShowCreateLogin(true)],
                                    ['Auto Login Creation', 'card-2', () => setShowAutoLoginCreation(true)],
                                ].map(([title, cardClass, onClick], index) => (
                                    <Col key={index}>
                                        <Card className={`card-bg ${cardClass}`} onClick={onClick} style={{ cursor: 'pointer' }}>
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
                        // Manual Login Creation UI
                        <>
                            <Button className="float-end px-4" onClick={() => setShowCreateLogin(false)}>Back</Button>
                            <Row className="mb-4">
                                <Col>
                                    <h1 className="text-center">Student Credentials Creation</h1>
                                </Col>
                            </Row>

                            <Row className="mb-4 mt-5">
                                <Col>
                                    <Form>
                                        <Row className="mb-3">
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="studentId"
                                                    placeholder="Student ID"
                                                    value={user.studentId}
                                                    onChange={handleInputChange}
                                                />
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
                                                <Form.Select name="branch" value={user.branch} onChange={handleInputChange}>
                                                    <option>--Branch--</option>
                                                    {courses.map((course) => (
                                                        <option key={course._id} value={course.course_name}>
                                                            {course.course_name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                            <Col>
                                            <Form.Select name="regulation" value={user.regulation} onChange={handleInputChange}>
                                                <option>--Regulation--</option>
                                                {regulations.map((regulation, index) => (
                                                    <option key={index} value={regulation}>
                                                        {regulation}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="from_year"
                                                    placeholder="Start Year"
                                                    value={user.from_year}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="text"
                                                    name="to_year"
                                                    placeholder="End Year"
                                                    value={user.to_year}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col className="text-center">
                                                <Button variant="primary" onClick={handleAddUser}>
                                                    Add Student
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <StudentTable users={users} removeUser={removeUser} />
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
                    ) : (
                        // Auto Login Creation UI
                        <>
                            <Button className="float-end px-4" onClick={() => setShowAutoLoginCreation(false)}>Back</Button>
                            <Row className="mb-4">
                                <Col className="text-center">
                                    <h1 className="mb-3">Auto Student Credentials Creation</h1>
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
                    )}
                </Container>
            </div>
        </>
    );
}

const StudentTable = ({ users, removeUser }) => (
    <>
        {users.length > 0 && (
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                <Table striped bordered hover responsive className="sticky-header">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Branch</th>
                            <th>Regulation</th>
                            <th>From Year</th>
                            <th>To Year</th>
                            {removeUser && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.studentId}</td>
                                <td>{user.name}</td>
                                <td>{user.branch}</td>
                                <td>{user.regulation}</td>
                                <td>{user.from_year}</td>
                                <td>{user.to_year}</td>
                                {removeUser && (
                                    <td>
                                        <Button variant="danger" onClick={() => removeUser(index)}>
                                            Remove
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )}
    </>
);