import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import arrowUp from '../../assets/arrow-up.svg'
import arrowDown from '../../assets/arrow-down.svg'
import star from '../../assets/yellowStar.svg'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const BRAND = '#5F6FFF'
const BRAND_DARK = '#1A1F5E'
const BRAND_PINK = '#FF6B8A'
const GREEN = '#22c87a'
const AMBER = '#f59e0b'
const RED = '#ef4444'

const AVATAR_BG = [
  { bg: '#eef0ff', color: BRAND_DARK },
  { bg: '#e8faf2', color: '#065f46' },
  { bg: '#fff8e6', color: '#92400e' },
  { bg: '#fff0f3', color: '#9f1239' },
  { bg: '#f3e8ff', color: '#6b21a8' },
]

const DOT_COLORS = [BRAND, GREEN, BRAND_PINK, AMBER, RED, '#8b5cf6']

const FILTER_TABS = [
  { key: 'all', label: 'All', color: BRAND, bg: '#eef0ff' },
  { key: 'pending', label: 'Pending', color: AMBER, bg: '#fff8e6' },
  { key: 'completed', label: 'Completed', color: GREEN, bg: '#e8faf2' },
  { key: 'cancelled', label: 'Cancelled', color: RED, bg: '#fef2f2' },
]

const Spinner = ({ color = BRAND }) => (
  <div className='h-48 flex items-center justify-center'>
    <div className='w-6 h-6 rounded-full border-2 border-t-transparent animate-spin'
      style={{ borderColor: `${color} ${color} ${color} transparent` }} />
  </div>
)

const Avatar = ({ image, name, idx }) => {
  const av = AVATAR_BG[idx % AVATAR_BG.length]
  const initials = (name ?? 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return image
    ? <img src={image} className='w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white' alt='' />
    : <div className='w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0'
      style={{ background: av.bg, color: av.color }}>{initials}</div>
}

const StatusBadge = ({ item }) => {
  if (item.cancelled) return <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500'>Cancelled</span>
  if (item.isCompleted) return <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600'>Completed</span>
  return <span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600'>Pending</span>
}

const SectionDot = ({ color }) => (
  <span className='w-2 h-2 rounded-full flex-shrink-0 inline-block' style={{ background: color }} />
)

const PeriodTabs = ({ options, value, onChange }) => (
  <div className='flex gap-1'>
    {options.map(p => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all capitalize
          ${value === p
            ? 'bg-gray-100 border-gray-300 text-gray-800'
            : 'border-transparent text-gray-400 hover:text-gray-600'}`}
      >
        {p}
      </button>
    ))}
  </div>
)

const CardHeader = ({ dot, title, right }) => (
  <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
    <div className='flex items-center gap-2'>
      <SectionDot color={dot} />
      <span className='text-sm font-semibold text-gray-800'>{title}</span>
    </div>
    {right && <div>{right}</div>}
  </div>
)

const MetricCard = ({ label, value, upText, sub, accentColor, icon }) => (
  <div className='bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden cursor-pointer hover:shadow-md transition-all group'>
    <div className='absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl' style={{ background: accentColor }} />
    <div className='flex items-center justify-between mb-3'>
      <span className='text-[10px] font-bold uppercase tracking-widest' style={{ color: accentColor }}>{label}</span>
      {icon && (
        <div className='w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
          style={{ background: `${accentColor}18` }}>
          <img src={icon} className='w-5 h-5 object-contain' alt='' />
        </div>
      )}
    </div>
    <div className='text-3xl font-bold mb-1' style={{ color: BRAND_DARK }}>
      {value}
    </div>

    <div className='text-[11px] text-gray-400 flex items-center gap-1 flex-wrap'>
      {upText && (
        <span className="flex items-center gap-1">
          {upText}
        </span>
      )}
      {sub && (
        <span className="text-gray-400">
          {sub}
        </span>
      )}
    </div>
  </div>
)

const HealthBar = ({ label, value, color }) => (
  <div className='flex items-center gap-3 py-2 border-b border-gray-50 last:border-0'>
    <span className='text-xs text-gray-500 w-28 flex-shrink-0'>{label}</span>
    <div className='flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden'>
      <div className='h-full rounded-full transition-all duration-700' style={{ width: `${value}%`, background: color }} />
    </div>
    <span className='text-xs font-semibold text-gray-700 w-8 text-right'>{value}%</span>
  </div>
)

const CustomTooltip = ({ active, payload, label, currency = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className='bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs'>
      <p className='font-semibold text-gray-700 mb-1'>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {currency}{p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}



const DoctorDashboard = () => {
  const {
    dToken, dashData, profileData, getDashData,
    cancelAppointment, completeAppointment,
    getDoctorRatings, getVisitStats, getRevenueData, getUpcomingToday,
  } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  const [visitPeriod, setVisitPeriod] = useState('daily')
  const [visitData, setVisitData] = useState([])
  const [revPeriod, setRevPeriod] = useState('monthly')
  const [revenueData, setRevenueData] = useState([])
  const [ratingsData, setRatingsData] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [loadingVisit, setLoadingVisit] = useState(false)
  const [loadingRev, setLoadingRev] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const [earningsTrend, setEarningsTrend] = useState(null)
  const [appointmentDelta, setAppointmentDelta] = useState(null)
  const [patientTrend, setPatientTrend] = useState(null)

  useEffect(() => {
    if (!dToken) return
    getDashData()
    getDoctorRatings().then(r => setRatingsData(r ?? null))
    getUpcomingToday().then(r => setUpcoming(Array.isArray(r) ? r : []))
    loadVisit('daily')
    loadRevenue('monthly')
  }, [dToken])

  useEffect(() => {
    if (!revenueData || revenueData.length < 2) {
      setEarningsTrend(null)
      return
    }
    const last = revenueData[revenueData.length - 1]?.revenue ?? 0
    const prev = revenueData[revenueData.length - 2]?.revenue ?? 0
    if (prev === 0) { setEarningsTrend(null); return }
    const pct = Math.round(((last - prev) / prev) * 100)
    setEarningsTrend(pct)
  }, [revenueData])

  useEffect(() => {
    if (!visitData || visitData.length < 2) {
      setAppointmentDelta(null)
      setPatientTrend(null)
      return
    }
    const last = visitData[visitData.length - 1]
    const prev = visitData[visitData.length - 2]
    const lastTotal = (last?.new ?? 0) + (last?.ret ?? 0)
    const prevTotal = (prev?.new ?? 0) + (prev?.ret ?? 0)
    setAppointmentDelta(lastTotal - prevTotal)

    if (prevTotal === 0) { setPatientTrend(null); return }
    const pct = Math.round(((lastTotal - prevTotal) / prevTotal) * 100)
    setPatientTrend(pct)
  }, [visitData])

  const loadVisit = async (period) => {
    setLoadingVisit(true)
    try {
      const res = await getVisitStats(period)
      setVisitData(Array.isArray(res) && res.length ? res : [])
    } catch {
      setVisitData([])
    }
    setLoadingVisit(false)
  }

  const loadRevenue = async (period) => {
    setLoadingRev(true)
    try {
      const res = await getRevenueData(period)
      setRevenueData(Array.isArray(res) ? res : [])
    } catch {
      setRevenueData([])
    }
    setLoadingRev(false)
  }

  const handleVisitPeriod = (p) => { setVisitPeriod(p); loadVisit(p) }
  const handleRevPeriod = (p) => { setRevPeriod(p); loadRevenue(p) }

  if (!dashData) return (
    <div className='flex items-center justify-center h-64'>
      <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin'
        style={{ borderColor: `${BRAND} ${BRAND} ${BRAND} transparent` }} />
    </div>
  )

  const latestAppts = dashData?.latestAppointments ?? []

  const filterMap = {
    all: latestAppts,
    pending: latestAppts.filter(a => !a.cancelled && !a.isCompleted),
    completed: latestAppts.filter(a => a.isCompleted),
    cancelled: latestAppts.filter(a => a.cancelled),
  }
  const filteredAppts = filterMap[activeTab] ?? latestAppts





  const total = Math.max(dashData.appointments ?? 1, 1)
  const compCount = latestAppts.filter(a => a.isCompleted).length
  const cancCount = latestAppts.filter(a => a.cancelled).length
  const pendCount = latestAppts.filter(a => !a.isCompleted && !a.cancelled).length
  const compPct = Math.round((compCount / total) * 100)
  const cancPct = Math.round((cancCount / total) * 100)
  const pendPct = Math.round((pendCount / total) * 100)
  const patPct = Math.min(Math.round(((dashData.patients ?? 0) / total) * 100), 100)

  const avgRating = ratingsData?.average ?? 0
  const totalReviews = ratingsData?.totalReviews ?? 0

  const earningsUpText = earningsTrend !== null ? (
    <div className="flex items-center gap-1">
      <img
        src={earningsTrend >= 0 ? arrowUp : arrowDown}
        alt="trend"
        className="w-3 h-3"
      />
      <span className={earningsTrend >= 0 ? "text-green-600" : "text-red-600"}>
        {Math.abs(earningsTrend)}%
      </span>
    </div>
  ) : null

  const apptUpText = appointmentDelta !== null ? (
    <div className="flex items-center gap-1">
      <img
        src={appointmentDelta >= 0 ? arrowUp : arrowDown}
        alt="trend"
        className="w-3 h-3"
      />
      <span className={appointmentDelta >= 0 ? "text-green-600" : "text-red-600"}>
        {Math.abs(appointmentDelta)}%
      </span>
    </div>
  ) : null

  const patientUpText = patientTrend !== null ? (
    <div className="flex items-center gap-1">
      <img
        src={patientTrend >= 0 ? arrowUp : arrowDown}
        alt="trend"
        className="w-3 h-3"
      />
      <span className={patientTrend >= 0 ? "text-green-600" : "text-red-600"}>
        {Math.abs(patientTrend)}%
      </span>
    </div>
  ) : null

  return (
    <div className='m-3 sm:m-5 space-y-4 sm:space-y-5 max-w-[1200px]'>

      <div className='flex items-start sm:items-center justify-between gap-2'>
        <div>
          <h1 className='text-xl font-bold' style={{ color: BRAND_DARK }}>Dashboard Overview</h1>
          <p className='text-lg sm:text-2xl text-gray-800 font-bold mt-0.5'>
            Welcome back, {profileData?.name || 'Doctor'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
          <span className='text-xs text-gray-400 font-medium'>Live data</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        <MetricCard
          label='Total Earnings'
          value={`${currency}${(dashData.earnings ?? 0).toLocaleString()}`}
          upText={earningsUpText}
          sub={earningsUpText ? <span className="text-gray-800"><span className="font-semibold">vs </span><span className='text-sm'>prev period</span></span> : <span className="text-gray-800">No trend data</span>}
          accentColor={BRAND}
          icon={assets.earning_icon}
        />
        <MetricCard
          label='Appointments'
          value={dashData.appointments ?? 0}
          upText={apptUpText}
          sub={apptUpText ? <span className="text-gray-800"><span className="text-lg font-semibold">vs </span><span className='text-sm'>prev period</span></span> : <span className="text-gray-800">No trend data</span>}
          accentColor={BRAND_PINK}
          icon={assets.appointments_icon}
        />
        <MetricCard
          label='Unique Patients'
          value={dashData.patients ?? 0}
          upText={patientUpText}
          sub={patientUpText ? <span className="text-gray-800"><span className="text-lg font-semibold">vs </span><span className='text-sm'>prev period</span></span> : <span className="text-gray-800">No trend data</span>}
          accentColor={GREEN}
          icon={assets.patients_icon}
        />
        <MetricCard
          label='Avg Rating'
          value={avgRating ? (<div className="flex items-center gap-1 sm:gap-2 group"><span className="font-semibold">{avgRating}</span><img src={star} alt="star" className="w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 group-hover:scale-100 group-hover:drop-shadow-[0_0_6px_rgba(230,191,36,0.9)]" /></div>) : '—'}
          upText={totalReviews ? (<div className="flex mt-3 items-center gap-1"><span className="font-semibold text-xl sm:text-2xl text-gray-900">{totalReviews}</span><span className="text-sm sm:text-base text-gray-600">reviews</span></div>) : null}
          sub={totalReviews ? null : 'No reviews yet'}
          accentColor={AMBER}
        />
      </div>

      {/*  Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

        {/* Patient Visits */}
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>

          <CardHeader
            dot={BRAND} title='Patient Visits'
            right={<PeriodTabs options={['daily', 'monthly', 'yearly']} value={visitPeriod} onChange={handleVisitPeriod} />}
          />
          <div className='p-3 sm:p-4'>
            {loadingVisit ? <Spinner color={BRAND} /> : visitData.length === 0 ? (
              <div className='h-40 sm:h-48 flex items-center justify-center text-sm text-gray-400'>No visit data yet</div>
            ) : (

              <ResponsiveContainer width='100%' height={160} className='sm:!h-[192px]'>
                <BarChart data={visitData} barCategoryGap='30%'>
                  <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.05)' vertical={false} />
                  <XAxis dataKey='name' tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='new' name='New Patients' stackId='a' fill={BRAND} radius={[0, 0, 0, 0]} />
                  <Bar dataKey='ret' name='Returning' stackId='a' fill='#c7d2fe' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {visitData.length > 0 && (
              <div className='flex gap-3 sm:gap-4 mt-2'>
                {[['New Patients', BRAND], ['Returning', '#c7d2fe']].map(([l, c]) => (
                  <span key={l} className='flex items-center gap-1.5 text-[10px] text-gray-400'>
                    <span className='w-2.5 h-2.5 rounded-sm inline-block' style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
          <CardHeader
            dot={AMBER} title='Revenue Trend'
            right={<PeriodTabs options={['daily', 'monthly', 'yearly']} value={revPeriod} onChange={handleRevPeriod} />}
          />
          <div className='p-4'>
            {loadingRev ? <Spinner color={AMBER} /> : revenueData.length === 0 ? (
              <div className='h-48 flex items-center justify-center text-sm text-gray-400'>No revenue data yet</div>
            ) : (
              <ResponsiveContainer width='100%' height={192}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.05)' vertical={false} />
                  <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${currency}${Math.round(v / 1000)}k`}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Line type='monotone' dataKey='revenue' name='Revenue' stroke={AMBER} strokeWidth={2}
                    dot={{ r: 3, fill: AMBER }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/*  Analytics Row  */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Performance & Ratings   */}
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
          <CardHeader dot={BRAND_PINK} title='Performance' />
          <div className='px-4 py-3'>
            <HealthBar label='Completed' value={compPct} color={GREEN} />
            <HealthBar label='Pending' value={pendPct} color={AMBER} />
            <HealthBar label='Cancellation' value={cancPct} color={RED} />
            <HealthBar label='Patient Return' value={patPct} color={BRAND} />
          </div>
        </div>
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
          <CardHeader dot={AMBER} title='Patient Ratings' right={avgRating > 0 ? <span className='text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600'>{avgRating} avg</span> : null} />
          <div className='px-4 py-3'>
            {ratingsData?.byStars?.length > 0 ? ratingsData.byStars.map(r => (
              <div key={r.stars} className='flex items-center gap-2 py-1.5'>
                <span className='flex items-center gap-1 text-[10px] text-gray-500 w-8 flex-shrink-0'><span>{r.stars}</span><img src={star} alt="star" className="w-3 h-3" /></span>
                <div className='flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden'>
                  <div className='h-full rounded-full transition-all duration-700' style={{ width: `${r.pct}%`, background: r.stars >= 4 ? AMBER : r.stars === 3 ? '#fcd34d' : RED }} />
                </div>
                <span className='text-[10px] text-gray-400 w-7 text-right flex-shrink-0'>{r.pct}%</span>
              </div>
            )) : <div className='py-6 text-center text-sm text-gray-400'>No ratings yet</div>}
          </div>
        </div>
      </div>

      {/*  Appointments  */}
      <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-4'>
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <SectionDot color={BRAND} />
              <span className='text-sm font-semibold text-gray-800'>Latest Appointments</span>
            </div>
            {/* scrollable filter */}
            <div className='flex gap-1.5 overflow-x-auto pb-0.5'>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className='text-[10px] font-bold px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex-shrink-0'
                  style={{ background: activeTab === tab.key ? tab.color : tab.bg, color: activeTab === tab.key ? 'white' : tab.color }}
                >
                  {tab.label} ({filterMap[tab.key].length})
                </button>
              ))}
            </div>
          </div>

          <div className='hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_100px] px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
            <span>Patient</span>
            <span className='pl-2'>Date</span>
            <span className='pl-2'>Fee</span>
            <span>Status</span>
            <span className='text-right'>Action</span>
          </div>

          <div className='max-h-80 overflow-y-auto divide-y divide-gray-100'>
            {filteredAppts.length > 0 ? filteredAppts.map((item, i) => (
              <div key={item._id ?? i} className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_1fr_100px] items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 hover:bg-blue-50/40 transition text-sm">
                {/* Patient */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar image={item.userData?.image} name={item.userData?.name} idx={i} />
                  <div className='min-w-0'>
                    <span className="font-medium text-gray-800 truncate block">{item.userData?.name ?? '—'}</span>
                    <span className='text-xs text-gray-400 sm:hidden'>{slotDateFormat(item.slotDate)} · {currency}{item.amount}</span>
                  </div>
                </div>
                <span className="text-gray-500 text-xs sm:text-sm hidden sm:block">{slotDateFormat(item.slotDate)}</span>
                <span className="font-semibold text-sm text-gray-900 pl-0 sm:pl-3 hidden sm:block">{currency}{item.amount}</span>
                <div className="hidden sm:block"><StatusBadge item={item} /></div>
                <div className="flex justify-start sm:justify-end gap-2 min-w-[80px]">
                  <StatusBadge item={item} />  
                  {!item.cancelled && !item.isCompleted && (
                    <>
                      <button onClick={() => cancelAppointment(item._id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition">
                        <img src={assets.cancel_icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => completeAppointment(item._id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition">
                        <img src={assets.tick_icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )) : <div className='flex items-center justify-center py-10'><p className='text-sm text-gray-400'>No {activeTab} appointments</p></div>}
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
            <CardHeader dot={GREEN} title='Upcoming Today' right={<span className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600'>{upcoming.length} left</span>} />
            {upcoming.length > 0 ? (
              <div className='divide-y divide-gray-50'>
                {upcoming.slice(0, 5).map((u, i) => (
                  <div key={u._id ?? i} className='flex items-center gap-3 px-4 py-2.5 hover:bg-green-50/30 transition-colors'>
                    <span className='text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0' style={{ background: '#eef0ff', color: BRAND_DARK }}>{u.slotTime}</span>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-gray-800 truncate'>{u.userData?.name ?? '—'}</p>
                      <p className='text-[10px] text-gray-400'>{u.payment ? 'Online' : 'Cash'} · {u.amount ? `${currency}${u.amount}` : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className='px-4 py-6 text-sm text-center text-gray-400'>No appointments today</p>}
          </div>
        </div>
      </div>

      {/*  Recent Activity   */}
      <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
        <CardHeader
          dot={AMBER} title='Recent Activity'
          right={<span className='text-[10px] text-gray-400'>{latestAppts.length} events</span>}
        />
        <div className='divide-y divide-gray-50'>
          {latestAppts.length > 0 ? latestAppts.slice(0, 6).map((item, i) => {
            const action = item.cancelled
              ? 'cancelled their appointment'
              : item.isCompleted
                ? '— consultation completed ✓'
                : 'booked an appointment'
            return (
              <div key={item._id ?? i} className='flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'>
                <div className='w-2 h-2 rounded-full flex-shrink-0 mt-1.5'
                  style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-gray-700'>
                    <span className='font-semibold'>{item.userData?.name ?? '—'}</span> {action}
                  </p>
                  <p className='text-[10px] text-gray-400 mt-0.5'>{slotDateFormat(item.slotDate)}</p>
                </div>
                <StatusBadge item={item} />
              </div>
            )
          }) : (
            <p className='px-4 py-8 text-sm text-center text-gray-400'>No recent activity</p>
          )}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard