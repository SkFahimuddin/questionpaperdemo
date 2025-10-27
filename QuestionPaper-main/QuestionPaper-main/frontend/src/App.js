import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  function onLogin(token, user){
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  function onLogout(){
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <div className="container py-4">
      <h1>Question Paper App</h1>
      {!token ? (
        <div className="row">
          <div className="col-md-6"><Signup /></div>
          <div className="col-md-6"><Login onLogin={onLogin} /></div>
        </div>
      ) : (
        <Dashboard token={token} user={user} onLogout={onLogout} />
      )}
    </div>
  );
}

export default App;