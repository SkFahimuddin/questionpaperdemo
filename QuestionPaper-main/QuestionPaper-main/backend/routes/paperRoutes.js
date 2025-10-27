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

// check if all 5 teachers have submitted
router.get('/can-generate', auth, async (req, res) => {
  const teachers = await Teacher.find({});
  if (teachers.length < 5) return res.json({ canGenerate: false, reason: 'Less than 5 teachers registered' });
  const all = teachers.every(t => t.hasSubmitted);
  res.json({ canGenerate: all });
});

// generate paper (simple greedy selection to match format)
router.get('/generate', auth, async (req, res) => {
  const teachers = await Teacher.find({});
  if (teachers.length < 5) return res.status(400).json({ message: 'Need 5 teachers registered' });
  const allSubmitted = teachers.every(t => t.hasSubmitted);
  if (!allSubmitted) return res.status(400).json({ message: 'All teachers must submit first' });

  const allQuestions = await Question.find({}).populate('teacherID', 'name');;
  // Helper function to get random items from an array
function getRandomItems(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Separate questions by marks
const twoMarkQs = allQuestions.filter(q => q.marks === 2);
const fiveMarkQs = allQuestions.filter(q => q.marks === 5);


 function getCO(teacherEmail) {
    switch (teacherEmail) {
      case 'teacher1@gmail.com': return 'CO1';
      case 'teacher2@gmail.com': return 'CO2';
      case 'teacher3@gmail.com': return 'CO3';
      case 'teacher4@gmail.com': return 'CO4';
      case 'teacher5@gmail.com': return 'CO5';
      default: return 'CO?';
    }
  }

// --- SECTION A: 10 random 2-mark questions ---
const sectionA = getRandomItems(twoMarkQs, 10);

// --- SECTION B: 3 questions (each 5+3+2 marks) ---
const sectionB = [];

const threeMarkQs = allQuestions.filter(q => q.marks === 3);
const usedFivesB = getRandomItems(fiveMarkQs, 3);  // 3 five-mark questions
const usedThreesB = getRandomItems(threeMarkQs, 3); // 3 three-mark questions
const remainingTwos = twoMarkQs.filter(q => !sectionA.includes(q));
const usedTwosB = getRandomItems(remainingTwos, 3); // 3 two-mark questions

for (let i = 0; i < 3; i++) {
  const group = [
    usedFivesB[i],
    usedThreesB[i],
    usedTwosB[i]
  ].filter(Boolean);
  if (group.length === 3) sectionB.push(group);
}


// --- SECTION C: 3 questions (each 5+5 marks) ---
const remainingFives = fiveMarkQs.filter(q => !usedFivesB.includes(q));
const usedFivesC = getRandomItems(remainingFives, 6); // need 6 five-mark qs
const sectionC = [];
for (let i = 0; i < 3; i++) {
  const group = [usedFivesC[i * 2], usedFivesC[i * 2 + 1]].filter(Boolean);
  if (group.length === 2) sectionC.push(group);
}


  // Build a simple HTML view
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Question Paper</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f8f9fa;
        margin: 40px;
        color: #333;
      }
      header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      header h1 {
        font-size: 28px;
        margin: 0;
      }
      header h2 {
        font-size: 20px;
        margin-top: 5px;
        color: #555;
      }
      section {
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 25px 30px;
        margin-bottom: 30px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
      h3 {
        border-bottom: 2px solid #808080ff;
        padding-bottom: 5px;
        color: #000000ff;
        font-size: 18px;
      }
      ol {
        margin-top: 10px;
      }
      li {
        margin: 10px 0;
        line-height: 1.6;
      }
      ul {
        list-style-type: disc;
        margin-left: 25px;
      }
      strong {
        color: #444;
      }
      footer {
        text-align: center;
        margin-top: 50px;
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>BTECH CSE_AI</h1>
      <h2>Question Paper</h2>
    </header>

    <section>
      <h3>SECTION A (20 Marks)-(10*2) </h3>
      <ol>
        ${sectionA.map(q => `
          <li>${q.questionText} <strong>(${q.marks}m) [${getCO(q.teacherID)}]</strong></li>
        `).join('')}
      </ol>
    </section>

    <section>
      <h3>SECTION B (30 Marks) — 3 Questions (5 + 3 + 2 )</h3>
      <ol>
        ${sectionB.map((grp, i) => `
          <li>
            <strong>Q${i + 1}:</strong>
            <ul>
              ${grp.map(g => `<li>${g.questionText} (${g.marks}m) [${getCO(g.teacherID)}]</li>`).join('')}
            </ul>
          </li>
        `).join('')}
      </ol>
    </section>

    <section>
      <h3>SECTION C (30 Marks) — 3 Questions (5 + 5 )</h3>
      <ol>
        ${sectionC.map((grp, i) => `
          <li>
            <strong>Q${i + 1}:</strong>
            <ul>
              ${grp.map(g => `<li>${g.questionText} (${g.marks}m) [${getCO(g.teacherID)}]</li>`).join('')}
            </ul>
          </li>
        `).join('')}
      </ol>
    </section>

    <footer>
      <p>Generated by Question Paper System © ${new Date().getFullYear()}</p>
    </footer>
  </body>
  </html>
  `;

  res.send(html);
});

module.exports = router;