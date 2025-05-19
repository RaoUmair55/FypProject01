import React from 'react'
import './index.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './Pages/home/HomePage'
import LoginPage from './Pages/auth/login/LoginPage'
import SignupPage from './Pages/auth/signup/SignUpPage'
import NotificationPage from './Pages/notification/NotificationPage'
import ProfilePage from './Pages/profile/ProfilePage'

import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'
import { useEffect } from 'react'
import VerifyOTPPage from './Pages/auth/signup/VerifyEmail'


function App() {
  
  const {data:authUser, isLoading, isError, error} = useQuery({
    queryKey: ['authUser'], // a unique name to this query, also used to refer to it later.
    queryFn: async () => {
      try {
        const res = await fetch("api/auth/getMe");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) { 
          throw new Error(data.error || "Something went wrong")
        }
        console.log("authUser:", data)

        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />

      </div>
    )
  }

  return (
    <div className=' flex max-w-7xl mx-auto gap-10 pt-3'>
      
      
      {authUser && <Sidebar/>}
      <Routes>
        <Route path="/" element={authUser? <HomePage/> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser? <LoginPage/> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser? <SignupPage/> : <Navigate to="/" /> } />
        <Route path="/verify" element={!authUser? <VerifyOTPPage/> : <Navigate to="/" /> } />
        <Route path="/notifications" element={authUser? <NotificationPage/> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={authUser? <ProfilePage/> : <Navigate to="/login" />} />
      </Routes>
      {authUser && <RightPanel/>}
      <Toaster /> 
    </div>
  )
}

export default App;
