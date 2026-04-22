import express from 'express'
import {
    appointmentCancel, appointmentComplete, appointmentsDoctor,
    doctorDashboard, doctorList, doctorProfile, incrementView,
    loginDoctor, toggleLike, updateDoctorProfile,
    getDoctorRatings, getVisitStats, getRevenueData, getUpcomingToday
} from '../controller/doctorController.js'
import authDoctor from '../middleware/authDoctor.js'
import authUser from '../middleware/authUser.js'

const doctorRouter = express.Router()

doctorRouter.get('/list',                doctorList)
doctorRouter.post('/login',              loginDoctor)
doctorRouter.get('/appointments',        authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.get('/dashboard',           authDoctor, doctorDashboard)
doctorRouter.get('/profile',             authDoctor, doctorProfile)
doctorRouter.post('/update-profile',     authDoctor, updateDoctorProfile)
doctorRouter.post('/view/:docId',        incrementView)
doctorRouter.post('/like/:docId',        authUser, toggleLike)
doctorRouter.get('/ratings',             authDoctor, getDoctorRatings)
doctorRouter.get('/visit-stats',         authDoctor, getVisitStats)
doctorRouter.get('/revenue',             authDoctor, getRevenueData)
doctorRouter.get('/upcoming-today',      authDoctor, getUpcomingToday)

export default doctorRouter
