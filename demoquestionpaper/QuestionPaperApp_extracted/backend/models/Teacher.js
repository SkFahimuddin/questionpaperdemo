const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  teacherID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  hasSubmitted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Teacher', TeacherSchema);