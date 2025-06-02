import React, { lazy, Suspense, useEffect } from 'react';
import './index.css';
import { Navigate, Route, Routes } from 'react-router-dom';

import Sidebar from "./components/common/Sidebar";
import MobileSidebar from "./components/common/MobileSidebar";
import RightPanel from './components/common/RightPanel';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
import CoolLoader from './utils/loader';
import ForgetPassword from './Pages/auth/forgetPassword/ForgetPassword';
// import ResetPassword from './Pages/auth/forgetPassword/ResetPassword';
// Lazy-loaded pages
const ResetPassword = lazy(() => import('./Pages/auth/forgetPassword/ResetPassword'))
const HomePage = lazy(() => import('./Pages/home/HomePage'));
const LoginPage = lazy(() => import('./Pages/auth/login/LoginPage'));
const SignupPage = lazy(() => import('./Pages/auth/signup/SignUpPage'));
const NotificationPage = lazy(() => import('./Pages/notification/NotificationPage'));
const ProfilePage = lazy(() => import('./Pages/profile/ProfilePage'));
const VerifyOTPPage = lazy(() => import('./Pages/auth/signup/VerifyEmail'));

function App() {
  const { data: authUser, isLoading, isError, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch("api/auth/getMe");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='flex max-w-7xl mx-auto gap-2 px-3 md:p-4 md:gap-10 pt-3'>

      {/* Desktop Sidebar */}
      {authUser && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      <Suspense fallback={<div className='flex justify-center items-center w-full h-screen'><CoolLoader height={200} /></div>}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/verify" element={!authUser ? <VerifyOTPPage /> : <Navigate to="/" />} />
          <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
          <Route path="/profile/:id" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path='/resetPassword' element={<ResetPassword />} />
        </Routes>
      </Suspense>
      
      {authUser && <RightPanel />}

      {/* Mobile Sidebar (Bottom Nav) */}
      {authUser && <MobileSidebar />}

      <Toaster />
    </div>
  );
}

export default App;
