import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Home from './pages/Home'
import Register from './pages/Auth/Register'
import Login from './pages/Auth/Login'
import Disk from './pages/Disk/Disk'
import Sidebar from './components/Sidebar/Sidebar'
import Shared from './pages/SharedFilePage/Shared'
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';


function App() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <div className="home-container">
      <BrowserRouter>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="content">
        <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/register" element={<Register/>} />
            <Route exact path="/login" element={<Login/>} />
            <Route path="/disk" element={<ProtectedRoute element={<Disk/>}/>}/>
            <Route path="/disk/folder/:folderId" element={<ProtectedRoute element={<Disk/>} />} />
            <Route path="/shared/:token" element={<Shared />} />
        </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
