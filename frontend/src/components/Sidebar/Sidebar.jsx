import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('auth_token');

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <Link 
        to="/" 
        className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
      >
        <span>Главная страница</span>
      </Link>

      <Link
          to="/disk" 
          className={`sidebar-item ${isActive('/disk') ? 'active' : ''}`}
        >
          <span>Мой диск</span>
      </Link>
      
      {isLoggedIn ? (
        <div 
          className="sidebar-item logout"
          onClick={handleLogout}
        >
          <span>Выйти</span>
        </div>
      ) : (
        <>
          <Link 
            to="/login" 
            className={`sidebar-item ${isActive('/login') ? 'active' : ''}`}
          >
            <span>Войти</span>
          </Link>
          
          <Link 
            to="/register" 
            className={`sidebar-item ${isActive('/register') ? 'active' : ''}`}
          >
            <span>Зарегистрироваться</span>
          </Link>
        </>
      )}
    </div>
  );
};

export default Sidebar;