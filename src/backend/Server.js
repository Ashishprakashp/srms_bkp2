import express, { query } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import adminuser from './schemas/adminuser.js';
import Course from './schemas/Course.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import Faculty from './schemas/Faculty.js';
import StudentAcc from './schemas/StudentAcc.js';
import StudentDetails from './schemas/StudentDetails.js';
// import { uploadMiddleware, getFilePaths } from './utils/fileUpload.js';
import Student from './schemas/Student.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Await } from 'react-router-dom';
import axios from 'axios';
import StudentGrades from './schemas/StudentGrade.js';
import Enrollment from './schemas/Enrollment.js';
import GradesEnrollment from './schemas/GradesEnrollment.js';


// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.log(err));

// Password hashing and verification functions
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes
app.get('/check-auth', (req, res) => {
  res.status(req.session.user ? 200 : 401).json({
    authenticated: !!req.session.user,
    user: req.session.user
  });
});

app.post('/adminlogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error('Missing credentials');

    const admin = await adminuser.findOne({ username });
    if (!admin) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    req.session.user = {
      id: admin._id,
      username: admin.username
    };

    req.session.save(err => {
      if (err) throw new Error('Session save failed');
      res.status(200).json({ 
        message: 'Login successful', 
        user: { username: admin.username }
      });
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// app.post('/create-course', isAuthenticated, async (req, res) => {
//   try {
  
//     // Validate request body
//     if (!req.body.course_name || typeof req.body.course_name !== 'string') {
//       return res.status(400).json({ message: 'Invalid course name' });
//     }

//     // Create course with explicit field mapping
//     const newCourse = new Course({
//       course_name: req.body.course_name,
//       semester_count: req.body.semester_count || 0,
//       semesters: [],
//       creation_time: new Date(),
//       user_created: req.session.user.username
//     });
    
//     // Save and return response
//     const savedCourse = await newCourse.save();
//     res.status(201).json({
//       message: "Course created successfully",
//       course: savedCourse
//     });
    
//   } catch (error) {
//     console.error("Creation error:", error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(409).json({
//         message: "Course name already exists",
//         field: "course_name"
//       });
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: Object.values(error.errors).map(e => e.message)
//       });
//     }

//     res.status(500).json({
//       message: "Course creation failed",
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

app.post('/create-course', isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    if (!req.body.course_name || typeof req.body.course_name !== 'string') {
      return res.status(400).json({ message: 'Invalid course name' });
    }

    // Create course with explicit field mapping
    const newCourse = new Course({
      course_name: req.body.course_name,
      regulations: [], // Initialize with an empty array of regulations
      creation_time: new Date(),
      user_created: req.session.user.username, // Assuming user is authenticated
    });

    // Save and return response
    const savedCourse = await newCourse.save();
    res.status(201).json({
      message: "Course created successfully",
      course: savedCourse,
    });
  } catch (error) {
    console.error("Creation error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course name already exists",
        field: "course_name",
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      message: "Course creation failed",
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});


//Delete course
// Example backend route (Express.js)
// Delete course route
app.post('/delete-course', isAuthenticated, async (req, res) => {
  try {
    const { course_id, password } = req.body;
    const username = req.session.user.username;

    // Validate input
    if (!username || !password || !course_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify admin credentials
    const admin = await adminuser.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Verify course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Delete the course
    await Course.findByIdAndDelete(course_id);

    res.status(200).json({ 
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to delete course'
    });
  }
});

// the courses for admin
app.get('/fetch-courses-admin',async(req,res)=>{
  try{
    const courses = await Course.find({});
    if(courses.length===0){
      return res.status(404).json({ error: "No courses found" });
    }
    res.json(courses);
  }catch(error){
    res.status(500).json({ error: "Internal server error" });
  }

});
//Fetch regulations
// Fetch regulations for a course
app.get('/fetch-regulations/:courseId', async (req, res) => {
  try {
    console.log("Fetching regulations for course ID:", req.params.courseId);

    // Find the course by ID
    const course = await Course.findById(req.params.courseId).exec();

    console.log("Course found:", course);

    // Check if the course exists
    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the regulations field exists
    if (!course.regulations || course.regulations.length === 0) {
      console.log("No regulations found for this course");
      return res.json([]); // Return an empty array
    }

    console.log("Regulations fetched successfully:", course.regulations);

    // Send the regulations as a response
    res.json(course.regulations);
  } catch (error) {
    console.error('Error fetching regulations:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/add-regulation/:courseId', async (req, res) => {
  try {
    const { year } = req.body; // Extract year from the request body
    console.log("year: "+year);
    const courseId = req.params.courseId; // Extract courseId from the URL

    console.log("Adding regulation to course ID:", courseId);

    // Find the course by ID
    const course = await Course.findById(courseId).exec();

    // Check if the course exists
    if (!course) {
      console.log("Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    // Add the new regulation to the course's regulations array
    course.regulations.push({ year }); // Only the "year" field is required
    await course.save(); // Save the updated course

    console.log("Regulation added successfully:", course.regulations);

    // Return the updated regulations
    res.json(course.regulations);
  } catch (error) {
    console.error('Error adding regulation:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/admin-dashboard/faculty-mgmt/add', async (req, res) => {
  try {
    const faculties = req.body.users;
    console.log("1");
    
    // Log the input data for debugging
    console.log("Input Faculties:", faculties);

    // Find existing faculties
    let existingFaculties;
    try {
      existingFaculties = await Faculty.find({ facultyId: { $in: faculties.map(f => f.facultyId) } });
      console.log("2");
    } catch (findError) {
      console.error("Error finding existing faculties:", findError);
      throw findError; // Re-throw the error to be caught by the outer catch block
    }

    const existingFacultyIds = existingFaculties.map(f => f.facultyId);
    console.log("3");
    
    // Filter out new faculties
    const newFaculties = faculties.filter(f => !existingFacultyIds.includes(f.facultyId));
    console.log("4");

    // Hash passwords for new faculties
    const hashedNewFaculties = await Promise.all(
      newFaculties.map(async (faculty) => {
        const hashedPassword = await hashPassword(faculty.password); // Hash the password
        return {
          ...faculty,
          password: hashedPassword, // Replace plain password with hashed password
        };
      })
    );

    console.log("Hashed New Faculties:", hashedNewFaculties);
    
    if (hashedNewFaculties.length > 0) {
      try {
        await Faculty.insertMany(hashedNewFaculties); // Insert new faculties with hashed passwords
        console.log("5");
      } catch (insertError) {
        console.error("Error inserting new faculties:", insertError);
        throw insertError; // Re-throw the error to be caught by the outer catch block
      }
    }

    res.status(200).json({
      message: hashedNewFaculties.length > 0 ? "New faculty details saved successfully" : "No new faculty added",
      newFaculties: hashedNewFaculties,
      existingFaculties: existingFaculties
    });
  } catch (error) {
    console.error("Error in /admin-dashboard/faculty-mgmt/add:", error);
    res.status(500).send("Error saving faculty details: " + error.message);
  }
});

app.post("/search-faculty", async (req, res) => {
  try {
      const { facultyId, userName } = req.body;

      let query = {};
      if (facultyId) query.facultyId = facultyId;
      if (userName) query.name = { $regex: userName, $options: "i" }; // Case-insensitive search

      const faculties = await Faculty.find(query);
      res.status(200).json(faculties);
  } catch (error) {
      console.error("Error searching faculty:", error);
      res.status(500).json({ message: "Failed to search faculty." });
  }
});

app.post("/reset-faculty-password", async (req, res) => {
  try {
      const { facultyId, newPassword } = req.body;

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the faculty's password in the database
      await Faculty.updateOne(
          { facultyId },
          { $set: { password: hashedPassword, reset: 1 } }
      );

      res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password." });
  }
});

//Post student account
app.post("/admin-dashboard/student-mgmt/create-login",async(req,res)=>{
  try {
    const students = req.body.users;
    console.log("1");
    
    // Log the input data for debugging
    console.log("Input Students:", students);

    // Find existing faculties
    let existingStudents;
    try {
      existingStudents = await StudentAcc.find({ studentId: { $in: students.map(s => s.studentId) } });
      console.log("2");
    } catch (findError) {
      console.error("Error finding existing faculties:", findError);
      throw findError; // Re-throw the error to be caught by the outer catch block
    }

    const existingStudentIds = existingStudents.map(s => s.studentId);
    console.log("3");
    
    // Filter out new faculties
    const newStudents = students.filter(s => !existingStudentIds.includes(s.studentId));
    console.log("4");

    // Hash passwords for new faculties
    const hashedNewStudents = await Promise.all(
      newStudents.map(async (student) => {
        const hashedPassword = await hashPassword(student.password); // Hash the password
        return {
          ...student,
          password: hashedPassword, // Replace plain password with hashed password
        };
      })
    );

    console.log("Hashed New Students:", hashedNewStudents);
    
    if (hashedNewStudents.length > 0) {
      try {
        await StudentAcc.insertMany(hashedNewStudents); // Insert new faculties with hashed passwords
        console.log("5");
      } catch (insertError) {
        console.error("Error inserting new students:", insertError);
        throw insertError; // Re-throw the error to be caught by the outer catch block
      }
    }

    res.status(200).json({
      message: hashedNewStudents.length > 0 ? "New Student details saved successfully" : "No new student added",
      newStudents: hashedNewStudents,
      existingStudents: existingStudents
    });
  } catch (error) {
    console.error("Error in /admin-dashboard/faculty-mgmt/add:", error);
    res.status(500).send("Error saving student details: " + error.message);
  }
});

app.post("/add-semester",async(req,res)=>{

});

app.post("/add-semester/:_id/:regulationYear", async (req, res) => {
  const { _id, regulationYear } = req.params; // Use _id for courseId
  const { sem_no } = req.body; // sem_no is required to create a new semester

  try {
    // Find the course by _id
    const course = await Course.findById(_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the regulation by regulationId (assuming regulationId is the _id of the regulation)
    const regulation = course.regulations.find((reg) => reg.year === regulationYear);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    // Check if the semester already exists
    const semesterExists = regulation.semesters.some((sem) => sem.sem_no === sem_no);
    if (semesterExists) {
      return res.status(400).json({ error: "Semester already exists" });
    }

    // Create a new semester
    const newSemester = {
      sem_no,
      subjects: [], // Initialize with an empty array of subjects
    };

    // Add the semester to the regulation's semesters array
    regulation.semesters.push(newSemester);
    regulation.semester_count += 1; // Increment the semester count for this regulation

    // Save the updated course
    await course.save();

    res.status(200).json(newSemester);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/remove-semester/:courseId/:regulationYear/:semesterId", async (req, res) => {
  const { courseId, regulationYear, semesterId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const regulation = course.regulations.find(reg => reg.year === regulationYear);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    // Find the index of the semester
    const semesterIndex = regulation.semesters.findIndex(sem => sem._id.toString() === semesterId);
    if (semesterIndex === -1) {
      return res.status(404).json({ error: "Semester not found" });
    }

    // Remove the semester using splice
    regulation.semesters.splice(semesterIndex, 1);
    regulation.semester_count = Math.max(0, regulation.semester_count - 1);

    await course.save();
    res.status(200).json({ message: "Semester removed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/add-subject/:courseId/:regulationYear", async (req, res) => {
  const { courseId, regulationYear } = req.params; // courseId is the _id of the course, regulationYear is the year (e.g., "2023")
  const { sem_no, subject_code, subject_name, credits, subject_type } = req.body; // Subject details

  try {
    // Find the course by _id
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the regulation by year
    const regulation = course.regulations.find((reg) => reg.year === regulationYear);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    // Find the semester by sem_no
    const semester = regulation.semesters.find((sem) => sem.sem_no === sem_no);
    if (!semester) {
      return res.status(404).json({ error: "Semester not found" });
    }

    // Create a new subject
    const newSubject = {
      subject_code,
      subject_name,
      credits,
      subject_type,
    };

    // Add the subject to the semester's subjects array
    semester.subjects.push(newSubject);

    // Save the updated course
    await course.save();

    res.status(200).json(newSubject); // Return the newly added subject
  } catch (error) {
    console.error("Error adding subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/remove-subject/:subjectId", async (req, res) => {
  const { subjectId } = req.params; // subjectId is the _id of the subject to be removed

  // Validate subjectId
  if (!mongoose.isValidObjectId(subjectId)) {
    return res.status(400).json({ error: "Invalid subject ID" });
  }

  try {
    // Find the course that contains the subject
    const course = await Course.findOne({
      "regulations.semesters.subjects._id": subjectId,
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the regulation, semester, and subject
    let subjectRemoved = false;
    for (const regulation of course.regulations) {
      for (const semester of regulation.semesters) {
        const subjectIndex = semester.subjects.findIndex(
          (subject) => subject._id.toString() === subjectId
        );
        if (subjectIndex !== -1) {
          // Remove the subject from the semester's subjects array
          semester.subjects.splice(subjectIndex, 1);
          subjectRemoved = true;
          break;
        }
      }
      if (subjectRemoved) break;
    }

    if (!subjectRemoved) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Save the updated course
    await course.save();

    res.status(200).json({ message: "Subject removed successfully" });
  } catch (error) {
    console.error("Error removing subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/fetch-semesters/:courseId/:regulationYear", async (req, res) => {
  const { courseId, regulationYear } = req.params; // courseId is the _id of the course, regulationYear is the year (e.g., "2023")

  try {
    // Find the course by _id
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the regulation by year
    const regulation = course.regulations.find((reg) => reg.year === regulationYear);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    // Return the semesters for the regulation
    res.status(200).json(regulation.semesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/update-subject/:subjectId", async (req, res) => {
  const { subjectId } = req.params; // subjectId is the _id of the subject to be updated
  const updatedSubject = req.body; // Updated subject details

  try {
    // Find the course that contains the subject
    const course = await Course.findOne({
      "regulations.semesters.subjects._id": subjectId,
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the regulation, semester, and subject
    let subjectUpdated = false;
    for (const regulation of course.regulations) {
      for (const semester of regulation.semesters) {
        const subjectIndex = semester.subjects.findIndex(
          (subject) => subject._id.toString() === subjectId
        );
        if (subjectIndex !== -1) {
          // Update the subject with the new details
          semester.subjects[subjectIndex] = {
            ...semester.subjects[subjectIndex],
            ...updatedSubject,
          };
          subjectUpdated = true;
          break;
        }
      }
      if (subjectUpdated) break;
    }

    if (!subjectUpdated) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Save the updated course
    await course.save();

    res.status(200).json(updatedSubject); // Return the updated subject
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/fetch-courses", async (req, res) => {
  try {
    const courses = await Course.find({}, { course_name: 1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/fetch-regulations-admin/:course_name", async (req, res) => {
  const { course_name } = req.params;
  console.log(course_name);
  try {
    // Find the course by course_name (not _id)
    const course = await Course.findOne({course_name:course_name});
    console.log("1");
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Extract regulations from the course document
    const regulations = course.regulations.map(regulation => regulation.year);
    
    res.status(200).json(regulations);
  } catch (error) {
    console.error("Error fetching regulations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Student Login Route
app.post('/studentlogin', async (req, res) => {
  try {
    console.log(req.body);
    const { studentId, password } = req.body;
    if (!studentId || !password) return res.status(400).json({ message: 'Missing credentials' });

    const student = await StudentAcc.findOne({ studentId });
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = { id: student._id, studentId: student.studentId };

    req.session.save(err => {
      if (err) return res.status(500).json({ message: 'Session save failed' });
      res.status(200).json({ message: 'Login successful', student: { studentId: student.studentId } });
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


const setFilled = async (studentId) => {
  try {
    const student = await StudentAcc.findOneAndUpdate(
      { studentId },                // Filter condition
      { $set: { filled: 1, can_fill: 0 } }, // Update fields
      { new: true }                 // Options (return updated document)
    );

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  } catch (error) {
    throw new Error(error.message);
  }
};



app.get("/student/fetch", async (req, res) => {
  console.log("UserId: "+req.query.userId);
  const { userId } = req.query;
  
  // Validate input
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    // Find the student by studentId
    console.log("stident Id: "+userId);
    const student = await StudentAcc.findOne({ studentId: userId });
    
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Return the branch and reset status
    res.status(200).json({
      success: true,
      branch: student.branch,
      reset: student.reset,
    });
  } catch (error) {
    console.error("Error fetching student account status:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
});

// backend route (Express.js)
app.get('/students-details/:studentId', async (req, res) => {
  try {
    console.log(req.params); // Log the params for debugging
    const studentId = req.params.studentId; // Use the correct parameter name
    const student = await Student.findOne({ 'personalInformation.register': studentId }); // Await the query
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error fetching student details' });
  }
});

app.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    // Fetch student details from the database
    const student = await StudentAcc.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the required fields
    res.json({
      studentId: student.studentId,
      name: student.name,
      branch: student.branch,
      regulation: student.regulation,
      from_year: student.from_year,
      to_year: student.to_year,
      can_fill: student.can_fill,
      facultyAdvisor: student.facultyAdvisor,
      can_enroll: student.can_enroll,
      enrolled: student.enrolled,
      can_fill_grades: student.can_fill_grades,
      grades_filled: student.grades_filled,
      class: student._class,
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post("/student/reset-password", async (req, res) => {
  const { studentId, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!studentId || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  try {
    // Find the student by studentId
    const student = await StudentAcc.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password and set reset to 1
    student.password = hashedPassword;
    student.reset = 1;

    // Save the updated student document
    await student.save();

    res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
});

// Add this route to your student routes
app.get('/student-class/all', async (req, res) => {
  try {
    const students = await StudentAcc.find({});
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

app.post('/student-class/update-can-fill', async (req, res) => {
  try {
    const { branch, regulation, from_year, to_year } = req.body;
    
    const result = await StudentAcc.updateMany(
      { 
        branch,
        regulation,
        from_year,
        to_year
      },
      { $set: { can_fill: 1 } }
    );

    res.json({ 
      success: true,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

//Enabling a class for semester enrollment
app.post('/student-class/update-can-enroll', async (req, res) => {
  try {
    const { branch, regulation, from_year, to_year ,sem_no} = req.body;
    
    const result = await StudentAcc.updateMany(
      { 
        branch,
        regulation,
        from_year,
        to_year
      },
      { $set: { can_enroll: sem_no } }
    );

    res.json({ 
      success: true,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


app.get('/faculty/advisors', async (req, res) => {
  try {
    const facultyAdvisors = await Faculty.find({ additional_role: 'Faculty Advisor' });
    res.status(200).json(facultyAdvisors);
  } catch (error) {
    console.error('Error fetching faculty advisors:', error);
    res.status(500).json({ message: 'Failed to fetch faculty advisors' });
  }
});


const storage = multer.memoryStorage(); // Store files in memory first

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadMiddleware = upload.fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "xMarksheet", maxCount: 1 },
  { name: "xiiMarksheet", maxCount: 1 },
  { name: "ugProvisionalCertificate", maxCount: 1 },
  { name: "scorecard", maxCount: 1 },
  { name: "certificates", maxCount: 5 },
]);

// Student registration route
app.post("/student", uploadMiddleware, async (req, res) => {
  try {
    console.log("Received request:", req.body);

    // Ensure form data is present
    if (!req.body.data) {
      return res.status(400).json({ error: "Missing student data in request" });
    }

    // Parse JSON data
    const studentData = JSON.parse(req.body.data);
    const { personalInformation, education, entranceAndWorkExperience } = studentData;
    
    const { branch = "default", regulation = "default", batch = "default", register = "default" } = personalInformation;

    console.log(`Branch: ${branch}, Regulation: ${regulation}, Batch: ${batch}, Register: ${register}`);

    // Define the correct upload path
    const uploadPath = path.join("uploads", branch, regulation, batch, register);
    
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    // Save files from memory to disk
    const saveFile = async (file, fieldname, index = 0) => {
      if (!file) return null;

      const ext = path.extname(file.originalname);
      const filename = `${register}_${fieldname}${index > 0 ? `_${index}` : ""}${ext}`;
      const filePath = path.join(uploadPath, filename);

      // Write file to disk
      
      await fs.promises.writeFile(filePath, file.buffer);
      return filePath;
    };

    // Process uploaded files
    const movedFilePaths = {};

    if (req.files) {
      movedFilePaths.passportPhoto = await saveFile(req.files.passportPhoto?.[0], "passportPhoto");
      movedFilePaths.xMarksheet = await saveFile(req.files.xMarksheet?.[0], "xMarksheet");
      movedFilePaths.xiiMarksheet = await saveFile(req.files.xiiMarksheet?.[0], "xiiMarksheet");
      movedFilePaths.ugProvisionalCertificate = await saveFile(req.files.ugProvisionalCertificate?.[0], "ugProvisionalCertificate");
      movedFilePaths.scorecard = await saveFile(req.files.scorecard?.[0], "scorecard");

      if (req.files.certificates) {
        movedFilePaths.certificates = await Promise.all(
          req.files.certificates.map((file, index) => saveFile(file, "certificate", index))
        );
      }
    }

    // Merge file paths into student data
    const completeData = {
      ...studentData,
      personalInformation: {
        ...personalInformation,
        passportPhoto: movedFilePaths.passportPhoto || "",
      },
      education: {
        ...education,
        xMarksheet: movedFilePaths.xMarksheet || "",
        xiiMarksheet: movedFilePaths.xiiMarksheet || "",
        ugProvisionalCertificate: movedFilePaths.ugProvisionalCertificate || "",
      },
      entranceAndWorkExperience: {
        ...entranceAndWorkExperience,
        scorecard: movedFilePaths.scorecard || "",
        workExperience: entranceAndWorkExperience.workExperience.map((exp, index) => ({
          ...exp,
          certificate: movedFilePaths.certificates?.[index] || "",
        })),
      },
    };
    
    console.log("Saving student data...");
    
    // Check if the student already exists
    const existingStudent = await Student.findOne({ "personalInformation.register": register });
    
    if (existingStudent) {
      // Update the existing student record
      Object.assign(existingStudent, completeData); // Merge new data into the existing record
      await existingStudent.save(); // Save the updated record
      console.log("Student data updated successfully!");
    } else {
      // Create a new student record
      const student = new Student(completeData);
      await student.save();
      
      console.log("Student data saved successfully!");
      
    }
    const status_update = await setFilled(register);
      console.log(status_update);
    
    res.status(201).json({ message: "Student data saved/updated successfully!", student: existingStudent || student });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

//Start of Student enrollment api s

app.post('/enable-student-enroll',async(req,res)=>{
  try{
    const {register,sem_no,grades} = req.body;
    if(grades){
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_fill_grades:sem_no,grades_filled:"0"}});
      res.status(200).json({ message: "Student Grade Filling enabled successfully!"});
    }else{
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_enroll:sem_no,enrolled:"0"}});
      res.status(200).json({ message: "Student enabled successfully!"});
    }
    
  }catch(error){
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

app.post('/disable-student-enroll',async(req,res)=>{
  try{
    const {register,sem_no,grades} = req.body;
    if(grades){
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_fill_grades:"0",grades_filled:"0"}});
      res.status(200).json({ message: "Student Grade Filling disabled successfully!"});
    }else{
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_enroll:"0",enrolled:"0"}});
      res.status(200).json({ message: "Student disabled successfully!"});
    }
    
  }catch(error){
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

//Get semester numbers for a course
app.get("/get-semester-numbers", async (req, res) => {
  try {
    const { course_name, regulation } = req.query;
    console.log(req.query);
    // Validate request parameters
    if (!course_name || !regulation) {
      return res.status(400).json({ message: "course_name and regulation are required" });
    }
    // Find the course by course_name and regulation
    const course = await Course.findOne(
      { course_name, "regulations.year": regulation },
      { "regulations.$": 1 } // Project only the matching regulation
    );
    if (!course) {
      return res.status(404).json({ message: "Course or regulation not found" });
    }

    // Extract semester numbers from the matching regulation
    const semesters = course.regulations[0].semesters.map((sem) => sem.sem_no);

    // Send response
    res.status(200).json({ semesters });
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}); 

//Get semester details when branch, regulation and sem_no is provided
app.get("/semester-details", async (req, res) => {
  try {
    const { course_name, year, sem_no } = req.query;
    console.log(req.query);

    // Validate request parameters
    if (!course_name || !year || !sem_no) {
      return res.status(400).json({ message: "course_name, year, and semester number are required" });
    }

    // Find the course by course_name, year, and semester number
    const course = await Course.findOne(
      {
        course_name,
        "regulations.year": year,
        "regulations.semesters.sem_no": sem_no,
      },
      {
        "regulations.$": 1, // Return only the matching regulation
      }
    );

    if (!course) {
      return res.status(404).json({ message: "Course, regulation, or semester not found" });
    }

    // Extract the matching regulation
    const regulation = course.regulations[0];

    // Find the matching semester in the regulation
    const matchingSemester = regulation.semesters.find((sem) => sem.sem_no === parseInt(sem_no));
    
    if (!matchingSemester) {
      return res.status(404).json({ message: "Semester not found" });
    }
    const subjects = matchingSemester.subjects;

    if (subjects.length===0) {
      return res.status(404).json({ message: "Subjects not found" });
    }
    // Extract semester numbers from the matching regulation
    const semesters = regulation.semesters.map((sem) => sem.sem_no);

    // Send response
    res.status(200).json({ subjects});
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Student enrolling to a semester
app.post('/student/enroll/:studentId/:semesterNumber', async (req, res) => {
  const { studentId, semesterNumber } = req.params;
  const {course_name,year,sem_no,batch} = req.body;
  console.log(req.params);
  try {
    // Step 1: Update the student's enrollment status
    const result = await StudentAcc.updateOne(
      { studentId }, // Query to find the student
      { $set: { enrolled: sem_no, can_enroll: 0 } } // Update fields
    );

    // Step 2: Check if the student was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    //Update the StudentGrade and StudentCourse Collections during an enrollment
    const subjects = await axios.get("http://localhost:5000/semester-details",{
      withCredentials: true,
      params: {
        course_name: course_name,
        year: year,
        sem_no: Number(sem_no.split(" ")[0]),
      
      },
  });
    console.log("Subjects: "+subjects.data.subjects);

    const enrolledCourses = subjects.data.subjects.map((subject) => ({
      courseCode: subject.subject_code, // Use subject_code as the unique identifier
      semester: semesterNumber,
      confirmation: false,
      grade: null,
      isReEnrolled: false,
    }));
    // Step 1: Remove existing courses with the same courseCode
await StudentGrades.updateOne(
  { studentId, branch: course_name, regulation: year, batch },
  { $pull: { enrolledCourses: { courseCode: { $in: enrolledCourses.map((c) => c.courseCode) } } } }
);

// Step 2: Add the new courses
const studentGradeUpdate = await StudentGrades.findOneAndUpdate(
  { studentId, branch: course_name, regulation: year, batch },
  { $push: { enrolledCourses: { $each: enrolledCourses } } },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
    
    console.log('StudentGrades updated:', studentGradeUpdate);
    // Step 3: Fetch the updated student data
    const updatedStudent = await StudentAcc.findOne({ studentId });

    // Step 4: Send success response with the updated student data
    res.status(200).json({ message: 'Enrollment successful', student: updatedStudent });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/get-enrollment-data", async (req, res) => {
  const { branch, regulation, from_year, to_year, _class, sem_no } = req.query;
  console.log(req.query);
  try {
    // Find the enrollment record matching the criteria
    const enrollment = await Enrollment.findOne({
      branch,
      regulation,
      batch: `${from_year}-${to_year}`,
      semester: sem_no,
    });
    console.log("Fetch enrollment: "+enrollment.data);
    if (!enrollment) {
      return res.status(200).json(null);
    }

    // Extract the session (month and year) and status
    const [month, year] = enrollment.session.split(" ");
    const status = enrollment.status;

    // Return the data
    res.status(200).json({ month, year, status });
  } catch (error) {
    console.error("Error fetching enrollment data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/admin/set-enrollment', async (req, res) => {
  const { branch, regulation, from_year, to_year, sem_no,session ,initiated_by,status,grades} = req.body;

  if(grades){
    try {
      const gradesenrollment = await GradesEnrollment.findOneAndUpdate(
          { branch, regulation, batch:from_year+"-"+to_year, semester: sem_no},
          { $set: {session:session , status: status, initiated_by: initiated_by, initiated_time: Date.now() } },
          { new: true, upsert: true }
      );

      res.status(200).json({ message: "Grades Enrollment updated successfully", gradesenrollment });
  } catch (error) {
      console.error("Error updating grades enrollment:", error);
      res.status(500).json({ message: "Internal server error" });
  }
  }else{
    try {
      const enrollment = await Enrollment.findOneAndUpdate(
          { branch, regulation, batch:from_year+"-"+to_year, semester: sem_no},
          { $set: {session:session , status: status, initiated_by: initiated_by, initiated_time: Date.now() } },
          { new: true, upsert: true }
      );

      res.status(200).json({ message: "Enrollment updated successfully", enrollment });
  } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ message: "Internal server error" });
  }
  }
  
});

//Revoke set of students
app.post("/student/enrollment/revoke-all", async (req, res) => {
  try {
    const { branch, year, from_year, to_year, _class } = req.body;

    // Update students matching the criteria
    const updatedStudents = await StudentAcc.updateMany(
      { branch:branch, regulation:year, from_year:from_year, to_year:to_year, _class:_class },
      { $set: { enrolled: 0, can_enroll: 0 } }
    );
    if(updatedStudents){
      console.log("Revoked all!"+updatedStudents.length);
    }
    res.status(200).json({ message: "Enrollment revoked successfully", updatedStudents });
  } catch (error) {
    res.status(500).json({ message: "Error revoking enrollments", error });
  }
});

//Enable set of students
app.post("/student/enrollment/enable-all/:semesterNumber", async (req, res) => {
  try {
    const { branch, year, from_year, to_year, _class ,sess_month,sess_year,grades} = req.body;
    const {semesterNumber}  = req.params;

    if(grades){
      const updatedStudents = await StudentAcc.updateMany(
        { branch:branch, regulation:year, from_year:from_year, to_year:to_year, _class:_class },
        { $set: { grades_filled: "0", can_fill_grades: semesterNumber } }
      );
      if(updatedStudents){
        console.log("Enabled all!"+updatedStudents.length);
      }
      res.status(200).json({ message: "Grade Enrollment enabled successfully", updatedStudents });
    
    }else{
      // Update students matching the criteria
    const updatedStudents = await StudentAcc.updateMany(
      { branch:branch, regulation:year, from_year:from_year, to_year:to_year, _class:_class },
      { $set: { enrolled: 0, can_enroll: semesterNumber+" "+sess_month+" "+sess_year } }
    );
    if(updatedStudents){
      console.log("Enabled all!"+updatedStudents.length);
    }
    res.status(200).json({ message: "Enrollment enabled successfully", updatedStudents });
  
    }
    } catch (error) {
    res.status(500).json({ message: "Error enabling enrollments", error });
  }
});

//Disable a set of students
app.post("/student/enrollment/disable-all/:semesterNumber", async (req, res) => {
  try {
    const { branch, year, from_year, to_year, _class ,grades} = req.body;
    const {semesterNumber}  = req.params;

    if(grades){
      const updatedStudents = await StudentAcc.updateMany(
        { branch:branch, regulation:year, from_year:from_year, to_year:to_year, _class:_class },
        { $set: { grades_filled: "0", can_fill_grades: "0" } }
      );
      if(updatedStudents){
        console.log("Disabled all!"+updatedStudents.length);
      }
      res.status(200).json({ message: "Enrollment disabled successfully", updatedStudents });
    
    }else{
      const updatedStudents = await StudentAcc.updateMany(
        { branch:branch, regulation:year, from_year:from_year, to_year:to_year, _class:_class },
        { $set: { enrolled: "0", can_enroll: "0" } }
      );
      if(updatedStudents){
        console.log("Disabled all!"+updatedStudents.length);
      }
      res.status(200).json({ message: "Enrollment disabled successfully", updatedStudents });
    
    }
    // Update students matching the criteria
    } catch (error) {
    res.status(500).json({ message: "Error disabling enrollments", error });
  }
});

//End of Student enrollment api s

app.get('/file', (req, res) => {
  const filePath = req.query.path; // Get the absolute path from the query parameter

  if (!filePath) {
    return res.status(400).json({ message: 'File path is required' });
  }

  // Validate that the file path is within the "uploads" directory
  const uploadsDir = path.join(__dirname, 'uploads');
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if the file exists
  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Send the file
  res.sendFile(resolvedPath);
});

app.post('/move-files', async (req, res) => {
  const { filePaths } = req.body; // Array of file paths to move

  try {
    // Ensure the approved-uploads directory exists
    const approvedUploadsDir = path.join(__dirname, 'approved-uploads');
    if (!fs.existsSync(approvedUploadsDir)) {
      fs.mkdirSync(approvedUploadsDir, { recursive: true });
    }

    // Move each file
    filePaths.forEach((filePath) => {
      // Extract the relative path from the full filePath
      const relativePath = path.relative(path.join(__dirname, 'uploads'), filePath);
      
      const sourcePath = filePath; // Use the full path directly
      const destinationPath = path.join(__dirname, 'approved-uploads', relativePath);

      // Ensure the destination directory exists
      const destinationDir = path.dirname(destinationPath);
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }

      // Move the file
      fs.renameSync(sourcePath, destinationPath);
    });

    res.json({ message: 'Files moved successfully' });
  } catch (error) {
    console.error('Error moving files:', error);
    res.status(500).json({ message: 'Error moving files' });
  }
});

app.post('/move-student', async (req, res) => {
  const { registerNumber } = req.body; // Registration number of the student to move

  try {
    // Find the student in the original collection
    const student = await Student.findOne({ "personalInformation.register": registerNumber });
    

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create a new document in the StudentDetails collection
    const studentDetails = new StudentDetails({
      personalInformation: student.personalInformation,
      familyInformation: student.familyInformation,
      education: student.education,
      entranceAndWorkExperience: student.entranceAndWorkExperience,
      acceptance: student.acceptance
    });

    // Save the document to the new collection
    await studentDetails.save();
    const result = await StudentAcc.updateOne(
      { studentId: registerNumber },  // Filter
      { $set: { approved: 1 } }  // Update
    ).exec();
    res.json({ message: 'Student details moved successfully' });
  } catch (error) {
    console.error('Error moving student:', error);
    res.status(500).json({ message: 'Error moving student details' });
  }
});

app.post('/save-page-data', uploadMiddleware, async (req, res) => {
  try {
    console.log("Received request:", req.body);

    // Ensure form data is present
    if (!req.body.data) {
      return res.status(400).json({ error: "Missing student data in request" });
    }

    // Parse JSON data
    const pageData = JSON.parse(req.body.data);
    const { fields } = pageData;

    // Extract necessary fields for directory structure
    const { branch = "default", regulation = "default", batch = "default", register = "default" } = fields;

    console.log(`Branch: ${branch}, Regulation: ${regulation}, Batch: ${batch}, Register: ${register}`);

    // Define the correct upload path
    const uploadPath = path.join("uploads", branch, regulation, batch, register);

    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    // Save files from memory to disk
    const saveFile = async (file, fieldname, index = 0) => {
      if (!file) {
        console.warn(`No file provided for ${fieldname}`);
        return null;
      }

      const ext = path.extname(file.originalname);
      const filename = `${register}_${fieldname}${index > 0 ? `_${index}` : ""}${ext}`;
      const relativeFilePath = path.join("uploads", branch, regulation, batch, register, filename); // Relative path
      const absoluteFilePath = path.join(process.cwd(), relativeFilePath); // Absolute path

      // Write file to disk
      await fs.promises.writeFile(absoluteFilePath, file.buffer);
      console.log(`File saved: ${relativeFilePath}`);
      return relativeFilePath; // Return relative path
    };

    // Process uploaded files
    const movedFilePaths = {};

    if (req.files) {
      console.log("Uploaded files:", req.files);

      // Save passport photo (if present)
      if (pageData.personalInformation && req.files.passportPhoto && req.files.passportPhoto[0]) {
        movedFilePaths.passportPhoto = await saveFile(req.files.passportPhoto[0], "passportPhoto");
      }
      


      // Save education-related files ONLY if education data is present in the request
      if (pageData.education) {
        if (req.files.xMarksheet && req.files.xMarksheet[0]) {
          movedFilePaths.xMarksheet = await saveFile(req.files.xMarksheet[0], "xMarksheet");
        }
        if (req.files.xiiMarksheet && req.files.xiiMarksheet[0]) {
          movedFilePaths.xiiMarksheet = await saveFile(req.files.xiiMarksheet[0], "xiiMarksheet");
        }
        if (req.files.ugProvisionalCertificate && req.files.ugProvisionalCertificate[0]) {
          movedFilePaths.ugProvisionalCertificate = await saveFile(req.files.ugProvisionalCertificate[0], "ugProvisionalCertificate");
        }
      }

      // Save entrance and work experience files ONLY if data is present in the request
      if (pageData.entranceAndWorkExperience) {
        if (req.files.scorecard && req.files.scorecard[0]) {
          movedFilePaths.scorecard = await saveFile(req.files.scorecard[0], "scorecard");
        }
        if (req.files.certificates) {
          movedFilePaths.certificates = await Promise.all(
            req.files.certificates.map((file, index) => saveFile(file, "certificate", index))
          );
        }
      }
    }

    // Merge file paths into page data
    const completeData = {
      ...pageData,
      personalInformation: pageData.personalInformation
        ? {
            ...pageData.personalInformation,
            passportPhoto: movedFilePaths.passportPhoto || pageData.personalInformation.passportPhoto || "",
            aadharFile: movedFilePaths.aadharFile || pageData.personalInformation.aadharFile || "",
          }
        : undefined,
      education: pageData.education
        ? {
            ...pageData.education,
            xMarksheet: movedFilePaths.xMarksheet || pageData.education.xMarksheet || "",
            xiiMarksheet: movedFilePaths.xiiMarksheet || pageData.education.xiiMarksheet || "",
            ugProvisionalCertificate: movedFilePaths.ugProvisionalCertificate || pageData.education.ugProvisionalCertificate || "",
          }
        : undefined,
      entranceAndWorkExperience: pageData.entranceAndWorkExperience
        ? {
            ...pageData.entranceAndWorkExperience,
            scorecard: movedFilePaths.scorecard || pageData.entranceAndWorkExperience.scorecard || "",
            workExperience: pageData.entranceAndWorkExperience.workExperience
              ? pageData.entranceAndWorkExperience.workExperience.map((exp, index) => ({
                  ...exp,
                  certificate: movedFilePaths.certificates?.[index] || exp.certificate || "",
                }))
              : [],
          }
        : undefined,
    };

    // Save page data to the database
    console.log("Saving page data...");

    // Find the existing student record
    const student = await Student.findOne({ "personalInformation.register": register });
    console.log("1");
    if (student) {
      // Merge incoming data with existing data
      if (completeData.personalInformation) {
        student.personalInformation = {
          ...student.personalInformation,
          ...completeData.personalInformation,
        };
      }
      if (completeData.familyInformation) {
        student.familyInformation = {
          ...student.familyInformation,
          ...completeData.familyInformation,
        };
      }
      if (completeData.education) {
        student.education = {
          ...student.education,
          ...completeData.education,
        };
      }
      if (completeData.entranceAndWorkExperience) {
        student.entranceAndWorkExperience = {
          ...student.entranceAndWorkExperience,
          ...completeData.entranceAndWorkExperience,
        };
      }

      // Save the updated student record
      await student.save();
      console.log("2");
    } else {
      // Create a new student record if it doesn't exist
      const newStudent = new Student(completeData);
      await newStudent.save();
    }

    console.log("Page data saved successfully!");
    console.log("3");
    res.status(200).json({ message: "Page data saved successfully!" });
    console.log("4");
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

app.post('/enable-student',async(req,res)=>{
  try{
    const {register} = req.body;
    
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_fill:1,filled:0}});
      res.status(200).json({ message: "Student enabled successfully!"});
    
    
  }catch(error){
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

app.post('/disable-student',async(req,res)=>{
  try{
    const {register,sem_no} = req.body;
    
      const response = await StudentAcc.updateOne({studentId:register},{$set:{can_fill:0,filled:0}});
      res.status(200).json({ message: "Student disabled successfully!"});
    
    
  }catch(error){
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
});



app.post('/reject-student-details',async(req,res)=>{
  try{
    const {register,reason} = req.body;
    const response = await StudentAcc.updateOne({studentId:register},{$set:{can_fill:1,filled:0,refill:1,reason:reason}});
    res.status(200).json({ message: "Student rejected successfully!"});
  }catch(error){
    console.error("Error processing request:", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack,
    });
  }
})

app.get('/get-course-id',async(req,res)=>{
  try{
  const {course_name} = req.query;
  console.log(course_name);
  if (!course_name ) {
    return res.status(400).json({ message: "course_name is required" });
  }

  // Find the course by course_name, year, and semester number
  const course = await Course.findOne(
    {
      course_name,
    }
  );
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Send response
  res.status(200).json({ course});
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
})

// Grades api
app.post('/student/update-grades', async (req, res) => {
  try {
    const { studentId, branch, regulation, batch, enrolledCourses } = req.body;

    // Validate required fields
    if (!studentId || !branch || !regulation || !batch || !enrolledCourses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate each course
    const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA/U', null];
    for (const course of enrolledCourses) {
      if (!course.courseCode || !course.semester) {
        return res.status(400).json({ error: 'Course code and semester are required for all courses' });
      }
      if (course.grade && !validGrades.includes(course.grade)) {
        return res.status(400).json({ error: `Invalid grade '${course.grade}' for course ${course.courseCode}` });
      }
    }

    // Upsert the student record
    const updatedRecord = await StudentGrades.findOneAndUpdate(
      { studentId },
      {
        studentId,
        branch,
        regulation,
        batch,
        enrolledCourses,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Student grades updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error updating student grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit grades for a semester
app.post('/student/submit-grades', async (req, res) => {
  try {
    const { studentId, semester, grades, submittedBy } = req.body;

    // Validate input
    if (!studentId || !semester || !grades || !submittedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the student record
    const studentRecord = await StudentGrades.findOne({ studentId });
    if (!studentRecord) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const currentDate = new Date();
    const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA/U'];
    const updates = [];

    // Prepare updates for each course
    for (const [courseCode, grade] of Object.entries(grades)) {
      if (!validGrades.includes(grade)) {
        return res.status(400).json({ error: `Invalid grade '${grade}' for course ${courseCode}` });
      }

      const courseIndex = studentRecord.enrolledCourses.findIndex(
        c => c.courseCode === courseCode && c.semester === semester
      );

      if (courseIndex === -1) {
        return res.status(400).json({ error: `Course ${courseCode} not found in semester ${semester}` });
      }

      updates.push({
        [`enrolledCourses.${courseIndex}.grade`]: grade,
        [`enrolledCourses.${courseIndex}.gradeSubmittedAt`]: currentDate,
        [`enrolledCourses.${courseIndex}.gradeSubmittedBy`]: submittedBy
      });
    }

    // Apply all updates
    const updatedRecord = await StudentGrades.findOneAndUpdate(
      { studentId },
      {
        $set: {
          ...updates.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          lastUpdated: currentDate
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Grades submitted successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm grades (for admin/faculty)
app.post('/student/confirm-grades', async (req, res) => {
  try {
    const { studentId, semester, courseCodes, confirmedBy } = req.body;

    // Validate input
    if (!studentId || !semester || !courseCodes || !confirmedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const currentDate = new Date();
    const updates = [];

    // Prepare confirmation updates
    for (const courseCode of courseCodes) {
      updates.push({
        [`enrolledCourses.$[elem].gradeConfirmed`]: true,
        [`enrolledCourses.$[elem].gradeConfirmedAt`]: currentDate,
        [`enrolledCourses.$[elem].confirmation`]: true
      });
    }

    // Apply updates with array filters
    const updatedRecord = await StudentGrades.findOneAndUpdate(
      { studentId },
      {
        $set: {
          ...updates.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          lastUpdated: currentDate
        }
      },
      {
        new: true,
        arrayFilters: [{ 'elem.courseCode': { $in: courseCodes }, 'elem.semester': semester }]
      }
    );

    res.status(200).json({
      message: 'Grades confirmed successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error confirming grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student grades
app.get('/student/grades/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentGrades = await StudentGrades.findOne({ studentId });
    if (!studentGrades) {
      return res.status(404).json({ error: 'Student grades not found' });
    }

    res.status(200).json(studentGrades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get grades by semester
app.get('/student/grades/:studentId/semester/:semester', async (req, res) => {
  try {
    const { studentId, semester } = req.params;

    const studentGrades = await StudentGrades.findOne(
      { studentId, 'enrolledCourses.semester': semester },
      { 'enrolledCourses.$': 1 }
    );

    if (!studentGrades || !studentGrades.enrolledCourses.length) {
      return res.status(404).json({ error: 'No courses found for this semester' });
    }

    res.status(200).json({
      studentId,
      semester,
      courses: studentGrades.enrolledCourses
    });
  } catch (error) {
    console.error('Error fetching semester grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/submit-grades', upload.single('marksheet'), async (req, res) => {
  try {
    console.log('Request received at /submit-grades');
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);
    const { studentId, semester, grades, calculatedGpa } = req.body;
    
    // Validate required fields
    if (!studentId || !semester || !grades || !calculatedGpa) {
      throw new Error('Missing required fields');
    }

    // Parse the grades JSON
    const parsedGrades = JSON.parse(grades);
    
    // Find the student record
    const studentRecord = await StudentGrades.findOne({ studentId });
    
    if (!studentRecord) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    let marksheetPath = null;

    // Process file if uploaded
    if (req.file) {
      // Create uploads directory if it doesn't exist
      const uploadDir = 'uploads/marksheets/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = path.extname(req.file.originalname);
      const filename = `${studentId}-${semester}-${Date.now()}${fileExt}`;
      marksheetPath = path.join(uploadDir, filename);

      // Write buffer to disk
      fs.writeFileSync(marksheetPath, req.file.buffer);
    }

    // Update grades in enrolledCourses
    studentRecord.enrolledCourses = studentRecord.enrolledCourses.map(course => {
      if (course.semester.includes(semester) && parsedGrades[course.courseCode.trim()]) {
        return {
          ...course.toObject(),
          grade: parsedGrades[course.courseCode.trim()],
          gradeSubmittedAt: new Date()
        };
      }
      return course;
    });

    // Add/update semester submission
    studentRecord.semesterSubmissions = studentRecord.semesterSubmissions || {};
    studentRecord.semesterSubmissions.set(semester, {
      gpa: parseFloat(calculatedGpa),
      marksheetPath: marksheetPath, // Store relative path
      submissionDate: new Date(),
      verified: false
    });

    // Save the updated record
    await studentRecord.save();
    const studentacc = await StudentAcc.updateOne(
      { studentId },
      { $set: {can_fill_grades:0, grades_filled: semester } }
    );
    res.status(200).json({ 
      success: true,
      message: 'Grades and marksheet submitted successfully',
      filePath: marksheetPath // For debugging
    });

  } catch (error) {
    console.error('Submission error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit grades',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get student grades
app.get('/student-grades/:studentId/:semester', async (req, res) => {
  try {
    const { studentId, semester } = req.params;
    
    // Find the student's grades
    const grades = await StudentGrades.findOne({ studentId });
    
    if (!grades) {
      return res.status(404).json({ error: 'Student grades not found' });
    }

    // Convert Map to object if needed
    const semesterSubmissions = grades.semesterSubmissions instanceof Map 
      ? Object.fromEntries(grades.semesterSubmissions)
      : grades.semesterSubmissions;

    // Get semester data
    const semesterData = semesterSubmissions[semester];
    
    if (!semesterData) {
      return res.status(404).json({ error: `No data found for semester ${semester}` });
    }

    // Filter enrolled courses for the specified semester with non-null grades
    const coursesWithGrades = grades.enrolledCourses.filter(course => 
      course.semester.includes(semester) && course.grade !== null
    );

    // Prepare response
    const response = {
      studentId: grades.studentId,
      semester,
      gpa: semesterData.gpa,
      submissionDate: semesterData.submissionDate,
      verified: semesterData.verified,
      courses: coursesWithGrades.map(course => ({
        courseCode: course.courseCode,
        courseName: course.courseName || '', // Add if available in your schema
        grade: course.grade,
        gradeSubmittedAt: course.gradeSubmittedAt
      })),
      marksheetPath: semesterData.marksheetPath
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching grade details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve grades
app.post('/admin/approve-grades', async (req, res) => {
  try {
    const { studentId, semester, approvedBy } = req.body;
    const currentDate = new Date();

    // Update semester submissions verification status
    await StudentGrades.updateOne(
      { studentId },
      { 
        $set: { 
          [`semesterSubmissions.${semester}.verified`]: true,
          [`semesterSubmissions.${semester}.verifiedBy`]: approvedBy,
          [`semesterSubmissions.${semester}.verifiedAt`]: currentDate 
        } 
      }
    );

    // Update grade confirmation for each course in the semester
    await StudentGrades.updateOne(
      { studentId },
      {
        $set: {
          "enrolledCourses.$[elem].gradeConfirmed": true,
          "enrolledCourses.$[elem].gradeConfirmedAt": currentDate
        }
      },
      {
        arrayFilters: [
          { "elem.semester": semester, "elem.grade": { $ne: null } }
        ]
      }
    );

    // Update student account status
    await StudentAcc.updateOne(
      { studentId },
      { $set: { grades_approved: semester.toString() } }
    );
    
    res.json({ 
      success: true,
      message: `Grades for semester ${semester} approved successfully`
    });
  } catch (error) {
    console.error('Error approving grades:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Failed to approve grades'
    });
  }
});

// Reject grades
app.post('/admin/reject-grades', async (req, res) => {
  try {
    const { studentId, semester, rejectedBy } = req.body;
    
    await StudentGrades.updateOne(
      { studentId },
      { 
        $set: { 
          [`semesterSubmissions.${semester}.verified`]: false,
          [`semesterSubmissions.${semester}.rejectedBy`]: rejectedBy,
          [`semesterSubmissions.${semester}.rejectedAt`]: new Date() 
        } 
      }
    );
    
    await StudentAcc.updateOne(
      { studentId },
      { $set: { grades_filled: '0' } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve marksheet file
app.get('/marksheet/:studentId/:semester', async (req, res) => {
  try {
    const { studentId, semester } = req.params;
    const grades = await StudentGrades.findOne({ studentId });
    
    if (!grades) {
      return res.status(404).json({ error: 'Grades not found' });
    }
    
    const semesterData = grades.semesterSubmissions.get(semester);
    
    if (!semesterData?.marksheetPath) {
      return res.status(404).json({ error: 'Marksheet not found' });
    }
    
    res.sendFile(path.resolve(semesterData.marksheetPath));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/approved-students', async (req, res) => {
  try {
    const { branch, regulation, semester } = req.query;
    
    const students = await StudentGrades.find({
      branch,
      regulation,
      [`semesterSubmissions.${semester}.verified`]: true
    }).lean();
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));