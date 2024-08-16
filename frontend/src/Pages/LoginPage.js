import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please enter both username and password.');
      return;
    }

    // Example validation
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password
      });

      if (response.data.success === 'true') {
        localStorage.setItem('IsLoggedIn', true);
        toast.success('Login successful!');
        navigate('/'); // Navigate to the home page
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
