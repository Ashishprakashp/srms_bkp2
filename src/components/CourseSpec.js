import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, Modal, Form, Table } from "react-bootstrap";
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";

const CourseSpec = () => {
  const { courseId, regulationId } = useParams();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subject_code: "",
    subject_name: "",
    credits: "",
    subject_type: "",
    sem_no: null, // Semester number to which the subject belongs
  });
  const [editingCourse, setEditingCourse] = useState(null);

  // Fetch semesters and courses for the selected regulation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const semestersResponse = await axios.get(
          `http://localhost:5000/fetch-semesters/${courseId}/${regulationId}`
        );
        setSemesters(semestersResponse.data);

        const coursesResponse = await axios.get(
          `http://localhost:5000/fetch-courses/${courseId}/${regulationId}`
        );
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, regulationId]);

  // Handle adding a new semester automatically
  const handleAddSemester = async () => {
    try {
      const newSemester = {
        code: `SEM-${semesters.length + 1}`, // Auto-generate a semester code
        sem_no: semesters.length + 1, // Auto-increment semester number
      };

      const response = await axios.post(
        `http://localhost:5000/add-semester/${courseId}/${regulationId}`,
        newSemester
      );

      if (response.status === 200) {
        setSemesters([...semesters, response.data]); // Add the new semester to the list
      }
    } catch (error) {
      console.error("Error adding semester:", error);
    }
  };

  // Handle adding a new subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/add-subject/${courseId}/${regulationId}`,
        newSubject
      );

      if (response.status === 200) {
        setCourses([...courses, response.data]); // Add the new subject to the list
        setShowAddSubjectModal(false); // Close the modal
        setNewSubject({
          subject_code: "",
          subject_name: "",
          credits: "",
          subject_type: "",
          sem_no: null,
        }); // Reset the form
      }
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  // Handle editing a course
  const handleEditCourse = (course) => {
    setEditingCourse(course); // Set the course being edited
  };

  // Handle updating a course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/update-course/${editingCourse._id}`,
        editingCourse
      );

      if (response.status === 200) {
        const updatedCourses = courses.map((course) =>
          course._id === editingCourse._id ? editingCourse : course
        );
        setCourses(updatedCourses); // Update the course list
        setEditingCourse(null); // Close the edit modal
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  // Handle removing a course
  const handleRemoveCourse = async (courseId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/remove-course/${courseId}`
      );

      if (response.status === 200) {
        const updatedCourses = courses.filter((course) => course._id !== courseId);
        setCourses(updatedCourses); // Remove the course from the list
      }
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <TitleBar />
      <div className="d-flex vh-100">
        <SideBar />
        <div className="p-4 w-100">
          <h1>Manage Courses for Regulation {regulationId}</h1>
          <Button onClick={() => navigate(-1)} className="mb-4">
            Back
          </Button>

          <div className="d-flex flex-column gap-3">
            {/* Semester Cards */}
            {semesters.map((semester) => (
              <Card key={semester._id}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h4>Semester {semester.sem_no} - {semester.code}</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewSubject({ ...newSubject, sem_no: semester.sem_no });
                      setShowAddSubjectModal(true);
                    }}
                  >
                    Add Subject
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses
                        .filter((c) => c.sem_no === semester.sem_no)
                        .map((course) => (
                          <tr key={course._id}>
                            <td>{course.subject_code}</td>
                            <td>{course.subject_name}</td>
                            <td>{course.credits}</td>
                            <td>{course.subject_type}</td>
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveCourse(course._id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}

            {/* Add Semester Button */}
            <Button
              variant="primary"
              onClick={handleAddSemester}
              className="mt-3"
            >
              Add New Semester
            </Button>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      <Modal show={showAddSubjectModal} onHide={() => setShowAddSubjectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Subject to Semester {newSubject.sem_no}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubject}>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control
                type="text"
                value={newSubject.subject_code}
                onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                value={newSubject.subject_name}
                onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Credits</Form.Label>
              <Form.Control
                type="number"
                value={newSubject.credits}
                onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Type</Form.Label>
              <Form.Select
                value={newSubject.subject_type}
                onChange={(e) => setNewSubject({ ...newSubject, subject_type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Subject
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Course Modal */}
      {editingCourse && (
        <Modal show={!!editingCourse} onHide={() => setEditingCourse(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateCourse}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Code</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCourse.subject_code}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, subject_code: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCourse.subject_name}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, subject_name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Credits</Form.Label>
                <Form.Control
                  type="number"
                  value={editingCourse.credits}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, credits: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subject Type</Form.Label>
                <Form.Select
                  value={editingCourse.subject_type}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, subject_type: e.target.value })
                  }
                  required
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                  <option value="Lab">Lab</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary" type="submit">
                Update Course
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default CourseSpec;