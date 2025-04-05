// routes/analytics.js
import express from 'express';
import StudentGrades from '../models/StudentGrades.js';

const router = express.Router();

router.get('/gpa/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await StudentGrades.findOne({ studentId });

    if (!result) return res.status(404).json({ message: "Student not found" });

    const data = result.semesterSubmissions.map(sub => ({
      semester: sub.semester,
      gpa: sub.gpa
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
