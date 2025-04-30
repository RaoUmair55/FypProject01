import React from 'react'
import './index.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './Pages/home/HomePage'
import LoginPage from './Pages/auth/login/LoginPage'
import SignupPage from './Pages/auth/signup/SignUpPage'
import NotificationPage from './Pages/notification/NotificationPage'
import ProfilePage from './Pages/profile/ProfilePage'

import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'

function App() {


  return (
    <div className='flex max-w-6xl mx-auto'>
      
      <Sidebar/>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/notifications" element={<NotificationPage/>}/>
        <Route path="/profile/:username" element={<ProfilePage/>}/>
      </Routes>
      <RightPanel/>
    </div>
  )
}

export default App
