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
import StudentEnrollment from './components/StudentEnrollment.js';
import ClassDetails from './components/ClassDetails.js';
import EnrollmentDetails from './components/EnrollmentDetails.js';
import SemesterEnrollment from './components/SemesterEnrollment.js';
import GradeForm from './components/GradeForm.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import StudentGradesApproval from './components/StudentGradesApproval.js';
import ClassGradesDetails from './components/ClassGradesDetails.js';
import DynamicQuery from './components/DynamicQuery.js';
import DynamicQueryComponent from './components/DynamicQueryComponent.js';
import StudentProfile from './components/StudentProfile.js';
import StudentReport from './components/StudentReport.js';
import FacultyLogin from './components/FacultyLogin.js';
import FacultyDashboard from './components/FacultyDashboard.js';
// import TemplatesPage from './components/TemplatesPage.js';

function App() {
  const services3 = [
    { title: "Student Details", description: "Fill in the personal and education details"},
    
    { title: "Semester Enrollment", description: "Enroll here for each semester"},
    { title: "Semester Grades Upload", description: "Upload your semester grades for verification" },
  ];

  const facultyServices = [
    { title: "Generate Report", description: "Generate academic performance report of a student"},
    
    { title: "Query Student Data", description: "Dynamically query and retrieve student data"}
  ];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin/>}/>
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path='/admin-dashboard/faculty-mgmt' element={<ProtectedRoute role="admin"><FacultyMgmt/></ProtectedRoute>}/>  
        <Route path='/admin-dashboard/student-mgmt' element={<ProtectedRoute role="admin"><StudentMgmt/></ProtectedRoute>}/>  
        <Route path='/admin-dashboard/course-mgmt' element={<ProtectedRoute role="admin"><CourseMgmt/></ProtectedRoute>}/>
        <Route path="/admin-dashboard/course-mgmt/course-spec/:courseId/:regulationYear" element={<ProtectedRoute role="admin"><CourseSpec /></ProtectedRoute>} />
        <Route path='/admin-dashboard/course-mgmt/create-course' element={<ProtectedRoute role="admin"><CreateCourse/></ProtectedRoute>}/>
        <Route path='/admin-dashboard/student-mgmt/create-login' element={<ProtectedRoute role="admin"><StudentLoginCr/></ProtectedRoute>}/>
        <Route path='/student-dashboard/semforms' element={<ProtectedRoute role="student"><GradeForm/></ProtectedRoute>}/>
        
        <Route path='/student-details-approval' element={<ProtectedRoute role="admin"><StudentDetailsApproval /></ProtectedRoute>}/>
        <Route path='/class-grades-details' element={<ProtectedRoute role="admin"><ClassGradesDetails /></ProtectedRoute>}/>
        <Route path='/student-grades-approval' element={<ProtectedRoute role="admin"><StudentGradesApproval /></ProtectedRoute>}/>
        <Route path='/student-enrollment' element={<ProtectedRoute role="admin"><StudentEnrollment /></ProtectedRoute>}/>
        <Route path="/class-details" element={<ProtectedRoute role="admin"><ClassDetails /></ProtectedRoute>} />
        <Route path="/enrollment-details" element={<ProtectedRoute role="admin"><EnrollmentDetails /></ProtectedRoute>} />
        <Route path="/student-query-system" element={<ProtectedRoute role="admin"><DynamicQuery/></ProtectedRoute>}></Route>
        <Route path="/student-report" element={<ProtectedRoute role="admin"><StudentReport/></ProtectedRoute>}></Route>
        <Route path="/dynamic-query" element={<ProtectedRoute role="admin"><DynamicQueryComponent/></ProtectedRoute>}></Route>
        <Route path="/student-profile" element={<ProtectedRoute role="admin"><StudentProfile/></ProtectedRoute>}></Route>
        {/* <Route path="/document-templates" element={<ProtectedRoute role="admin"><TemplatesPage/></ProtectedRoute>}></Route> */}
        <Route path="/student-login" element={<StudentLogin/>}/>
        <Route path="/faculty-login" element={<FacultyLogin/>}/>
        <Route path="/faculty-dashboard"element={<ProtectedRoute role="faculty"><FacultyDashboard services={facultyServices}/></ProtectedRoute>}/>
        <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard services={services3}/></ProtectedRoute>}/>
        <Route path="/semester-enroll" element={<ProtectedRoute role="student"><SemesterEnrollment/></ProtectedRoute>}/>
        <Route path="/student-form" element={<ProtectedRoute role="student"><StudentForm/></ProtectedRoute>}/>
      </Routes> 
    </Router>
  );
}

export default App;
