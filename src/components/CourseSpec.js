import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, Modal, Form, Table } from "react-bootstrap";
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";

const CourseSpec = () => {
  const { courseId, regulationYear } = useParams();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
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

  // Fetch semesters and their subjects for the selected regulation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/fetch-semesters/${courseId}/${regulationYear}`
        );
        setSemesters(response.data); // Set the fetched semesters and subjects
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [courseId, regulationYear]);

  // Handle adding a new semester
  const handleAddSemester = async () => {
    try {
      const newSemester = {
        code: `SEM-${semesters.length + 1}`,
        sem_no: semesters.length + 1,
        subjects: [], // Initialize with an empty array of subjects
      };
      console.log(courseId+" "+regulationYear);
      const response = await axios.post(
        `http://localhost:5000/add-semester/${courseId}/${regulationYear}`,
        newSemester
      );

      if (response.status === 200) {
        setSemesters([...semesters, response.data]);
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
        `http://localhost:5000/add-subject/${courseId}/${regulationYear}`,
        newSubject
      );
  
      if (response.status === 200) {
        // Update the semester with the new subject
        const updatedSemesters = semesters.map((semester) =>
          semester.sem_no === newSubject.sem_no
            ? { ...semester, subjects: [...semester.subjects, response.data] }
            : semester
        );
        setSemesters(updatedSemesters);
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

  // Handle editing a subject
  const handleEditCourse = (subject) => {
    setEditingCourse(subject); // Set the subject being edited
  };

  // Handle updating a subject
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/update-subject/${editingCourse._id}`,
        editingCourse
      );
  
      if (response.status === 200) {
        // Update the subject in the semester
        const updatedSemesters = semesters.map((semester) => ({
          ...semester,
          subjects: semester.subjects.map((subject) =>
            subject._id === editingCourse._id ? editingCourse : subject
          ),
        }));
        setSemesters(updatedSemesters);
        setEditingCourse(null); // Close the edit modal
      }
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  // Handle removing a subject
  const handleRemoveCourse = async (subjectId) => {
    try {
      console.log("Removing subject with ID:", subjectId); // Debugging line
      const response = await axios.delete(
        `http://localhost:5000/remove-subject/${subjectId}`
      );
  
      if (response.status === 200) {
        // Remove the subject from the semester
        const updatedSemesters = semesters.map((semester) => ({
          ...semester,
          subjects: semester.subjects.filter((subject) => subject._id !== subjectId),
        }));
        setSemesters(updatedSemesters);
      }
    } catch (error) {
      console.error("Error removing subject:", error);
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
          <h1>Manage Courses for Regulation {regulationYear}</h1>
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
                      {semester.subjects.map((subject) => (
                        <tr key={subject._id}>
                          <td>{subject.subject_code}</td>
                          <td>{subject.subject_name}</td>
                          <td>{subject.credits}</td>
                          <td>{subject.subject_type}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleEditCourse(subject)}
                              className="me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveCourse(subject._id)}
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

      {/* Edit Subject Modal */}
      {editingCourse && (
        <Modal show={!!editingCourse} onHide={() => setEditingCourse(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Subject</Modal.Title>
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
                Update Subject
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default CourseSpec;