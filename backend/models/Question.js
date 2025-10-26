const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  teacherID: { type: String, required: true },
  questionText: { type: String, required: true },
  marks: { type: Number, required: true },
  section: { type: String, enum: ['A','B','C'], required: true }
});

module.exports = mongoose.model('Question', QuestionSchema);