const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

/**
 * Helper: shuffle an array (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = array.slice(); // copy
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Helper: pick N random items from an array (without replacement).
 * If not enough items, returns as many as available.
 */
function pickRandom(array, n) {
  if (!array || !array.length) return [];
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.max(0, n));
}

/**
 * Route: GET /generate
 * Generates a question paper with these rules (as requested):
 * - Section A: 10 questions of 2 marks => 20 marks
 * - Section B: 5 questions of 2 marks + 5 questions of 3 marks => 25 marks
 * - Section C: 7 questions of 5 marks => 35 marks
 * Total = 80 marks
 *
 * Questions are picked randomly from the pool (across all teachers).
 * If the DB does not have enough questions of a particular marks value,
 * the response will include as many as available and also report missing counts.
 */
router.get("/generate", async (req, res) => {
  try {
    const allQuestions = await Question.find().lean();

    if (!allQuestions || allQuestions.length === 0) {
      return res.status(404).json({ message: "No questions found in database." });
    }

    // Group questions by marks
    const qByMarks = {
      2: allQuestions.filter(q => Number(q.marks) === 2),
      3: allQuestions.filter(q => Number(q.marks) === 3),
      5: allQuestions.filter(q => Number(q.marks) === 5),
    };

    // Section definitions
    const sectionA_need = { marks: 2, count: 10 };
    const sectionB_need_part1 = { marks: 2, count: 5 };
    const sectionB_need_part2 = { marks: 3, count: 5 };
    const sectionC_need = { marks: 5, count: 7 };

    // Pick random questions for each part (without replacement across whole paper)
    let usedIds = new Set();
    function pickUnique(mark, count) {
      const pool = qByMarks[mark] || [];
      // filter out already used
      const available = pool.filter(q => !usedIds.has(String(q._id)));
      const picked = pickRandom(available, count);
      picked.forEach(q => usedIds.add(String(q._id)));
      return picked;
    }

    const sectionA = pickUnique(sectionA_need.marks, sectionA_need.count);
    const sectionB_part1 = pickUnique(sectionB_need_part1.marks, sectionB_need_part1.count);
    const sectionB_part2 = pickUnique(sectionB_need_part2.marks, sectionB_need_part2.count);
    const sectionC = pickUnique(sectionC_need.marks, sectionC_need.count);

    const sectionB = [...sectionB_part1, ...sectionB_part2];

    const totalMarksComputed = 
      (sectionA.reduce((s, q) => s + Number(q.marks || 0), 0)) +
      (sectionB.reduce((s, q) => s + Number(q.marks || 0), 0)) +
      (sectionC.reduce((s, q) => s + Number(q.marks || 0), 0));

    // Report shortages if any
    const report = {
      wanted: {
        sectionA: sectionA_need.count,
        sectionB_part1: sectionB_need_part1.count,
        sectionB_part2: sectionB_need_part2.count,
        sectionC: sectionC_need.count
      },
      available: {
        mark2: qByMarks[2].length,
        mark3: qByMarks[3].length,
        mark5: qByMarks[5].length
      },
      pickedCounts: {
        sectionA: sectionA.length,
        sectionB_part1: sectionB_part1.length,
        sectionB_part2: sectionB_part2.length,
        sectionC: sectionC.length
      }
    };

    const questionPaper = {
      meta: {
        totalQuestions: sectionA.length + sectionB.length + sectionC.length,
        totalMarks: totalMarksComputed,
        createdAt: new Date(),
        note: "Questions picked randomly across all teachers. If DB had insufficient questions of a marks value, fewer questions were picked."
      },
      sections: {
        A: {
          title: "Section A – 2 marks each",
          marksEach: 2,
          questions: sectionA
        },
        B: {
          title: "Section B – mix (2 marks & 3 marks)",
          parts: [
            { title: "Part 1 (2 marks each)", marksEach: 2, questions: sectionB_part1 },
            { title: "Part 2 (3 marks each)", marksEach: 3, questions: sectionB_part2 }
          ],
          questions: sectionB
        },
        C: {
          title: "Section C – 5 marks each",
          marksEach: 5,
          questions: sectionC
        }
      },
      report
    };

    return res.json(questionPaper);
  } catch (err) {
    console.error("Error generating paper:", err);
    return res.status(500).json({ message: "Server error while generating paper." });
  }
});

module.exports = router;
