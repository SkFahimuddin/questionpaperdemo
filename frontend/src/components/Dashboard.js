import React, {useState, useEffect} from 'react';
import axios from 'axios';
import QuestionForm from './QuestionForm';

export default function Dashboard({ token, user, onLogout }){
  const [myQuestions, setMyQuestions] = useState([]);
  const [canGenerate, setCanGenerate] = useState(false);

  useEffect(()=> {
    fetchMy();
    checkCan();
  }, []);

  async function fetchMy(){
    try{
      const res = await axios.get('http://localhost:5000/api/questions/my', { headers: { Authorization: 'Bearer '+token }});
      setMyQuestions(res.data);
    }catch(err){ console.error(err); }
  }

  async function checkCan(){
    try{
      const res = await axios.get('http://localhost:5000/api/paper/can-generate', { headers: { Authorization: 'Bearer '+token }});
      setCanGenerate(res.data.canGenerate);
    }catch(err){ console.error(err); }
  }

  async function generate(){
    try{
      const win = window.open('about:blank','_blank');
      const res = await axios.get('http://localhost:5000/api/paper/generate', { headers: { Authorization: 'Bearer '+token }});
      win.document.write(res.data);
      win.document.close();
    }catch(err){
      alert(err.response?.data?.message || 'Error');
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <div>Welcome, <strong>{user?.name || user?.teacherID}</strong></div>
        <div>
          <button className="btn btn-secondary me-2" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <hr />
      <h5>Your Questions</h5>
      <ul>
        {myQuestions.map((q,i)=> <li key={i}>{q.questionText} - ({q.marks}m) - Section {q.section}</li>)}
      </ul>

      <QuestionForm token={token} onSaved={fetchMy} onCheck={checkCan} />

      <hr />
      <div>
        <button className="btn btn-primary" disabled={!canGenerate} onClick={generate}>
          Generate Final Paper (enabled when all 5 teachers submitted)
        </button>
        {!canGenerate && <div className="text-muted mt-2">Waiting for all teachers to submit.</div>}
      </div>
    </div>
  );
}