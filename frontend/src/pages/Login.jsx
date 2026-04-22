import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const TABS = ['Patient', 'Doctor', 'Admin']

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const { setAToken } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const [tab, setTab] = useState('Patient')
  const [state, setState] = useState('Sign Up') // for Patient: Sign Up / Login
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  const resetForm = () => { setName(''); setEmail(''); setPassword('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      // ── Patient ───────────────────────────────────────────────────
      if (tab === 'Patient') {
        const url = state === 'Sign Up' ? '/api/user/register' : '/api/user/login'
        const body = state === 'Sign Up' ? { name, email, password } : { email, password }
        const { data } = await axios.post(backendUrl + url, body)
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
      // ── Doctor ────────────────────────────────────────────────────
      else if (tab === 'Doctor') {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          navigate('/doctor-dashboard')
        } else {
          toast.error(data.message)
        }
      }
      // ── Admin ─────────────────────────────────────────────────────
      else {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          navigate('/admin-dashboard')
        } else {
          toast.error(data.message)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-[82vh] flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100'>

        {/* Tab bar */}
        <div className='flex border-b border-slate-100'>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); resetForm(); setState('Login') }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t === 'Patient' ? '🧑‍⚕️ ' : t === 'Doctor' ? '👨‍⚕️ ' : '🔐 '}
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className='p-7 flex flex-col gap-4'>

          <div className='text-center mb-1'>
            <h2 className='text-xl font-bold text-slate-800'>
              {tab === 'Patient' ? (state === 'Sign Up' ? 'Create Account' : 'Welcome Back') :
               tab === 'Doctor' ? 'Doctor Portal' : 'Admin Panel'}
            </h2>
            <p className='text-sm text-slate-400 mt-1'>
              {tab === 'Patient' ? 'Book appointments, manage your health' :
               tab === 'Doctor' ? 'Access your dashboard and appointments' :
               'Manage doctors, appointments & platform'}
            </p>
          </div>

          {/* Name field only for patient sign up */}
          {tab === 'Patient' && state === 'Sign Up' && (
            <div>
              <label className='block text-sm font-medium text-slate-600 mb-1'>Full Name</label>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder='Manish Kushwaha'
                className='w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'
              />
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-slate-600 mb-1'>Email Address</label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={tab === 'Admin' ? 'admin@gmail.com' : 'you@example.com'}
              className='w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-600 mb-1'>Password</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder='••••••••'
              className='w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1'
          >
            {loading
              ? 'Please wait...'
              : tab === 'Patient'
                ? (state === 'Sign Up' ? 'Create Account' : 'Login')
                : `Login as ${tab}`}
          </button>

          {/* Toggle Sign Up / Login only for Patient */}
          {tab === 'Patient' && (
            <p className='text-center text-sm text-slate-500'>
              {state === 'Sign Up' ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => { setState(s => s === 'Sign Up' ? 'Login' : 'Sign Up'); resetForm() }}
                className='text-indigo-600 font-semibold cursor-pointer hover:underline'
              >
                {state === 'Sign Up' ? 'Login' : 'Sign Up'}
              </span>
            </p>
          )}

          {/* Admin hint */}
          {tab === 'Admin' && (
            <p className='text-center text-xs text-slate-400'>
              Default: admin@gmail.com / qwerty
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
