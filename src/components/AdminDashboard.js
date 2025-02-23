import React from 'react';
import { Navbar, Nav, Image, Card, Row, Col ,Button} from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import pl_image from './res/login.jpg';
import './AdminDashboard.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <>
      <TitleBar />
      
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <SideBar />
        
        {/* Main Content */}
        <div className='main-content-ad-dboard flex-grow-1'>
          <div className="p-4">
          
            <h1 className="mb-4">Welcome to the Dashboard</h1>
            
            {/* Cards Grid with Fade-In Animation */}
            <Row xs={1} sm={2} md={3} className="g-4">
              {[
                ['Faculty Management', 'card-1','/admin-dashboard/faculty-mgmt'],
                ['Student Management', 'card-2','/admin-dashboard/student-mgmt'],
                ['Course Management', 'card-3','/admin-dashboard/course-mgmt'],
                ['Grade Management', 'card-4','']
              ].map(([title, cardClass,path], index) => (
                <Col key={index}>
                  <Card className={`card-bg ${cardClass}`} onClick={()=>navigate(path)}>
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

export default AdminDashboard;