// src/pages/CourseSpec.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, Row, Col } from "react-bootstrap";
import TitleBar from "./TitleBar.js";
import SideBar from "./SideBar.js";

const CourseSpec = () => {
  const { courseId, regulationId } = useParams(); // Extract courseId and regulationId from URL
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch semesters for the selected regulation
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/fetch-semesters/${courseId}/${regulationId}`,
          { withCredentials: true }
        );
        setSemesters(response.data);
      } catch (error) {
        console.error("Error fetching semesters:", error);
        alert("Failed to fetch semesters");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, [courseId, regulationId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    <TitleBar/>
    <div className="d-flex vh-100">
    <SideBar/>
    <div className="p-4">
      <h1>Manage Courses for Regulation {regulationId}</h1>
      <Button onClick={() => navigate(-1)} className="mb-4">
        Back
      </Button>

      {semesters.length === 0 ? (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>No Semesters Available</Card.Title>
            <Button
              variant="primary"
              onClick={() => navigate(`/add-semester/${courseId}/${regulationId}`)}
            >
              Add Semester
            </Button>
          </Card.Body>
        </Card>
      ) : (
        semesters.map((semester, index) => (
          <Card key={index} className="mb-4">
            <Card.Body>
              <Card.Title>Semester {semester.semester_number}</Card.Title>
              <Row>
                <Col>
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(`/add-major-course/${courseId}/${regulationId}/${semester._id}`)
                    }
                  >
                    Add Major Course
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate(`/add-elective-course/${courseId}/${regulationId}/${semester._id}`)
                    }
                  >
                    Add Elective Course
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="warning"
                    onClick={() =>
                      navigate(`/add-lab-course/${courseId}/${regulationId}/${semester._id}`)
                    }
                  >
                    Add Lab Course
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
    </div>
    </div>
  );
};

export default CourseSpec;