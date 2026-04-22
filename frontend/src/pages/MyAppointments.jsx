import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const slotDateFormat = (slotDate) => {
  const [d, m, y] = slotDate.split('_')
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`
}

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loadingId, setLoadingId] = useState(null)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/user/appointments',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
       setAppointments(data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  const cancelAppointment = async (id) => {
    setLoadingId(id)
    try {
      const t = token || localStorage.getItem('token')
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId: id },
        { headers: { Authorization: `Bearer ${t}` } }
      )
      if (data.success) {
        toast.success('Appointment cancelled successfully')
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoadingId(null)
    }
  }

  const initPay = (order, appointmentId) => {
    if (!window.Razorpay) {
      toast.error('Payment system not loaded. Please refresh.')
      return
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Doctor Appointment',
      order_id: order.id,
      handler: async (response) => {
        try {
          const t = token || localStorage.getItem('token')
          const { data } = await axios.post(
            backendUrl + '/api/user/verifyRazorpay',
            { response },
            { headers: { Authorization: `Bearer ${t}` } }
          )
          if (data.success) {
            toast.success('Payment successful!')
            getUserAppointments()
          } else {
            toast.error('Payment verification failed')
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification error')
        }
      },
      modal: {
        ondismiss: () => toast.info('Payment cancelled')
      },
      theme: { color: '#6366f1' }
    }
    new window.Razorpay(options).open()
  }

  const appointmentRazorpay = async (id) => {
    setLoadingId(id)
    try {
      const t = token || localStorage.getItem('token')
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay',
        { appointmentId: id },
        { headers: { Authorization: `Bearer ${t}` } }
      )
      if (data.success) {
        initPay(data.order, id)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoadingId(null)
    }
  }

  useEffect(() => {
    const t = token || localStorage.getItem('token')
    if (t) getUserAppointments()
  }, [])

  if (!appointments.length) return (
    <div className='px-4 sm:px-8 md:px-16 max-w-4xl mx-auto'>
      <p className='pb-3 mt-10 sm:mt-12 font-medium text-zinc-700 border-b text-base sm:text-lg'>
        My Appointments
      </p>
      <p className='text-gray-400 text-sm mt-8 text-center'>No appointments found.</p>
    </div>
  )

  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-4xl mx-auto'>
      <p className='pb-3 mt-10 sm:mt-12 font-medium text-zinc-700 border-b text-base sm:text-lg'>
        My Appointments
      </p>

      <div className='divide-y'>
        {appointments.map((item) => (
          <div key={item._id} className='flex flex-col sm:flex-row gap-4 py-5'>

            {/* Doctor image */}
            <div className='shrink-0'>
              <img
                className='w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-indigo-50'
                src={item.docData.image}
                alt={item.docData.name}
                loading='lazy'
              />
            </div>

            {/* Info */}
            <div className='flex-1 text-sm text-zinc-600 min-w-0'>
              <p className='text-neutral-800 font-semibold text-base truncate'>{item.docData.name}</p>
              <p className='text-gray-500'>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-2'>Address:</p>
              <p className='text-xs text-gray-500'>{item.docData.address?.line1}</p>
              <p className='text-xs text-gray-500'>{item.docData.address?.line2}</p>
              <p className='text-xs mt-2'>
                <span className='text-sm text-neutral-700 font-medium'>Date &amp; Time: </span>
                {slotDateFormat(item.slotDate)} &nbsp;|&nbsp; {item.slotTime}
              </p>
            </div>

            {/* Actions */}
            <div className='flex flex-row sm:flex-col gap-2 sm:justify-end sm:items-end shrink-0 flex-wrap'>

              {/* Cancelled */}
              {item.cancelled && (
                <span className='px-4 py-2 border border-red-400 rounded-lg text-red-500 text-xs font-medium'>
                  Cancelled
                </span>
              )}

              {/* Active */}
              {!item.cancelled && !item.isCompleted && (
                <>
                  {item.payment ? (
                    <span className='px-4 py-2 border rounded-lg text-stone-500 bg-indigo-50 text-xs font-medium'>
                      Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      disabled={loadingId === item._id}
                      className='px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap'
                    >
                      {loadingId === item._id ? 'Processing...' : 'Pay Online'}
                    </button>
                  )}
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    disabled={loadingId === item._id}
                    className='px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 text-stone-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap'
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* Completed */}
              {!item.cancelled && item.isCompleted && (
                <>
                  <span className='px-4 py-2 border border-green-500 rounded-lg text-green-600 text-xs font-medium'>
                    Completed
                  </span>
                  {item.payment && (
                    <button
                      onClick={() => navigate(`/appointment/${item.docId}`, {
                        state: { review: true, canReview: true, appointmentId: item._id }
                      })}
                      className='px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition whitespace-nowrap'
                    >
                      Give Review
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments