import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const navigate = useNavigate()
    const { token, setToken, userData } = useContext(AppContext)

    const [showMenu, setShowMenu] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (showMenu) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showMenu])

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
        setShowMenu(false)
        navigate('/')
    }

    const navLinks = [
        { to: '/',            label: 'Home' },
        { to: '/doctors',     label: 'All Doctors' },
        { to: '/about',       label: 'About' },
        { to: '/contact',     label: 'Contact' },
    ]

    return (
        <>
            <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'} border-b rounded-b-2xl border-gray-100`}>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16 sm:h-18'>

                        {/* Logo */}
                        <img
                            onClick={() => navigate('/')}
                            className='w-32 sm:w-40 cursor-pointer shrink-0'
                            src={assets.logo}
                            alt="DocNest"
                        />

                        {/* Desktop Nav Links */}
                        <ul className='hidden md:flex items-center gap-1'>
                            {navLinks.map(({ to, label }) => (
                                <NavLink key={to} to={to}>
                                    {({ isActive }) => (
                                        <li className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
                                            ${isActive
                                                ? 'text-primary bg-primary/5'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}>
                                            {label}
                                            {isActive && (
                                                <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full' />
                                            )}
                                        </li>
                                    )}
                                </NavLink>
                            ))}
                        </ul>

                        {/* Right Section */}
                        <div className='flex items-center gap-3'>

                            {/* Desktop — logged in */}
                            {token && userData ? (
                                <div className='hidden md:flex items-center gap-2 cursor-pointer group relative'>
                                    <img
                                        className='w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all'
                                        src={userData.image}
                                        alt={userData.name}
                                    />
                                    <div className='flex flex-col leading-tight'>
                                        <span className='text-xs font-semibold text-gray-800 max-w-[100px] truncate'>{userData.name}</span>
                                        <span className='text-[10px] text-gray-400'>Patient</span>
                                    </div>
                                    <img className='w-2.5 opacity-50 group-hover:opacity-100 transition' src={assets.dropdown_icon} alt="" />

                                    {/* Dropdown */}
                                    <div className='absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0'>
                                        <div className='px-4 py-2 border-b border-gray-50 mb-1'>
                                            <p className='text-xs text-gray-400'>Signed in as</p>
                                            <p className='text-sm font-semibold text-gray-800 truncate'>{userData.name}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/my-profile')}
                                            className='w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition'
                                        >
                                            <span><img src={assets.userIcon} className='h-4 w-4' alt="" /></span> My Profile
                                        </button>
                                        <button
                                            onClick={() => navigate('/my-appointments')}
                                            className='w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition'
                                        >
                                            <span><img src={assets.appointiconIcon} className='h-4 w-4' alt="" /></span> My Appointments
                                        </button>
                                        <div className='border-t border-gray-50 mt-1 pt-1'>
                                            <button
                                                onClick={logout}
                                                className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition'
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className='hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md'
                                >
                                    Create Account
                                </button>
                            )}

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setShowMenu(true)}
                                className='md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition'
                                aria-label='Open menu'
                            >
                                <span className='w-5 h-0.5 bg-gray-700 rounded-full' />
                                <span className='w-5 h-0.5 bg-gray-700 rounded-full' />
                                <span className='w-3 h-0.5 bg-gray-700 rounded-full self-start ml-1' />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${showMenu ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showMenu ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowMenu(false)}
                />

                {/* Drawer */}
                <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Drawer Header */}
                    <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                        <img src={assets.logo} className='w-28' alt="DocNest" />
                        <button
                            onClick={() => setShowMenu(false)}
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition'
                            aria-label='Close menu'
                        >
                            <img src={assets.cross_icon} className='w-4 h-4' alt="close" />
                        </button>
                    </div>

                    {/* User Info (if logged in) */}
                    {token && userData && (
                        <div className='flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100'>
                            <img
                                className='w-11 h-11 rounded-full object-cover ring-2 ring-primary/20'
                                src={userData.image}
                                alt={userData.name}
                            />
                            <div>
                                <p className='text-sm font-semibold text-gray-800'>{userData.name}</p>
                                <p className='text-xs text-gray-400'>Patient Account</p>
                            </div>
                        </div>
                    )}

                    {/* Nav Links */}
                    <ul className='flex flex-col px-3 py-4 gap-1 flex-1'>
                        {navLinks.map(({ to, label }) => (
                            <NavLink key={to} to={to} onClick={() => setShowMenu(false)}>
                                {({ isActive }) => (
                                    <li className={`px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}>
                                        {label}
                                    </li>
                                )}
                            </NavLink>
                        ))}

                        {/* Logged in — mobile actions */}
                        {token && userData && (
                            <div className='mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1'>
                                <button
                                    onClick={() => { navigate('/my-profile'); setShowMenu(false) }}
                                    className='px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 text-left transition flex items-center gap-2'
                                >
                                    <span><img src={assets.userIcon} className='h-4 w-4' alt="" /></span> My Profile
                                </button>
                                <button
                                    onClick={() => { navigate('/my-appointments'); setShowMenu(false) }}
                                    className='px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 text-left transition flex items-center gap-2'
                                >
                                    <span><img src={assets.appointiconIcon} className='h-4 w-4' alt="" /></span> My Appointments
                                </button>
                            </div>
                        )}
                    </ul>

                    {/* Bottom CTA */}
                    <div className='px-5 py-5 border-t border-gray-100'>
                        {token && userData ? (
                            <button
                                onClick={logout}
                                className='w-full py-3 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition flex items-center justify-center gap-2'
                            >
                                 Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => { navigate('/login'); setShowMenu(false) }}
                                className='w-full py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition shadow-sm'
                            >
                                Create Account
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar