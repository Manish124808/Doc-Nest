import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About'
import Appointment from './pages/Appointment'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'

import Dashboard from './pages/Admin/Dashboard'
import AllApointments from './pages/Admin/AllApointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorList from './pages/Admin/DoctorList'

import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import InstallPrompt from './components/InstallPrompt'
import AdminLayout from './components/AdminLayout'

import { AppContext } from './context/AppContext'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'

const App = () => {
  const { token } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  if (aToken) {
    return (
      <AdminLayout role="admin">
        <ToastContainer />
        <Routes>
          <Route path='/' element={<Navigate to='/admin-dashboard' />} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllApointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorList />} />
          <Route path='*' element={<Navigate to='/admin-dashboard' />} />
        </Routes>
      </AdminLayout>
    )
  }

  if (dToken) {
    return (
      <AdminLayout role="doctor">
        <ToastContainer />
        <Routes>
          <Route path='/' element={<Navigate to='/doctor-dashboard' />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='*' element={<Navigate to='/doctor-dashboard' />} />
        </Routes>
      </AdminLayout>
    )
  }

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={token ? <MyProfile /> : <Navigate to='/login' />} />
        <Route path='/my-appointments' element={token ? <MyAppointments /> : <Navigate to='/login' />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
      <Footer />
      <Chatbot />
      <InstallPrompt />
    </div>
  )
}

export default App
