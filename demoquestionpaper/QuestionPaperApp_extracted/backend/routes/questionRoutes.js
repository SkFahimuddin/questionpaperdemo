const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secret';

function auth(req, res, next){
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// submit a question
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionText, marks, section } = req.body;
    if (!questionText || !marks || !section) return res.status(400).json({ message: 'Missing fields' });
    if (!['A','B','C'].includes(section)) return res.status(400).json({ message: 'Invalid section' });
    const q = new Question({ teacherID: req.user.teacherID, questionText, marks, section });
    await q.save();
    // mark teacher as submitted (optional: you can set a rule on number of questions)
    await Teacher.updateOne({ teacherID: req.user.teacherID }, { hasSubmitted: true });
    res.json({ message: 'Question saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// fetch questions for logged-in teacher
router.get('/my', auth, async (req, res) => {
  const qs = await Question.find({ teacherID: req.user.teacherID });
  res.json(qs);
});

// admin: get all questions
router.get('/all', auth, async (req, res) => {
  const qs = await Question.find({});
  res.json(qs);
});

module.exports = router;