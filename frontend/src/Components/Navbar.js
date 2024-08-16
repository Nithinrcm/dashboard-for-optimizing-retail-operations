import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../styles/image.png';
import profile from '../styles/profile-user.png'; // Add path to your profile icon

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = JSON.parse(localStorage.getItem('IsLoggedIn')) || false; // Retrieve and convert to boolean
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    // Handle logout logic here
    setIsOpen(false);
    localStorage.setItem('IsLoggedIn', false); // Update based on actual logout logic
    navigate('/login');
  };

  const handleLogin = () => {
    // Handle login logic here
    setIsOpen(false);
    navigate('/login');
  };

  const handleClickOutside = (event) => {
    if (event.target.closest('.navbar') === null) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <img src={logo} alt="Product Logo" className="logo" width="50px" />
        <span className="product-name">CrystalCast</span>
      </div>
      <div className="profile-menu-container">
        <img 
          src={profile} 
          alt="Profile Icon" 
          className="profile-icon" 
          onClick={toggleMenu} 
          width="50px"
          height="50px"
        />
        <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <li>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="logout-button" style={{ backgroundColor: 'navy', color: 'white' }}>Logout</button>
            ) : (
              <button onClick={handleLogin} className="logout-button" style={{ backgroundColor: 'navy', color: 'white' }}>Login</button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
