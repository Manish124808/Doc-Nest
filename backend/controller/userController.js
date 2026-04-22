import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import paymentModel from '../models/paymentModel.js'

// ─── Register ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
        }

        const existing = await userModel.findOne({ email })
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
        }

        const salt         = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const user = await new userModel({ name, email, password: hashPassword }).save()

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        return res.status(201).json({ success: true, token })

    } catch (error) {
        console.error('[registerUser]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Login ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' })
        }

        const user = await userModel.findOne({ email })
        // Constant-time comparison to prevent user enumeration
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        return res.json({ success: true, token })

    } catch (error) {
        console.error('[loginUser]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const userData = await userModel.findById(req.userId).select('-password')
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }
        return res.json({ success: true, userData })
    } catch (error) {
        console.error('[getProfile]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        const userId    = req.userId

        if (!name || !phone || !address || !dob || !gender) {
            return res.status(400).json({ success: false, message: 'All profile fields are required.' })
        }

        let parsedAddress
        try {
            parsedAddress = JSON.parse(address)
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid address format.' })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: parsedAddress, dob, gender })

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url })
        }

        return res.json({ success: true, message: 'Profile updated successfully.' })

    } catch (error) {
        console.error('[updateProfile]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Book Appointment ─────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
    try {
        const userId              = req.userId
        const { docId, slotDate, slotTime } = req.body

        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: 'Doctor, date and time slot are required.' })
        }

        const docData = await doctorModel.findById(docId).select('-password')
        if (!docData) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' })
        }

        if (!docData.available) {
            return res.status(409).json({ success: false, message: 'Doctor is not available.' })
        }

        const slots_booked = docData.slots_booked

        if (slots_booked[slotDate]?.includes(slotTime)) {
            return res.status(409).json({ success: false, message: 'This slot is already booked.' })
        }

        if (!slots_booked[slotDate]) {
            slots_booked[slotDate] = []
        }
        slots_booked[slotDate].push(slotTime)

        const userData = await userModel.findById(userId).select('-password')
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        const docDataPlain = docData.toObject()
        delete docDataPlain.slots_booked

        const newAppointment = new appointmentModel({
            userId,
            docId,
            userData:  userData.toObject(),
            docData:   docDataPlain,
            amount:    docData.fees,
            slotTime,
            slotDate,
            date:      Date.now()
        })

        await newAppointment.save()
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        return res.status(201).json({ success: true, message: 'Appointment booked.', appointmentId: newAppointment._id })

    } catch (error) {
        console.error('[bookAppointment]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── List Appointments ────────────────────────────────────────────────────────
const listAppointment = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.userId }).sort({ date: -1 })
        return res.json({ success: true, appointments })
    } catch (error) {
        console.error('[listAppointment]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Cancel Appointment ───────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
    try {
        const userId        = req.userId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' })
        }

        if (appointmentData.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized request.' })
        }

        if (appointmentData.cancelled) {
            return res.status(409).json({ success: false, message: 'Appointment is already cancelled.' })
        }

        appointmentData.cancelled = true
        await appointmentData.save()

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        if (doctorData) {
            const slots_booked = doctorData.slots_booked
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
                await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            }
        }

        return res.json({ success: true, message: 'Appointment cancelled successfully.' })

    } catch (error) {
        console.error('[cancelAppointment]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Razorpay Instance ────────────────────────────────────────────────────────
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not configured.')
    }
    return new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}

// ─── Payment — Create Order ───────────────────────────────────────────────────
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData || appointmentData.cancelled) {
            return res.status(400).json({ success: false, message: 'Appointment not found or cancelled.' })
        }

        const razorpayInstance  = getRazorpayInstance()
        const existingPayment   = await paymentModel.findOne({ appointmentId })

        let order
        if (existingPayment) {
            order = await razorpayInstance.orders.fetch(existingPayment.razorpay_order_id)
        } else {
            order = await razorpayInstance.orders.create({
                amount:   Number(appointmentData.amount) * 100,
                currency: process.env.CURRENCY || 'INR',
                receipt:  appointmentId.toString()
            })

            await paymentModel.create({
                appointmentId,
                userId:            appointmentData.userId,
                razorpay_order_id: order.id,
                amount:            appointmentData.amount,
                status:            'created'
            })
        }

        return res.json({ success: true, order })

    } catch (error) {
        console.error('[paymentRazorpay]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

// ─── Payment — Verify ─────────────────────────────────────────────────────────
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response

        const body             = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            await paymentModel.findOneAndUpdate({ razorpay_order_id }, { status: 'failed' })
            return res.status(400).json({ success: false, message: 'Payment verification failed.' })
        }

        const razorpayInstance = getRazorpayInstance()
        const orderInfo        = await razorpayInstance.orders.fetch(razorpay_order_id)

        await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
        await paymentModel.findOneAndUpdate(
            { razorpay_order_id },
            { razorpay_payment_id, razorpay_signature, status: 'paid' }
        )

        return res.json({ success: true, message: 'Payment successful.' })

    } catch (error) {
        console.error('[verifyRazorpay]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay
}
