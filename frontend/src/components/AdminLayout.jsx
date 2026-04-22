import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { assets } from '../assets/assets'

const AdminLayout = ({ children, role }) => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const logout = () => {
    if (role === 'admin') {
      localStorage.removeItem('aToken')
      setAToken('')
    } else {
      localStorage.removeItem('dToken')
      setDToken('')
    }
    navigate('/')
  }

  const adminLinks = [
    { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/all-appointments', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/add-doctor', icon: assets.add_icon, label: 'Add Doctor' },
    { to: '/doctor-list', icon: assets.people_icon, label: 'Doctors List' },
  ]

  const doctorLinks = [
    { to: '/doctor-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/doctor-appointments', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/doctor-profile', icon: assets.people_icon, label: 'My Profile' },
  ]

  const links = role === 'admin' ? adminLinks : doctorLinks

  return (
    <div className='min-h-screen bg-[#F8F9FD]'>
      {/* Top Navbar */}
      <div className='fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button onClick={() => setSideOpen(o => !o)} className='md:hidden text-slate-600 p-1'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
          <img src={assets.logo} alt='DocNest' className='h-8 object-contain' />
          <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700'>
            {role === 'admin' ? 'Admin' : 'Doctor'}
          </span>
        </div>
        <button
          onClick={logout}
          className='text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition'
        >
          Logout
        </button>
      </div>

      <div className='flex pt-[52px] min-h-screen'>
        {/* Sidebar */}
        <aside className={`fixed top-[52px] left-0 h-[calc(100vh-52px)] w-56 bg-white border-r border-slate-200 z-30 
          transition-transform duration-200 md:translate-x-0 ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className='p-3 mt-2 space-y-1'>
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSideOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <img src={link.icon} alt='' className='w-4 h-4 opacity-70' />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sideOpen && (
          <div className='fixed inset-0 z-20 bg-black/30 md:hidden' onClick={() => setSideOpen(false)} />
        )}

        {/* Main content */}
        <main className='md:ml-56 flex-1 min-h-screen overflow-y-auto p-0'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
