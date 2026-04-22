import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'
import Review from '../components/Review'
import ChatWindow from '../components/ChatWindow'

const DAY_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData, userData } = useContext(AppContext)
  const navigate  = useNavigate()
  const location  = useLocation()

  const isReviewMode  = location.state?.review
  const canReview     = location.state?.canReview
  const appointmentId = location.state?.appointmentId

  const [docInfo,        setDocInfo]        = useState(null)
  const [docSlots,       setDocSlots]       = useState([])
  const [slotIndex,      setSlotIndex]      = useState(0)
  const [slotTime,       setSlotTime]       = useState('')
  const [showChat,       setShowChat]       = useState(false)
  const [booking,        setBooking]        = useState(false)
  const [doctorReviews,  setDoctorReviews]  = useState([])
  const [reviewSummary,  setReviewSummary]  = useState(null)

  const fetchDoctorReviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/reviews/doctor/${docId}`)
      if (data.success) {
        setDoctorReviews(data.reviews)
        setReviewSummary(data.summary)
      }
    } catch (err) {
      console.error('[Appointment] fetchDoctorReviews:', err.message)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      const found = doctors.find(d => d._id?.toString() === docId)
      setDocInfo(found || null)
    }
  }, [doctors, docId])

  useEffect(() => {
    if (!docInfo) return
    const today  = new Date()
    const slots  = []

    for (let i = 0; i < 7; i++) {
      const curr = new Date(today)
      curr.setDate(today.getDate() + i)

      const end = new Date(today)
      end.setDate(today.getDate() + i)
      end.setHours(21, 30, 0, 0)

      if (i === 0) {
        curr.setHours(curr.getHours() > 10 ? curr.getHours() + 1 : 10)
        curr.setMinutes(curr.getMinutes() > 30 ? 30 : 0)
      } else {
        curr.setHours(10, 0, 0, 0)
      }

      const daySlots = []
      while (curr < end) {
        const time      = curr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const d         = curr.getDate()
        const m         = curr.getMonth() + 1
        const y         = curr.getFullYear()
        const slotDate  = `${d}_${m}_${y}`
        const available = !(docInfo?.slots_booked?.[slotDate]?.includes(time))
        if (available) daySlots.push({ datetime: new Date(curr), time })
        curr.setMinutes(curr.getMinutes() + 30)
      }
      slots.push(daySlots)
    }
    setDocSlots(slots)
    setSlotIndex(0)
    setSlotTime('')
  }, [docInfo])

  useEffect(() => { fetchDoctorReviews() }, [docId]) 

  const bookAppointment = async () => {
    if (!token) { toast.warn('Login to book appointment'); return navigate('/login') }
    if (!slotTime) { toast.error('Please select a time slot'); return }
    if (booking) return

    setBooking(true)
    try {
      const date     = docSlots[slotIndex][0].datetime
      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setBooking(false)
    }
  }

  if (!docInfo) return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <p className='text-gray-400 text-sm'>Loading doctor information...</p>
    </div>
  )

  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-6xl mx-auto pb-16'>

      {/* Doctor card */}
      <div className='flex flex-col sm:flex-row gap-4 mt-4'>

        {/* Image */}
        <div className='shrink-0'>
          <img
            className='w-full sm:max-w-64 md:max-w-72 rounded-xl object-cover
              bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1'
            src={docInfo.image}
            alt={docInfo.name}
            loading='lazy'
          />
        </div>

        {/* Details */}
        <div className='flex-1 rounded-xl p-5 sm:p-8 bg-white shadow-xl'>

          <div className='flex items-center gap-2 flex-wrap'>
            <p className='text-xl sm:text-2xl font-medium text-gray-900'>{docInfo.name}</p>
            <img className='w-5 h-5' src={assets.verified_icon} alt='verified' />
          </div>

          <div className='flex items-center gap-2 flex-wrap text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} &mdash; {docInfo.speciality}</p>
            <span className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</span>
          </div>

          <div className='mt-3'>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900'>
              About <img src={assets.info_icon} alt='' className='w-4 h-4' />
            </p>
            <p className='text-sm text-gray-500 max-w-2xl mt-1 leading-6'>{docInfo.about}</p>
          </div>

          <p className='text-gray-500 font-medium mt-4 text-sm'>
            Appointment fee:{' '}
            <span className='text-gray-700 font-semibold'>
              {currencySymbol}{docInfo.fees}
            </span>
          </p>

          {token ? (
            <button
              onClick={() => setShowChat(true)}
              className='mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600
                text-white px-5 py-2 rounded-full text-sm hover:opacity-90 transition-all duration-200'
            >
              💬 Chat with Doctor
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='mt-4 flex items-center gap-2 border border-indigo-400 text-indigo-600
                px-5 py-2 rounded-full text-sm hover:bg-indigo-50 transition'
            >
              💬 Login to Chat
            </button>
          )}
        </div>
      </div>

      {/* Booking slots */}
      <div className='mt-8'>
        <p className='font-medium text-gray-700 mb-4'>Booking slots</p>

        {/* Day selector */}
        <div className='flex gap-3 overflow-x-auto pb-2 hide-scrollbar'>
          {docSlots.map((daySlots, i) => (
            <button
              key={i}
              onClick={() => { setSlotIndex(i); setSlotTime('') }}
              className={`text-center py-4 px-3 min-w-[60px] rounded-full text-sm shrink-0 transition
                ${slotIndex === i
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <p className='font-medium'>{daySlots[0] ? DAY_OF_WEEK[daySlots[0].datetime.getDay()] : '—'}</p>
              <p className='text-lg font-semibold'>{daySlots[0]?.datetime.getDate()}</p>
            </button>
          ))}
        </div>

        {/* Time slots */}
        <div className='flex gap-2 flex-wrap mt-4'>
          {docSlots[slotIndex]?.length > 0 ? (
            docSlots[slotIndex].map((item, i) => (
              <button
                key={i}
                onClick={() => setSlotTime(item.time)}
                className={`text-sm px-4 py-2 rounded-full border transition
                  ${item.time === slotTime
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'text-gray-600 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'}`}
              >
                {item.time.toLowerCase()}
              </button>
            ))
          ) : (
            <p className='text-sm text-gray-400 mt-2'>No slots available for this day.</p>
          )}
        </div>

        <button
          onClick={bookAppointment}
          disabled={!slotTime || booking}
          className='mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium
            px-10 sm:px-14 py-3 rounded-full transition
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2'
        >
          {booking && (
            <svg className='animate-spin h-4 w-4 text-white' viewBox='0 0 24 24' fill='none'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
            </svg>
          )}
          {booking ? 'Booking...' : 'Book an Appointment'}
        </button>
      </div>

      {/* Reviews */}
      <div className='mt-10'>
        {isReviewMode && canReview && (
          <Review
            canReview
            appointmentId={appointmentId}
            doctorId={docId}
            onReviewSubmit={fetchDoctorReviews}
          />
        )}
        <Review
          readOnly
          reviewData={doctorReviews}
          summary={reviewSummary}
          onReviewSubmit={fetchDoctorReviews}
        />
      </div>

      {/* Related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

      {/* Chat overlay */}
      {showChat && userData && (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4'>
          <div className='w-full max-w-md'>
            <ChatWindow
              appointmentId={`chat_${docId}_${userData._id}`}
              doctorId={docId}
              doctorName={docInfo.name}
              doctorImage={docInfo.image}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointment