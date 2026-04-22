import axios from 'axios'
import React, { createContext, useState } from 'react'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [dToken, setDToken]       = useState(localStorage.getItem('dToken') ?? '')
  const [appointments, setAppointments] = useState([])
  const [dashData, setDashData]   = useState(false)
  const [profileData, setProfileData] = useState(false)

  // ── Auth header — matches your existing pattern ───────────────────────────
  const authHeader = () => ({ headers: { Authorization: `Bearer ${dToken}` } })

  // ── EXISTING: get all appointments ────────────────────────────────────────
  const getAppointments = async () => {
    try {
      if (!dToken) return
      const { data } = await axios.get(
        backendUrl + '/api/doctor/appointments',
        authHeader()
      )
      if (data.success) {
        setAppointments(data.appointments?.slice().reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ── EXISTING: complete appointment ────────────────────────────────────────
  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/complete-appointment',
        { appointmentId },
        authHeader()
      )
      if (data.success) {
        toast.success(data.message)
        await getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ── EXISTING: cancel appointment ──────────────────────────────────────────
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/cancel-appointment',
        { appointmentId },
        authHeader()
      )
      if (data.success) {
        toast.success(data.message)
        await getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ── EXISTING: get dashboard summary ──────────────────────────────────────
  const getDashData = async () => {
    try {
      if (!dToken) return
      const { data } = await axios.get(
        backendUrl + '/api/doctor/dashboard',
        authHeader()
      )
      if (data.success) {
        setDashData(data.dashData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ── EXISTING: get profile ─────────────────────────────────────────────────
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/doctor/profile',
        authHeader()
      )
      if (data.success) {
        setProfileData(data.profileData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ── NEW: get star ratings breakdown from reviewModel ──────────────────────
  // Returns: { average, totalReviews, byStars: [{stars, count, pct}] } | null
  const getDoctorRatings = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/doctor/ratings',
        authHeader()
      )
      if (data.success) return data.ratings
      toast.error(data.message)
      return null
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      return null
    }
  }

  // ── NEW: get patient visit stats ──────────────────────────────────────────
  // period: 'daily' | 'monthly' | 'yearly'
  // Returns: [{ name, new, ret }]
  const getVisitStats = async (period = 'daily') => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/visit-stats?period=${period}`,
        authHeader()
      )
      if (data.success) return data.visitStats
      toast.error(data.message)
      return []
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      return []
    }
  }

  // ── NEW: get revenue data ─────────────────────────────────────────────────
  // period: 'daily' | 'monthly' | 'yearly'
  // Returns: [{ name, revenue }]
  const getRevenueData = async (period = 'monthly') => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/revenue?period=${period}`,
        authHeader()
      )
      if (data.success) return data.revenueData
      toast.error(data.message)
      return []
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      return []
    }
  }

  // ── NEW: get today's upcoming appointments ────────────────────────────────
  // Returns: appointment array with embedded userData (your schema)
  const getUpcomingToday = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/doctor/upcoming-today',
        authHeader()
      )
      if (data.success) return data.upcoming
      toast.error(data.message)
      return []
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      return []
    }
  }

  const value = {
    dToken, setDToken,
    backendUrl,
    appointments, setAppointments,
    dashData, setDashData,
    profileData, setProfileData,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    getDashData,
    getProfileData,
    // new
    getDoctorRatings,
    getVisitStats,
    getRevenueData,
    getUpcomingToday,
  }

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  )
}

export default DoctorContextProvider