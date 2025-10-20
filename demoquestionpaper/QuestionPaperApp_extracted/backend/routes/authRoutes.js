const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secret';

// signup - create teacher profile
router.post('/signup', async (req, res) => {
  try {
    const { teacherID, name, password } = req.body;
    if (!teacherID || !name || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await Teacher.findOne({ teacherID });
    if (existing) return res.status(400).json({ message: 'TeacherID already exists' });
    const hash = await bcrypt.hash(password, 10);
    const t = new Teacher({ teacherID, name, passwordHash: hash });
    await t.save();
    res.json({ message: 'Teacher created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { teacherID, password } = req.body;
    if (!teacherID || !password) return res.status(400).json({ message: 'Missing fields' });
    const teacher = await Teacher.findOne({ teacherID });
    if (!teacher) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, teacher.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ teacherID: teacher.teacherID, name: teacher.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, teacherID: teacher.teacherID, name: teacher.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;