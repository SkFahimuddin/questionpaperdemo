const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const paperRoutes = require('./routes/paperRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/paper', paperRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb+srv://Fahim123:Fahim786@cluster0.rattrsg.mongodb.net/QuestionPaper';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    console.log('Connected to MongoDB');
    app.listen(PORT, ()=> console.log('Server running on port', PORT));
  })
  .catch(err => console.error(err));