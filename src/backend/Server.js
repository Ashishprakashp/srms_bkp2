import express from 'express';
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

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
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
      branch: student.branch,
      regulation: student.regulation,
      from_year: student.from_year,
      to_year: student.to_year,
      can_fill: student.can_fill,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));