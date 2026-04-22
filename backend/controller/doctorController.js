import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import reviewModel from '../models/reviewModel.js'

// ─── Change Availability ──────────────────────────────────────────────────────
const changeAvailablity = async (req, res) => {
    try {
        const { docId } = req.body
        const docData   = await doctorModel.findById(docId)
        if (!docData) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' })
        }
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        return res.json({ success: true, message: 'Availability updated.' })
    } catch (error) {
        console.error('[changeAvailablity]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor List ──────────────────────────────────────────────────────────────
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        return res.json({ success: true, doctors })
    } catch (error) {
        console.error('[doctorList]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor Login ─────────────────────────────────────────────────────────────
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' })
        }

        const doctor = await doctorModel.findOne({ email })
        if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        }

        const token = jwt.sign(
            { id: doctor._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        return res.json({ success: true, token })
    } catch (error) {
        console.error('[loginDoctor]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor Appointments ──────────────────────────────────────────────────────
const appointmentsDoctor = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.docId }).sort({ date: -1 })
        return res.json({ success: true, appointments })
    } catch (error) {
        console.error('[appointmentsDoctor]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Complete Appointment ─────────────────────────────────────────────────────
const appointmentComplete = async (req, res) => {
    try {
        const docId         = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: 'Unauthorized or appointment not found.' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
        return res.json({ success: true, message: 'Appointment marked as completed.' })
    } catch (error) {
        console.error('[appointmentComplete]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Cancel Appointment ───────────────────────────────────────────────────────
const appointmentCancel = async (req, res) => {
    try {
        const docId         = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: 'Unauthorized or appointment not found.' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
        return res.json({ success: true, message: 'Appointment cancelled.' })
    } catch (error) {
        console.error('[appointmentCancel]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────
const doctorDashboard = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.docId })

        const earnings     = appointments.reduce((sum, item) => {
            return (item.isCompleted || item.payment) ? sum + (item.amount || 0) : sum
        }, 0)

        const patientSet = new Set(appointments.map(item => String(item.userId)))

        const doctor = await doctorModel.findById(req.docId).select('averageRating totalReviews')

        const dashData = {
            earnings,
            appointments:       appointments.length,
            patients:           patientSet.size,
            averageRating:      doctor?.averageRating ?? 0,
            totalReviews:       doctor?.totalReviews ?? 0,
            latestAppointments: [...appointments].reverse().slice(0, 5)
        }

        return res.json({ success: true, dashData })
    } catch (error) {
        console.error('[doctorDashboard]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor Profile ───────────────────────────────────────────────────────────
const doctorProfile = async (req, res) => {
    try {
        const profileData = await doctorModel.findById(req.docId).select('-password')
        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' })
        }
        return res.json({ success: true, profileData })
    } catch (error) {
        console.error('[doctorProfile]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Update Doctor Profile ────────────────────────────────────────────────────
const updateDoctorProfile = async (req, res) => {
    try {
        const { address, fees, available } = req.body
        await doctorModel.findByIdAndUpdate(req.docId, { address, fees, available })
        return res.json({ success: true, message: 'Profile updated.' })
    } catch (error) {
        console.error('[updateDoctorProfile]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Increment View ───────────────────────────────────────────────────────────
const incrementView = async (req, res) => {
    try {
        const { docId } = req.params
        const doctor    = await doctorModel.findByIdAndUpdate(
            docId,
            { $inc: { views: 1 } },
            { new: true }
        )
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' })
        }
        return res.json({ success: true, views: doctor.views })
    } catch (error) {
        console.error('[incrementView]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Toggle Like ──────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
    try {
        const { docId } = req.params
        const userId    = req.userId

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' })
        }

        const alreadyLiked = doctor.likedBy.includes(userId)

        if (alreadyLiked) {
            await doctorModel.findByIdAndUpdate(docId, {
                $inc: { likes: -1 },
                $pull: { likedBy: userId }
            })
            return res.json({ success: true, liked: false, message: 'Like removed.' })
        } else {
            await doctorModel.findByIdAndUpdate(docId, {
                $inc: { likes: 1 },
                $push: { likedBy: userId }
            })
            return res.json({ success: true, liked: true, message: 'Liked successfully.' })
        }
    } catch (error) {
        console.error('[toggleLike]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Doctor Ratings ───────────────────────────────────────────────────────────
const getDoctorRatings = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ doctor: req.docId, isRated: true })

        if (!reviews.length) {
            return res.json({ success: true, ratings: null })
        }

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        let total = 0

        reviews.forEach(r => {
            const star     = Math.round(r.rating)
            breakdown[star] = (breakdown[star] ?? 0) + 1
            total += r.rating
        })

        const count   = reviews.length
        const average = parseFloat((total / count).toFixed(1))

        const byStars = [5, 4, 3, 2, 1].map(star => ({
            stars: star,
            count: breakdown[star],
            pct:   Math.round((breakdown[star] / count) * 100)
        }))

        return res.json({ success: true, ratings: { average, totalReviews: count, byStars } })
    } catch (error) {
        console.error('[getDoctorRatings]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Visit Stats ──────────────────────────────────────────────────────────────
const getVisitStats = async (req, res) => {
    try {
        const period = req.query.period ?? 'daily'

        const now   = new Date()
        const start = new Date()
        if (period === 'daily')   start.setDate(now.getDate() - 6)
        if (period === 'monthly') start.setMonth(now.getMonth() - 11)
        if (period === 'yearly')  start.setFullYear(now.getFullYear() - 6)

        const appointments = await appointmentModel
            .find({ docId: req.docId, cancelled: false, date: { $gte: start.getTime() } })
            .sort({ date: 1 })

        const dayNames    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const seenPatients = new Set()
        const map         = {}

        appointments.forEach(a => {
            const d   = new Date(a.date)
            let label = ''
            if (period === 'daily')   label = dayNames[d.getDay()]
            if (period === 'monthly') label = d.toLocaleString('default', { month: 'short' })
            if (period === 'yearly')  label = String(d.getFullYear())

            if (!map[label]) map[label] = { name: label, new: 0, ret: 0 }

            const uid = String(a.userId)
            if (seenPatients.has(uid)) {
                map[label].ret++
            } else {
                map[label].new++
                seenPatients.add(uid)
            }
        })

        return res.json({ success: true, visitStats: Object.values(map) })
    } catch (error) {
        console.error('[getVisitStats]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Revenue Data ─────────────────────────────────────────────────────────────
const getRevenueData = async (req, res) => {
    try {
        const period = req.query.period ?? 'monthly'

        const now   = new Date()
        const start = new Date()
        if (period === 'daily')   start.setDate(now.getDate() - 6)
        if (period === 'monthly') start.setMonth(now.getMonth() - 11)
        if (period === 'yearly')  start.setFullYear(now.getFullYear() - 6)

        const appointments = await appointmentModel.find({
            docId: req.docId,
            $or:   [{ isCompleted: true }, { payment: true }],
            cancelled: false,
            date:  { $gte: start.getTime() }
        })

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const map      = {}

        appointments.forEach(a => {
            const d   = new Date(a.date)
            let label = ''
            if (period === 'daily')   label = dayNames[d.getDay()]
            if (period === 'monthly') label = d.toLocaleString('default', { month: 'short' })
            if (period === 'yearly')  label = String(d.getFullYear())
            map[label] = (map[label] ?? 0) + (a.amount ?? 0)
        })

        const revenueData = Object.entries(map).map(([name, revenue]) => ({ name, revenue }))
        return res.json({ success: true, revenueData })
    } catch (error) {
        console.error('[getRevenueData]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Upcoming Today ───────────────────────────────────────────────────────────
const getUpcomingToday = async (req, res) => {
    try {
        const now      = new Date()
        const todayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`

        const upcoming = await appointmentModel.find({
            docId:       req.docId,
            slotDate:    todayStr,
            cancelled:   false,
            isCompleted: false
        }).sort({ slotTime: 1 })

        return res.json({ success: true, upcoming })
    } catch (error) {
        console.error('[getUpcomingToday]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export {
    changeAvailablity,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    incrementView,
    toggleLike,
    getDoctorRatings,
    getVisitStats,
    getRevenueData,
    getUpcomingToday
}
