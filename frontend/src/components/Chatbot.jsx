import React, { useState, useRef, useEffect, useContext, useCallback } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const SPECIALITY_MAP = {
  'General physician': ['fever','cold','cough','flu','tired','fatigue','weakness','general','body ache'],
  'Neurologist': ['headache','migraine','seizure','nerve','numbness','dizzy','dizziness','memory','brain'],
  'Gastroenterologist': ['stomach','acidity','acid','digestion','liver','bloating','constipation','diarrhea','vomit','nausea','gut'],
  'Dermatologist': ['skin','rash','acne','hair','allergy','itch','eczema','psoriasis','dandruff'],
  'Pediatricians': ['child','baby','infant','kid','fever child','toddler'],
  'Gynecologist': ['period','pregnancy','women','menstrual','pcos','ovarian','uterus','gynec'],
}

const QUICK = [
  { label:'🤒 Fever', msg:'I have fever. Who should I see?' },
  { label:'🧠 Headache', msg:'I have a severe headache. Which doctor?' },
  { label:'🫃 Stomach', msg:'I have stomach pain and acidity. Help?' },
  { label:'👶 Child Sick', msg:'My child has fever. Which specialist?' },
  { label:'🌸 Women Health', msg:'I need a gynecologist. My periods are irregular.' },
  { label:'🦷 Skin Issue', msg:'I have skin rashes and acne. Which doctor?' },
  { label:'📅 Book Appt', msg:'I want to book an appointment.' },
]

const INIT_MSG = { role:'bot', text:"👋 Hi! I'm your DocNest AI assistant. Describe your symptoms and I'll suggest the right doctor — or ask me anything about your health!" }

const Chatbot = () => {
  const { backendUrl, token, doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([INIT_MSG])
  const [hist, setHist] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sugDocs, setSugDocs] = useState([])

  // Booking state
  const [step, setStep] = useState(null)
  const [selDoc, setSelDoc] = useState(null)
  const [selDate, setSelDate] = useState('')
  const [selSlot, setSelSlot] = useState('')
  const [slots, setSlots] = useState([])

  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, sugDocs, step, loading])

  const resetBooking = useCallback(() => { setStep(null); setSelDoc(null); setSelDate(''); setSelSlot(''); setSlots([]) }, [])

  // Smart local symptom → speciality detection
  const detectSpeciality = (text) => {
    const lower = text.toLowerCase()
    for (const [spec, keywords] of Object.entries(SPECIALITY_MAP)) {
      if (keywords.some(k => lower.includes(k))) return spec
    }
    return null
  }

  const getSuggestedDoctors = (speciality) => {
    if (!speciality || !doctors?.length) return []
    return doctors.filter(d => d.speciality === speciality && d.available).slice(0, 3)
  }

  const genSlots = (doctor, dateStr) => {
    if (!doctor || !dateStr) return []
    const [yr,mo,dy] = dateStr.split('-')
    const slotDate = `${parseInt(dy)}_${parseInt(mo)}_${yr}`
    const booked = doctor.slots_booked?.[slotDate] || []
    const out = []
    for (let h = 10; h <= 20; h++) {
      for (const m of ['00','30']) {
        const hour = h > 12 ? h-12 : h
        const ampm = h >= 12 ? 'PM' : 'AM'
        const t = `${hour}:${m} ${ampm}`
        if (!booked.includes(t)) out.push(t)
      }
    }
    return out
  }

  const bookAppt = async () => {
    if (!token) { addBot('Please log in to book an appointment.'); resetBooking(); return }
    try {
      const [yr,mo,dy] = selDate.split('-')
      const slotDate = `${parseInt(dy)}_${parseInt(mo)}_${yr}`
      setLoading(true)
      addBot('⏳ Creating your appointment...')
      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`,
        { docId: selDoc._id, slotDate, slotTime: selSlot },
        { headers: { Authorization: `Bearer ${token}` } })
      if (data.success && data.appointmentId) {
        resetBooking()
        initPay(data.appointmentId, selDoc, selDate, selSlot)
      } else { addBot('Booking failed. Please try again.'); resetBooking() }
    } catch { addBot('Error creating appointment. Please try again.'); resetBooking() }
    finally { setLoading(false) }
  }

  const initPay = async (apptId, doc, date, slot) => {
    if (!window.Razorpay) { addBot('Payment system not loaded. Please refresh.'); return }
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/user/payment-razorpay`,
        { appointmentId: apptId }, { headers: { Authorization: `Bearer ${token}` } })
      if (!data.success) { addBot('Could not create payment. Try again.'); return }
      new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount, currency: data.order.currency,
        name: 'DocNest Appointment', order_id: data.order.id,
        handler: async (res) => {
          const v = await axios.post(`${backendUrl}/api/user/verifyRazorpay`,
            { response: res }, { headers: { Authorization: `Bearer ${token}` } })
          if (v.data.success) {
            setMsgs(p => [...p, { role:'bot', type:'success', data:{ doc, date, slot } }])
            setTimeout(() => navigate('/my-appointments'), 2500)
          } else addBot('Payment verification failed. Contact support.')
        },
        modal: { ondismiss: () => addBot('Payment cancelled.') },
        theme: { color: '#4F46E5' }
      }).open()
    } catch { addBot('Payment error. Please try again.') }
    finally { setLoading(false) }
  }

  const addBot = (text) => setMsgs(p => [...p, { role:'bot', text }])

  const send = useCallback(async (direct = null) => {
    const userMsg = (direct || input).trim()
    if (!userMsg || loading) return
    setMsgs(p => [...p, { role:'user', text:userMsg }])
    setInput('')
    setLoading(true)
    setSugDocs([])

    // Booking intent
    if (/book|appointment|appoint/i.test(userMsg)) {
      if (token) { setStep('doctor'); setMsgs(p => [...p, { role:'bot', type:'selectDoc' }]) }
      else setMsgs(p => [...p, { role:'bot', type:'loginRequired' }])
      setLoading(false)
      return
    }

    // Smart local suggestion before AI call
    const localSpec = detectSpeciality(userMsg)
    const localDocs = getSuggestedDoctors(localSpec)

    try {
      const { data } = await axios.post(`${backendUrl}/api/chat/message`, {
        message: userMsg,
        conversationHistory: hist,
      })
      if (data.success) {
        let reply = data.reply || ''
        let aiSpec = null

        if (reply.includes('SPECIALITY:')) {
          const [text, spec] = reply.split('SPECIALITY:')
          reply = text.trim()
          aiSpec = spec.trim()
        }

        const finalSpec = aiSpec || localSpec
        const finalDocs = finalSpec ? getSuggestedDoctors(finalSpec) : localDocs

        setHist(h => [...h, { role:'user', content:userMsg }, { role:'assistant', content:reply }])
        addBot(reply)
        if (finalDocs.length) setSugDocs(finalDocs)
      } else addBot('Something went wrong. Please try again.')
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || ''
      if (status === 429) {
        toast.error(msg || 'Rate limit. Please wait.')
        addBot(msg || 'Rate limit reached. Please wait a moment.')
      } else addBot('Unable to connect. Please try again.')
    } finally { setLoading(false) }
  }, [input, loading, token, hist, doctors, backendUrl])

  const handleKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const renderMsg = (msg, i) => {
    if (msg.type === 'success') return (
      <div key={i} className='flex justify-start'>
        <div className='bg-green-50 border border-green-200 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%]'>
          <p className='text-green-700 font-semibold text-sm mb-2'>✅ Payment Successful!</p>
          <p className='text-xs text-gray-600'>👨‍⚕️ {msg.data.doc?.name}</p>
          <p className='text-xs text-gray-600'>📅 {msg.data.date} at {msg.data.slot}</p>
          <p className='text-xs text-green-600 mt-2 font-medium'>Redirecting to appointments…</p>
        </div>
      </div>
    )
    if (msg.type === 'selectDoc') return (
      <div key={i} className='flex justify-start'>
        <div className='bg-indigo-50 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] text-sm text-indigo-700 font-medium'>
          📋 Please select a doctor below to continue.
        </div>
      </div>
    )
    if (msg.type === 'loginRequired') return (
      <div key={i} className='flex justify-start'>
        <div className='bg-red-50 border border-red-100 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%]'>
          <p className='text-red-600 text-sm font-medium'>🔐 Please <button onClick={() => { navigate('/login'); setOpen(false) }} className='underline'>log in</button> to book appointments.</p>
        </div>
      </div>
    )
    return (
      <div key={i} className={`flex ${msg.role==='user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed
          ${msg.role==='user'
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none'
            : 'bg-white border border-slate-100 shadow-sm text-gray-800 rounded-bl-none'}`}>
          {msg.text}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(p => !p)}
        className='fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          bg-gradient-to-br from-indigo-600 to-purple-600
          flex items-center justify-center
          hover:scale-110 hover:shadow-indigo-400/40
          transition-all duration-300 group'>
        <img src={open ? assets.crossIcon : assets.chatIcon} className='w-6 h-6' alt='' />
        {!open && (
          <span className='absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse' />
        )}
      </button>

      {open && (
        <div className='fixed bottom-24 right-6 z-50 w-80 sm:w-96
          bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60
          flex flex-col overflow-hidden max-h-[85vh]
          animate-[slideUp_0.3s_ease-out]'>

          {/* Header */}
          <div className='bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30'>
              <img src={assets.robotIcon} className='w-5 h-5' alt='' />
            </div>
            <div className='flex-1'>
              <p className='text-white font-semibold text-sm'>DocNest AI Assistant</p>
              <p className='text-indigo-100 text-xs flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block' />
                Online · Symptom Checker & Booking
              </p>
            </div>
            <button onClick={() => { setMsgs([INIT_MSG]); setHist([]); setSugDocs([]); resetBooking() }}
              className='text-white/70 hover:text-white text-xs border border-white/30 px-2 py-1 rounded-lg
                hover:bg-white/10 transition'>
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60'>

            {/* Quick buttons */}
            {msgs.length === 1 && (
              <div className='mb-2'>
                <p className='text-xs text-slate-400 text-center mb-2'>Quick options</p>
                <div className='flex flex-wrap gap-1.5'>
                  {QUICK.map((q,i) => (
                    <button key={i} onClick={() => send(q.msg)}
                      className='text-xs bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1.5
                        rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105
                        transition-all duration-200 shadow-sm'>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((msg, i) => renderMsg(msg, i))}

            {/* Suggested doctors — real cards */}
            {sugDocs.length > 0 && (
              <div className='bg-white rounded-2xl border border-indigo-100 shadow-sm p-3'>
                <p className='text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1'>
                  🩺 Recommended Doctors
                </p>
                <div className='space-y-2'>
                  {sugDocs.map((doc,i) => (
                    <div key={i} onClick={() => { navigate(`/appointment/${doc._id}`); setOpen(false) }}
                      className='flex items-center gap-3 p-2 rounded-xl cursor-pointer
                        hover:bg-indigo-50 border border-transparent hover:border-indigo-100
                        transition-all duration-200 group/doc'>
                      <img src={doc.image} alt={doc.name}
                        className='w-11 h-11 rounded-xl object-cover border-2 border-indigo-100
                          group-hover/doc:border-indigo-400 transition-colors' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 truncate'>{doc.name}</p>
                        <p className='text-xs text-gray-500'>{doc.speciality}</p>
                        <div className='flex items-center gap-2 mt-0.5'>
                          <span className='text-xs text-amber-600 flex items-center gap-0.5'>
                            ⭐ {doc.averageRating?.toFixed(1) || '—'}
                          </span>
                          <span className='text-xs text-indigo-700 font-semibold'>₹{doc.fees}</span>
                        </div>
                      </div>
                      <span className='text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-full
                        group-hover/doc:bg-purple-600 transition-colors shrink-0'>
                        Book →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking steps */}
            {step === 'doctor' && (
              <div className='bg-white rounded-2xl border border-indigo-100 p-3 shadow-sm'>
                <p className='text-xs text-slate-500 mb-2 font-medium'>Select a doctor</p>
                <select onChange={e => setSelDoc(doctors?.find(d => d._id===e.target.value) || null)}
                  className='w-full border border-slate-200 rounded-xl p-2 text-sm mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300'
                  defaultValue=''>
                  <option value='' disabled>Choose a doctor…</option>
                  {doctors?.map(d => (
                    <option key={d._id} value={d._id}>{d.name} — {d.speciality} — ₹{d.fees}</option>
                  ))}
                </select>
                <button onClick={() => { if(!selDoc) return; setStep('date'); addBot(`${selDoc.name} selected ✓ Now pick a date.`) }}
                  disabled={!selDoc}
                  className='w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition'>
                  Next →
                </button>
              </div>
            )}

            {step === 'date' && (
              <div className='bg-white rounded-2xl border border-indigo-100 p-3 shadow-sm'>
                <p className='text-xs text-slate-500 mb-2 font-medium'>Select date</p>
                <input type='date' min={new Date().toISOString().split('T')[0]} value={selDate}
                  onChange={e => setSelDate(e.target.value)}
                  className='w-full border border-slate-200 rounded-xl p-2 text-sm mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300' />
                <button onClick={() => { if(!selDate) return; const s=genSlots(selDoc,selDate); if(!s.length){addBot('No slots on this date. Pick another.');return;} setSlots(s);setStep('slot');addBot('Choose a time slot below.') }}
                  disabled={!selDate}
                  className='w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition'>
                  Next →
                </button>
              </div>
            )}

            {step === 'slot' && (
              <div className='bg-white rounded-2xl border border-indigo-100 p-3 shadow-sm'>
                <p className='text-xs text-slate-500 mb-2 font-medium'>Select time slot</p>
                <div className='flex flex-wrap gap-1.5 max-h-28 overflow-y-auto mb-2'>
                  {slots.map((s,i) => (
                    <button key={i} onClick={() => setSelSlot(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                        ${selSlot===s ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => { if(!selSlot) return; setStep('confirm'); addBot(`✓ Slot: ${selSlot}. Tap Confirm & Pay below.`) }}
                  disabled={!selSlot}
                  className='w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition'>
                  Next →
                </button>
              </div>
            )}

            {step === 'confirm' && (
              <div className='bg-white rounded-2xl border border-indigo-100 p-3 shadow-sm'>
                <p className='text-xs text-slate-500 mb-2 font-semibold'>Confirm Appointment</p>
                <div className='text-xs space-y-1 mb-3 text-gray-700'>
                  <p>👨‍⚕️ {selDoc?.name} — {selDoc?.speciality}</p>
                  <p>📅 {selDate} at {selSlot}</p>
                  <p className='font-bold text-indigo-700'>₹{selDoc?.fees}</p>
                </div>
                <button onClick={bookAppt} disabled={loading}
                  className='w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                    text-white text-sm font-semibold mb-2 disabled:opacity-50 hover:opacity-90 transition'>
                  {loading ? '⏳ Processing…' : `Confirm & Pay ₹${selDoc?.fees}`}
                </button>
                <button onClick={() => { addBot('Booking cancelled.'); resetBooking() }} disabled={loading}
                  className='w-full py-2 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition'>
                  Cancel
                </button>
              </div>
            )}

            {loading && (
              <div className='flex justify-start'>
                <div className='bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-none'>
                  <div className='flex gap-1 items-center'>
                    <span className='w-2 h-2 bg-indigo-400 rounded-full animate-bounce' style={{animationDelay:'0ms'}} />
                    <span className='w-2 h-2 bg-indigo-400 rounded-full animate-bounce' style={{animationDelay:'150ms'}} />
                    <span className='w-2 h-2 bg-indigo-400 rounded-full animate-bounce' style={{animationDelay:'300ms'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className='border-t border-slate-100 p-3 flex gap-2 items-center bg-white'>
            <input type='text' value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={step ? 'Complete booking above…' : 'Describe symptoms or ask anything…'}
              disabled={loading || step !== null}
              className='flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                disabled:bg-slate-50 transition min-w-0' />
            <button onClick={() => send()} disabled={loading || !input.trim() || step !== null}
              className='w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600
                text-white flex items-center justify-center shrink-0
                disabled:opacity-40 hover:scale-110 hover:shadow-lg transition-all duration-200'>
              <img src={assets.sendMsgIcon} className='w-4 h-4' alt='' />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
