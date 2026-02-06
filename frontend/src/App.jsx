import React, { lazy, Suspense, useEffect } from 'react';
import './index.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SocketContextProvider } from './context/SocketContext';

import Sidebar from "./components/common/Sidebar";
import MobileSidebar from "./components/common/MobileSidebar";
import RightPanel from './components/common/RightPanel';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import useAuthUser from './hooks/useAuthUser';
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
const DashboardPage = lazy(() => import('./Pages/admin/DashboardPage'));
const StudentManagement = lazy(() => import('./Pages/admin/StudentManagement'));
const UniversityPosts = lazy(() => import('./Pages/admin/UniversityPosts'));
const AdminManagement = lazy(() => import('./Pages/admin/AdminManagement'));
const MarketplacePage = lazy(() => import('./Pages/marketplace/MarketplacePage'));
const EventsPage = lazy(() => import('./Pages/events/EventsPage'));
const StudyResourcesPage = lazy(() => import('./Pages/resources/StudyResourcesPage'));


import api from './utils/api';

function App() {
  const { data: authUser, isLoading } = useAuthUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <SocketContextProvider>
      <div className='flex max-w-7xl mx-auto md:p-4 gap-4 md:gap-6 pt-3 min-h-screen'>

        {/* Desktop Sidebar */}
        {authUser && (
          <div className="hidden md:block w-72 shrink-0">
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
            <Route path="/admin/dashboard" element={authUser && (authUser.role === 'admin' || authUser.role === 'superadmin') ? <DashboardPage /> : <Navigate to="/" />} />
            <Route path="/admin/students" element={authUser && (authUser.role === 'admin' || authUser.role === 'superadmin') ? <StudentManagement /> : <Navigate to="/" />} />
            <Route path="/admin/posts" element={authUser && (authUser.role === 'admin' || authUser.role === 'superadmin') ? <UniversityPosts /> : <Navigate to="/" />} />
            <Route path="/admin/create-user" element={authUser && authUser.role === 'superadmin' ? <AdminManagement /> : <Navigate to="/" />} />
            <Route path="/marketplace" element={authUser ? <MarketplacePage /> : <Navigate to="/login" />} />
            <Route path="/events" element={authUser ? <EventsPage /> : <Navigate to="/login" />} />
            <Route path="/resources" element={authUser ? <StudyResourcesPage /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>

        {authUser && !location.pathname.startsWith('/admin') && <RightPanel />}

        {/* Mobile Sidebar (Bottom Nav) */}
        {authUser && <MobileSidebar />}

        <Toaster />
      </div>
    </SocketContextProvider>
  );
}

export default App;
