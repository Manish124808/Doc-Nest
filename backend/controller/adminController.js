import validator from 'validator'
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';



// add doctor

const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        //checking for all data to add doctor
        if (
            !name ||
            !email ||
            !password ||
            !speciality ||
            !degree ||
            !experience ||
            !about ||
            !fees ||
            !address ||
            !imageFile
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required, including the image.",
            });
        }

        //validating email format

    
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        // Password validate strong
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Please enter strong password.",
            });
        }

        const existing = await doctorModel.findOne({ email })
        if (existing) {
            return res.status(409).json({ success: false, message: 'A doctor with this email already exists.' })
        }

        //hashig password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        //upload img to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const newDoctor = new doctorModel({
            name,
            email,
            image: imageUpload.secure_url,
            password: hashPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        })

        await newDoctor.save()
        return res.status(201).json({ success: true, message: 'Doctor added successfully.' })



    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API for admin login

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' })
        }


        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' })
        }

        const token = jwt.sign(
            { role: 'admin', email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        return res.json({ success: true, token })


    } catch (error) {
        console.error('[loginAdmin]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}


// api for get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        return res.json({ success: true, doctors })
    } catch (error) {
        console.error('[allDoctors]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}


// api to get all appointment list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        return res.json({ success: true, appointments })
    } catch (error) {
        console.error('[appointmentsAdmin]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

//api for appointment cancellation 

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' })
        }

        if (appointmentData.cancelled) {
            return res.status(409).json({ success: false, message: 'Appointment is already cancelled.' })
        }

        appointmentData.cancelled = true
        await appointmentData.save()

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        if (doctorData) {
            let slots_booked = doctorData.slots_booked
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
                await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            }
        }

        return res.json({ success: true, message: 'Appointment cancelled successfully.' })

    } catch (error) {
        console.error('[appointmentCancel]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

//api to get dashboard data for adminpanel
const adminDashboard = async (req, res) => {
    try {
        const [doctors, users, appointments] = await Promise.all([
            doctorModel.find({}).select('_id'),
            userModel.find({}).select('_id'),
            appointmentModel.find({})
        ])

        const revenue = appointments
            .filter(a => a.payment)
            .reduce((sum, a) => sum + (a.amount || 0), 0)

        const now = new Date()
        const todayDay = now.getDate()
        const todayMo = now.getMonth() + 1
        const todayYr = now.getFullYear()

        const cancelledToday = appointments.filter(a => {
            if (!a.cancelled || !a.slotDate) return false
            const p = a.slotDate.split('_')
            if (p.length !== 3) return false
            return (
                parseInt(p[0], 10) === todayDay &&
                parseInt(p[1], 10) === todayMo &&
                parseInt(p[2], 10) === todayYr
            )
        }).length

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            revenue,
            cancelledToday,
            latestAppointments: [...appointments].reverse().slice(0, 5)
        }

        return res.json({ success: true, dashData })

    } catch (error) {
        console.error('[adminDashboard]', error.message)
        return res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard }
