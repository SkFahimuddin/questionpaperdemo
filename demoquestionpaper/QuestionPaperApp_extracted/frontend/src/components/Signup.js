import React, {useState} from 'react';
import axios from 'axios';

export default function Signup(){
  const [teacherID, setTeacherID] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:5000/api/auth/signup', { teacherID, name, password });
      setMsg(res.data.message || 'Created');
    }catch(err){
      setMsg(err.response?.data?.message || 'Error');
    }
  }

  return (
    <div>
      <h4>Create Teacher Profile (Signup)</h4>
      <form onSubmit={submit}>
        <div className="mb-2"><input className="form-control" placeholder="Teacher ID" value={teacherID} onChange={e=>setTeacherID(e.target.value)} /></div>
        <div className="mb-2"><input className="form-control" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="mb-2"><input type="password" className="form-control" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn btn-primary" type="submit">Create</button>
      </form>
      {msg && <div className="mt-2 alert alert-info">{msg}</div>}
    </div>
  );
}