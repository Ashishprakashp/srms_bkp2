import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import AdminLogin from './components/AdminLogin.js';
import AdminDashboard from './components/AdminDashboard.js';
import FacultyMgmt from './components/FacultyMgmt.js';
import FacultyLoginCr from './components/FacultyLoginCr.js';
import StudentMgmt from './components/StudentMgmt.js';
import CourseMgmt from './components/CourseMgmt.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin/>}/>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/admin-dashboard/faculty-mgmt' element={<FacultyMgmt/>}/>  
        <Route path='/admin-dashboard/student-mgmt' element={<StudentMgmt/>}/>  
        <Route path='/admin-dashboard/course-mgmt' element={<CourseMgmt/>}/>
      </Routes> 
    </Router>
  );
}

export default App;
