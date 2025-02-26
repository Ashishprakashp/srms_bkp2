import React from 'react';
import { Navbar, Nav, Image, Card, Row, Col ,Button} from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import pl_image from './res/login.jpg';
import './CourseMgmt.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const CreateCourse = () => {
  const navigate = useNavigate();
  useEffect(() => {
      const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
      const user = sessionStorage.getItem('user');
  
      if (!isAuthenticated || !user) {
        navigate('/'); // Redirect to login if not authenticated
      }
    }, [navigate]);
  return (
    <>
      <TitleBar />
      
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <SideBar />
        
        {/* Main Content */}
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>Back</Button>
            <h1 className="mb-4">Welcome to the Dashboard</h1>
            
            {/* Cards Grid with Fade-In Animation */}
            <Row xs={1} sm={2} md={1} className="g-4">
              {[
                ['Create Course', 'card-1','/admin-dashboard/faculty-mgmt']
              ].map(([title, cardClass,path], index) => (
                <Col key={index}>
                  <Card className={`card-bg-cr ${cardClass}`} onClick={()=>navigate(path)}>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCourse;