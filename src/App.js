import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import AdminLogin from './components/AdminLogin.js';
import AdminDashboard from './components/AdminDashboard.js';
import FacultyMgmt from './components/FacultyMgmt.js';
import FacultyLoginCr from './components/FacultyLoginCr.js';
import StudentMgmt from './components/StudentMgmt.js';
import CourseMgmt from './components/CourseMgmt.js';
import CreateCourse from './components/CreateCourse.js';
import CourseSpec from './components/CourseSpec.js';
import StudentLoginCr from './components/StudentLoginCr.js';
import StudentLogin from './components/StudentLogin.js';
import StudentDashboard from './components/StudentDashboard.js';
import StudentForm from './components/StudentForm.js';
import StudentDetailsApproval from './components/StudentDetailsApproval.js';

function App() {
  const services3 = [
    { title: "Student Form", description: "Student Form"},
    { title: "Semester Form", description: "Semester Form" },
    { title: "Semester Enrollment", description: "Semester Enrollment"},
    { title: "Notifications", description: "Send important updates to students."}
  ];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin/>}/>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/admin-dashboard/faculty-mgmt' element={<FacultyMgmt/>}/>  
        <Route path='/admin-dashboard/student-mgmt' element={<StudentMgmt/>}/>  
        <Route path='/admin-dashboard/course-mgmt' element={<CourseMgmt/>}/>
        <Route path="/admin-dashboard/course-mgmt/course-spec/:courseId/:regulationYear" element={<CourseSpec />} />
        <Route path='/admin-dashboard/course-mgmt/create-course' element={<CreateCourse/>}/>
        <Route path='/admin-dashboard/student-mgmt/create-login' element={<StudentLoginCr/>}/>
        <Route path='/student-details-approval' element={<StudentDetailsApproval />}/>

        <Route path="/student-login" element={<StudentLogin/>}/>
        <Route path="/student-dashboard" element={<StudentDashboard services={services3}/>}/>
        <Route path="/student-form" element={<StudentForm/>}/>
      </Routes> 
    </Router>
  );
}

export default App;
