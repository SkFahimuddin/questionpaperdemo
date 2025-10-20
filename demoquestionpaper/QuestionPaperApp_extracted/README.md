# QuestionPaperApp

A simple project with Node.js + Express backend and React frontend for teachers to create profiles, submit questions, and generate an 80-mark question paper.

## Features
- Teachers can signup (create their own teacherID) and login.
- Submit questions with marks and section (A/B/C).
- After 5 teachers have submitted, the "Generate Final Paper" button becomes available and opens the assembled paper.

## Requirements (Windows)
- Node.js (v16+ recommended)
- npm
- MongoDB (locally) or MongoDB Atlas

## Setup Backend
1. Open terminal in `backend` folder.
2. Copy `.env.example` to `.env` and set `MONGO_URI` (e.g. mongodb://localhost:27017/question_paper_app) and `JWT_SECRET`.
3. Install dependencies:
   ```
   cd backend
   npm install
   ```
4. Start server:
   ```
   npm run dev
   ```
   Server runs at `http://localhost:5000`

## Setup Frontend
1. Open another terminal in `frontend` folder.
2. Install dependencies:
   ```
   cd frontend
   npm install
   ```
3. Start frontend:
   ```
   npm start
   ```
   App runs at `http://localhost:3000`

## Notes
- The backend uses a simple `hasSubmitted` flag per teacher once they submit a question (you can refine it to require a certain number/types of questions).
- Paper generation logic is simple and naive: it attempts to pick 2-mark questions for Section A, groups of 5+5+2 for Section B, and pairs of 5+5 for Section C. You can improve the selection algorithm as needed.