/**
 * DocNest — Dummy Data Seeder
 * Run: node seedDummyData.js
 * Seeds 6 doctors + 4 patients into MongoDB
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import doctorModel from './models/doctorModel.js'
import userModel from './models/userModel.js'

const MONGO_URI = process.env.MONGO_URI

const DOCTORS = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@docnest.com',
    password: 'Doctor@123',
    speciality: 'General physician',
    degree: 'MBBS, MD',
    experience: '6 Years',
    about: 'Dr. Priya Sharma is a compassionate general physician with expertise in preventive care, chronic disease management, and acute illnesses. She believes in building long-term relationships with patients to deliver holistic healthcare.',
    fees: 500,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg',
    address: { line1: '12, Sector 18, Noida', line2: 'Uttar Pradesh, India' },
    available: true,
  },
  {
    name: 'Dr. Rahul Mehta',
    email: 'rahul.mehta@docnest.com',
    password: 'Doctor@123',
    speciality: 'Neurologist',
    degree: 'MBBS, DM Neurology',
    experience: '9 Years',
    about: 'Dr. Rahul Mehta is a highly skilled neurologist specializing in migraines, epilepsy, stroke rehabilitation, and neurological disorders. He has helped hundreds of patients regain quality of life through precise diagnosis and modern treatment.',
    fees: 1200,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz.jpg',
    address: { line1: '45, Connaught Place', line2: 'New Delhi, India' },
    available: true,
  },
  {
    name: 'Dr. Anjali Verma',
    email: 'anjali.verma@docnest.com',
    password: 'Doctor@123',
    speciality: 'Gynecologist',
    degree: 'MBBS, MS Obstetrics',
    experience: '11 Years',
    about: 'Dr. Anjali Verma is a dedicated gynecologist and obstetrician with over a decade of experience in womens health, high-risk pregnancies, and reproductive medicine. She is known for her empathetic approach and patient-first philosophy.',
    fees: 900,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg',
    address: { line1: '8, Civil Lines', line2: 'Meerut, Uttar Pradesh, India' },
    available: true,
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@docnest.com',
    password: 'Doctor@123',
    speciality: 'Dermatologist',
    degree: 'MBBS, MD Dermatology',
    experience: '7 Years',
    about: 'Dr. Vikram Singh specializes in medical and cosmetic dermatology, treating conditions like acne, eczema, psoriasis, and hair loss. He uses the latest evidence-based treatments to help patients achieve healthy skin.',
    fees: 700,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz.jpg',
    address: { line1: '22, MG Road', line2: 'Gurugram, Haryana, India' },
    available: true,
  },
  {
    name: 'Dr. Sunita Patel',
    email: 'sunita.patel@docnest.com',
    password: 'Doctor@123',
    speciality: 'Pediatricians',
    degree: 'MBBS, MD Pediatrics',
    experience: '8 Years',
    about: 'Dr. Sunita Patel is a caring pediatrician committed to the health and well-being of children from newborns to adolescents. She specializes in growth disorders, vaccinations, and childhood infections with a gentle, child-friendly approach.',
    fees: 600,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg',
    address: { line1: '5, Satellite Road', line2: 'Ahmedabad, Gujarat, India' },
    available: true,
  },
  {
    name: 'Dr. Arjun Nair',
    email: 'arjun.nair@docnest.com',
    password: 'Doctor@123',
    speciality: 'Gastroenterologist',
    degree: 'MBBS, DM Gastroenterology',
    experience: '10 Years',
    about: 'Dr. Arjun Nair is an experienced gastroenterologist who treats digestive system disorders including IBS, GERD, liver diseases, and colon conditions. He is proficient in advanced endoscopic procedures and has a research background in gut health.',
    fees: 1000,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz.jpg',
    address: { line1: '17, Marine Drive', line2: 'Mumbai, Maharashtra, India' },
    available: true,
  },
]

const PATIENTS = [
  {
    name: 'Manish Kushwaha',
    email: 'manish.test@gmail.com',
    password: 'Patient@123',
    phone: '6386295382',
    gender: 'Male',
    dob: '2003-01-15',
    address: { line1: 'SCRIET Campus, CCS University', line2: 'Meerut, Uttar Pradesh' },
  },
  {
    name: 'Riya Sharma',
    email: 'riya.sharma@gmail.com',
    password: 'Patient@123',
    phone: '9876543210',
    gender: 'Female',
    dob: '1998-06-22',
    address: { line1: '12, Sector 5, Vasundhara', line2: 'Ghaziabad, UP' },
  },
  {
    name: 'Aakash Gupta',
    email: 'aakash.gupta@gmail.com',
    password: 'Patient@123',
    phone: '8765432109',
    gender: 'Male',
    dob: '1995-11-10',
    address: { line1: '34, Civil Lines', line2: 'Agra, Uttar Pradesh' },
  },
  {
    name: 'Pooja Mishra',
    email: 'pooja.mishra@gmail.com',
    password: 'Patient@123',
    phone: '7654321098',
    gender: 'Female',
    dob: '2000-03-28',
    address: { line1: '7, Gomti Nagar', line2: 'Lucknow, Uttar Pradesh' },
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    // Seed Doctors
    console.log('🩺 Seeding doctors...')
    for (const doc of DOCTORS) {
      const exists = await doctorModel.findOne({ email: doc.email })
      if (exists) {
        console.log(`  ⏭  Skip (already exists): ${doc.name}`)
        continue
      }
      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(doc.password, salt)
      await doctorModel.create({ ...doc, password: hashed, date: Date.now() })
      console.log(`  ✅ Added: ${doc.name} (${doc.speciality}) — login: ${doc.email} / ${doc.password}`)
    }

    // Seed Patients
    console.log('\n👤 Seeding patients...')
    for (const patient of PATIENTS) {
      const exists = await userModel.findOne({ email: patient.email })
      if (exists) {
        console.log(`  ⏭  Skip (already exists): ${patient.name}`)
        continue
      }
      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(patient.password, salt)
      await userModel.create({ ...patient, password: hashed })
      console.log(`  ✅ Added: ${patient.name} — login: ${patient.email} / ${patient.password}`)
    }

    console.log('\n🎉 Seeding complete!')
    console.log('\n📋 Doctor Login Credentials:')
    DOCTORS.forEach(d => console.log(`  ${d.name}: ${d.email} / ${d.password}`))
    console.log('\n📋 Patient Login Credentials:')
    PATIENTS.forEach(p => console.log(`  ${p.name}: ${p.email} / ${p.password}`))
    console.log('\n📋 Admin Login: admin@gmail.com / qwerty')

  } catch (err) {
    console.error('❌ Seeder error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

seed()
