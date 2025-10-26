import React, {useState} from 'react';
import axios from 'axios';

export default function QuestionForm({ token, onSaved, onCheck }){
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(2);
  const [section, setSection] = useState('A');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:5000/api/questions/submit', { questionText, marks: Number(marks), section }, { headers: { Authorization: 'Bearer '+token }});
      setMsg(res.data.message || 'Saved');
      setQuestionText('');
      onSaved();
      onCheck();
    }catch(err){
      setMsg(err.response?.data?.message || 'Error');
    }
  }

  return (
    <div>
      <h5>Submit Question</h5>
      <form onSubmit={submit}>
        <div className="mb-2"><textarea className="form-control" rows="3" placeholder="Question text" value={questionText} onChange={e=>setQuestionText(e.target.value)} /></div>
        <div className="mb-2 d-flex gap-2">
          <select className="form-select" value={marks} onChange={e=>setMarks(e.target.value)}>
            <option value="2">2 marks</option>
            <option value="3">3 marks</option>
            <option value="5">5 marks</option>
          </select>
          <select className="form-select" value={section} onChange={e=>setSection(e.target.value)}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
        <button className="btn btn-success" type="submit">Submit Question</button>
      </form>
      {msg && <div className="mt-2 alert alert-info">{msg}</div>}
    </div>
  );
}