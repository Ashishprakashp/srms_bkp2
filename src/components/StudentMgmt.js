import React from 'react';
import { Navbar, Nav, Image, Card, Row, Col ,Button} from 'react-bootstrap';
import TitleBar from './TitleBar.js';
import pl_image from './res/login.jpg';
import './AdminDashboard.css';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const StudentMgmt = () => {
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
        <div className='main-content-ad-dboard flex-grow-1' style={{overflowY:'auto'}}>
          <div className="p-4">
            <Button className="float-end px-4" onClick={() => navigate('/admin-dashboard')}>Back</Button>
            <h1 className="mb-4">Student Management</h1>
            
            {/* Cards Grid with Fade-In Animation */}
            <Row xs={1} sm={2} md={3} className="g-4">
              {[
                ['Create Login', 'card-1',''],
                ['Reset Login', 'card-2',''],
                ['Student Details Approval', 'card-3',''],
                ['Grades Approval', 'card-4',''],
                ['Generate Report', 'card-1',''],
                ['Create/Edit Document Templates', 'card-2',''],
                ['Document Approval', 'card-3',''],
                ['Query Student data', 'card-4',''],
                ['Data visualization', 'card-4','']
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

export default StudentMgmt;