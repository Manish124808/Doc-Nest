import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts'

/* ─── colour palette ─────────────────────────────────────────── */
const C = {
  primary: '#4F46E5', violet: '#7C3AED', teal: '#0D9488',
  rose: '#E11D48', amber: '#D97706', sky: '#0284C7',
  green: '#16A34A', slate: '#475569', pink: '#db2777',
}
const PIE_COLORS = [C.primary, C.violet, C.sky, C.amber, C.teal, C.rose, C.pink, C.slate]

const TS = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 11,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  itemStyle: { color: '#334155' },
}

const fmtR = (v = 0) => {
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  if (v >= 1000) return '₹' + (v / 1000).toFixed(1) + 'K'
  return '₹' + v
}

const card = 'bg-white rounded-2xl border border-slate-100 shadow-sm p-5'

function SectionLabel({ children }) {
  return (
    <p className='text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 mt-6'>
      {children}
    </p>
  )
}

function MetricCard({ icon, label, value, sub, subColor = 'text-emerald-600', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${card} flex items-center gap-3 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} transition-all duration-200 min-w-0 overflow-hidden`}
    >
      <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0'
        style={{ background: icon.bg }}>
        <img src={icon.emoji} alt='' className='w-5 h-5 sm:w-6 sm:h-6 object-contain' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xl sm:text-2xl font-bold text-slate-800 leading-tight'>{value ?? '—'}</p>
        <p className='text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-tight break-words'>{label}</p>
        {sub && (
          <p className={`text-[10px] sm:text-xs font-medium mt-0.5 leading-tight break-words ${subColor}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle'
      dominantBaseline='central' fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

function RupeeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TS.contentStyle} className='px-3 py-2'>
      <p className='text-slate-500 text-[11px] mb-1'>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className='font-semibold text-[11px]'>
          {p.name}: {fmtR(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const {
    aToken, getDashData, cancelAppointment, dashData,
    getAllAppointments, appointments,
    getAllDoctors, doctors,
  } = useContext(AdminContext)

  const { slotDateFormat } = useContext(AppContext)
  const navigate = useNavigate()
  const [revPeriod, setRevPeriod] = useState('month')

  useEffect(() => {
    if (aToken) {
      getDashData()
      getAllAppointments()
      getAllDoctors()
    }
  }, [aToken])


  const stats = useMemo(() => {
    const appts = appointments || []
    const docs = doctors || []

    const parseSlot = (slotDate) => {
      if (!slotDate) return null
      const p = slotDate.split('_')
      if (p.length !== 3) return null
      return { day: p[0], mo: p[1], yr: p[2] }
    }

    /* ── basic counts ── */
    const total = appts.length
    const cancelled = appts.filter(a => a.cancelled).length
    const completed = appts.filter(a => a.isCompleted).length
    const paid = appts.filter(a => a.payment && !a.cancelled).length
    const pending = appts.filter(a => !a.cancelled && !a.isCompleted && !a.payment).length
    const revenue = appts.filter(a => a.payment).reduce((s, a) => s + (a.amount || 0), 0)

    /* ── today —   matches slotDate ── */
    const now = new Date()
    const todayDay = now.getDate()
    const todayMo = now.getMonth() + 1
    const todayYr = now.getFullYear()
    const todayStr = `${todayDay}_${todayMo}_${todayYr}`
    const currentMoStr = String(todayMo)
    const currentYrStr = String(todayYr)

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)

    const cancelledToday = appts.filter(a => {
      if (!a.cancelled) return false
      const s = parseSlot(a.slotDate)
      if (!s) return false
      return (
        parseInt(s.day, 10) === todayDay &&
        parseInt(s.mo, 10) === todayMo &&
        parseInt(s.yr, 10) === todayYr
      )
    }).length

    const bookedToday = appts.filter(a => a.date && new Date(a.date) >= startOfDay).length

    /* ── avg rating ── */
    const rated = docs.filter(d => d.averageRating > 0)
    const avgRating = rated.length
      ? (rated.reduce((s, d) => s + d.averageRating, 0) / rated.length).toFixed(1)
      : null



    /* ── monthly appointments — last 6 months ── */
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(1)
      d.setMonth(now.getMonth() - i)
      const mo = String(d.getMonth() + 1)
      const yr = String(d.getFullYear())
      const lbl = d.toLocaleString('default', { month: 'short' })
      const cnt = appts.filter(a => {
        const s = parseSlot(a.slotDate)
        return s && s.mo === mo && s.yr === yr
      }).length
      monthlyData.push({ month: lbl, appointments: cnt })
    }

    /* ── status pie ── */
    const statusData = [
      { name: 'Confirmed', value: paid, color: C.sky },
      { name: 'Pending', value: pending, color: C.amber },
      { name: 'Cancelled', value: cancelled, color: C.rose },
      { name: 'Completed', value: completed, color: C.teal },
    ].filter(d => d.value > 0)

    /* ── gender pie ── */
    const gMap = { Male: 0, Female: 0, Other: 0 }
    appts.forEach(a => {
      const g = a.userData?.gender
      if (g === 'Male') gMap.Male++
      else if (g === 'Female') gMap.Female++
      else gMap.Other++
    })
    const genderData = [
      { name: 'Male', value: gMap.Male, color: C.sky },
      { name: 'Female', value: gMap.Female, color: C.pink },
      { name: 'Other', value: gMap.Other, color: C.slate },
    ].filter(d => d.value > 0)

    /* ── speciality pie ── */
    const spMap = {}
    appts.forEach(a => {
      const sp = a.docData?.speciality || 'General'
      spMap[sp] = (spMap[sp] || 0) + 1
    })
    const specData = Object.entries(spMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))

    /* ── top 5 doctors by bookings ── */
    const docMap = {}
    appts.forEach(a => {
      const nm = a.docData?.name || 'Unknown'
      docMap[nm] = (docMap[nm] || 0) + 1
    })
    const topDoctors = Object.entries(docMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    /* ────────────────────────────────────────────────────────
       DAILY REVENUE — current month, day-by-day
       Uses parseSlot so month comparison is "4" === "4" ✓
    ──────────────────────────────────────────────────────── */
    const dailyMap = {}
    appts
      .filter(a => a.payment)
      .forEach(a => {
        const s = parseSlot(a.slotDate)
        if (!s) return
        if (s.mo !== currentMoStr || s.yr !== currentYrStr) return
        const day = parseInt(s.day, 10)
        dailyMap[day] = (dailyMap[day] || 0) + (a.amount || 0)
      })

    const daysInMonth = new Date(todayYr, todayMo, 0).getDate()
    const dailyRevenueData = Array.from(
      { length: Math.min(daysInMonth, todayDay) },
      (_, i) => ({ day: String(i + 1), revenue: dailyMap[i + 1] || 0 })
    )

    /* ────────────────────────────────────────────────────────
       REVENUE TREND — last 6 months vs target
    ──────────────────────────────────────────────────────── */
    const revTrendData = []
    let totalMonthRevenue = 0

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(1)
      d.setMonth(now.getMonth() - i)
      const mo = String(d.getMonth() + 1)
      const yr = String(d.getFullYear())
      const lbl = d.toLocaleString('default', { month: 'short' })

      const monthRev = appts
        .filter(a => {
          if (!a.payment) return false
          const s = parseSlot(a.slotDate)
          return s && s.mo === mo && s.yr === yr
        })
        .reduce((s, a) => s + (a.amount || 0), 0)

      totalMonthRevenue += monthRev
      revTrendData.push({ month: lbl, revenue: monthRev })
    }

    const avgMonthRev = totalMonthRevenue / 6
    const target = Math.round(avgMonthRev * 1.1) || 5000
    revTrendData.forEach(d => { d.target = target })

    // REVENUE PER DOCTOR — day / month / year

    const paidAppts = appts.filter(a => a.payment && !a.cancelled)
    console.log('=== REVENUE DEBUG ===')
    console.log('Today:', { todayDay, todayMo, todayYr, todayStr })
    console.log('currentMoStr:', currentMoStr, 'currentYrStr:', currentYrStr)
    console.log('Total paidAppts:', paidAppts.length)
    console.log('PaidAppts slotDates:', paidAppts.map(a => ({
      slotDate: a.slotDate,
      parsed: parseSlot(a.slotDate),
      amount: a.amount,
      doctor: a.docData?.name
    })))

    // DAY filter debug
    const todayPaid = paidAppts.filter(a => {
      const s = parseSlot(a.slotDate)
      const match = s &&
        parseInt(s.day, 10) === todayDay &&
        parseInt(s.mo, 10) === todayMo &&
        parseInt(s.yr, 10) === todayYr
      console.log(`slotDate: ${a.slotDate} | parsed:`, s, '| match:', match)
      return match
    })
    console.log('Today matched paidAppts:', todayPaid.length)
    console.log('=== END DEBUG ===')


    // WEEK — last 7 days
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const dayDocMap = {}
    paidAppts
      .filter(a => {
        const s = parseSlot(a.slotDate)
        if (!s) return false
        const apptDate = new Date(
          parseInt(s.yr, 10),
          parseInt(s.mo, 10) - 1,
          parseInt(s.day, 10)
        )
        return apptDate >= weekStart
      })
      .forEach(a => {
        const nm = a.docData?.name || 'Unknown'
        dayDocMap[nm] = (dayDocMap[nm] || 0) + (a.amount || 0)
      })



    // MONTH — same month+year
    const monthDocMap = {}
    paidAppts
      .filter(a => {
        const s = parseSlot(a.slotDate)
        return s && s.mo === currentMoStr && s.yr === currentYrStr
      })
      .forEach(a => {
        const nm = a.docData?.name || 'Unknown'
        monthDocMap[nm] = (monthDocMap[nm] || 0) + (a.amount || 0)
      })

    // YEAR — current year 
    const yearDocMap = {}
    paidAppts
      .filter(a => {
        const s = parseSlot(a.slotDate)
        return s && s.yr === currentYrStr
      })
      .forEach(a => {
        const nm = a.docData?.name || 'Unknown'
        yearDocMap[nm] = (yearDocMap[nm] || 0) + (a.amount || 0)
      })

    const buildDocRevData = (map) =>
      Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, revenue]) => ({ name, revenue }))

    const revPerDoctor = {
      day: buildDocRevData(dayDocMap),
      month: buildDocRevData(monthDocMap),
      year: buildDocRevData(yearDocMap),
    }

    return {
      total, cancelled, completed, paid, pending, revenue,
      cancelledToday, bookedToday, avgRating,
      monthlyData, statusData, genderData, specData, topDoctors,
      dailyRevenueData, revTrendData, revPerDoctor, target,
    }
  }, [appointments, doctors])

  const revDocData = stats.revPerDoctor?.[revPeriod] || []

  if (!dashData) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin' />
          <p className='text-slate-400 text-sm'>Loading dashboard…</p>
        </div>
      </div>
    )
  }


  return (
    <div className='p-5 mt-5 md:p-6 max-w-[1400px]'>

      {/* ── top bar ── */}
      <div className='flex items-center justify-between mb-5 pb-4 border-b border-slate-100'>
        <div>
          <h1 className='text-lg font-semibold text-slate-800'>Admin Dashboard</h1>
          <p className='text-xs text-slate-400 mt-0.5'>
            DocNest &nbsp;·&nbsp;
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

      </div>

      <SectionLabel>Overview</SectionLabel>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3'>
        <MetricCard
          icon={{ emoji: assets.regIcon, bg: '#ede9fe' }}
          label='Registered Doctors'
          value={dashData.doctors}
          sub={`${(doctors || []).filter(d => d.available).length} available now`}
          onClick={() => navigate('/doctor-list')}
        />

        <MetricCard
          icon={{ emoji: assets.TotalAppIcon, bg: '#e0f2fe' }}
          label='Total Appointments'
          value={dashData.appointments}
          sub={`+${stats.bookedToday || 0} booked today`}
          onClick={() => navigate('/all-appointments')}
        />

        <MetricCard
          icon={{ emoji: assets.regUserIcon, bg: '#dcfce7' }}
          label='Total Patients'
          value={dashData.patients}
          sub='Registered users'
        />

        <MetricCard
          icon={{ emoji: assets.pendingIcon, bg: '#fef9c3' }}
          label='Pending'
          value={stats.pending || 0}
          sub='Awaiting confirmation'
          subColor='text-amber-600'
          onClick={() => navigate('/all-appointments')}
        />
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2'>
        <MetricCard
          icon={{ emoji: assets.collIcon, bg: '#ede9fe' }}
          label='Total Revenue'
          value={fmtR(stats.revenue || 0)}
          sub='From paid appointments'
          subColor='text-indigo-600'
        />

        <MetricCard
          icon={{ emoji: assets.appCancelIcon, bg: '#fee2e2' }}
          label='Cancelled Today'
          value={stats.cancelledToday || 0}
          sub='Monitor trend'
          subColor='text-red-500'
        />

        <MetricCard
          icon={{ emoji: assets.filledStar, bg: '#fef3c7' }}
          label='Avg Doctor Rating'
          value={stats.avgRating || 'N/A'}
          sub='Across all doctors'
          subColor='text-amber-600'
        />

        <MetricCard
          icon={{ emoji: assets.appCompIcon, bg: '#d1fae5' }}
          label='Completed'
          value={stats.completed || 0}
          sub='All time'
          subColor='text-emerald-600'
        />
      </div>

      {/* ══ APPOINTMENTS & DISTRIBUTION ══ */}
      <SectionLabel>Appointments &amp; Distribution</SectionLabel>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3'>

        <div className={`${card} lg:col-span-2`}>
          <p className='text-sm font-semibold text-slate-700'>Monthly Appointments</p>
          <p className='text-xs text-slate-400 mb-4'>Last 6 months</p>
          <ResponsiveContainer width='100%' height={190}>
            <BarChart data={stats.monthlyData || []} barSize={28}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
              <XAxis dataKey='month' tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TS} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey='appointments' radius={[4, 4, 0, 0]}>
                {(stats.monthlyData || []).map((_, i) => (
                  <Cell key={i} fill={i === (stats.monthlyData?.length || 1) - 1 ? C.primary : '#c7d2fe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <p className='text-sm font-semibold text-slate-700'>Appointment Status</p>
          <p className='text-xs text-slate-400 mb-1'>Current distribution</p>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie data={stats.statusData || []} cx='50%' cy='42%'
                innerRadius={50} outerRadius={76} paddingAngle={3}
                dataKey='value' labelLine={false} label={renderPieLabel}>
                {(stats.statusData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconSize={8} iconType='circle'
                formatter={v => <span style={{ fontSize: 10, color: '#64748b' }}>{v}</span>} />
              <Tooltip {...TS} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ REVENUE ANALYTICS ══ */}
      <SectionLabel>Revenue Analytics</SectionLabel>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3'>

        <div className={card}>
          <p className='text-sm font-semibold text-slate-700'>Daily Revenue</p>
          <p className='text-xs text-slate-400 mb-4'>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — day‑by‑day earnings
          </p>
          {(stats.dailyRevenueData || []).every(d => d.revenue === 0) ? (
            <div className='flex items-center justify-center h-[190px] text-slate-300 text-sm'>
              No paid appointments this month yet
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={190}>
              <BarChart data={stats.dailyRevenueData || []} barSize={10}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                <XAxis dataKey='day' tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  interval={Math.floor((stats.dailyRevenueData?.length || 30) / 10)} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtR(v)} />
                <Tooltip content={<RupeeTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey='revenue' name='Revenue' radius={[3, 3, 0, 0]}>
                  {(stats.dailyRevenueData || []).map((d, i) => {
                    const maxRev = Math.max(...(stats.dailyRevenueData || [{ revenue: 1 }]).map(x => x.revenue), 1)
                    return <Cell key={i} fill={d.revenue >= maxRev * 0.8 ? C.primary : '#c7d2fe'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={card}>
          <div className='flex items-start justify-between mb-1'>
            <div>
              <p className='text-sm font-semibold text-slate-700'>Revenue Trend</p>
              <p className='text-xs text-slate-400 mb-3'>Monthly revenue vs target</p>
            </div>
            <div className='flex items-center gap-3 text-[10px] text-slate-500 mt-0.5'>
              <span className='flex items-center gap-1'>
                <span className='w-5 h-0.5 bg-indigo-500 inline-block rounded' />Revenue
              </span>
              <span className='flex items-center gap-1'>
                <span className='w-5 h-px border-t-2 border-dashed border-teal-500 inline-block' />Target
              </span>
            </div>
          </div>
          {(stats.revTrendData || []).every(d => d.revenue === 0) ? (
            <div className='flex items-center justify-center h-[190px] text-slate-300 text-sm'>
              No revenue data available yet
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={190}>
              <LineChart data={stats.revTrendData || []}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                <XAxis dataKey='month' tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtR(v)} />
                <Tooltip content={<RupeeTooltip />} />
                <ReferenceLine y={stats.target} stroke={C.teal} strokeDasharray='6 3' strokeWidth={1.5} />
                <Line type='monotone' dataKey='revenue' name='Revenue'
                  stroke={C.primary} strokeWidth={2.5}
                  dot={{ r: 3, fill: C.primary, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type='monotone' dataKey='target' name='Target'
                  stroke={C.teal} strokeWidth={1.5} strokeDasharray='6 3' dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue Per Doctor */}
      <div className={`${card} mb-3`}>
        <div className='flex items-center justify-between mb-3'>
          <div>
            <p className='text-sm font-semibold text-slate-700'>Revenue per Doctor</p>
            <p className='text-xs text-slate-400'>Toggle between This Week, monthly and yearly view</p>
          </div>
          <div className='flex gap-1.5'>
            {[{ key: 'day', label: 'This Week' }, { key: 'month', label: 'Monthly' }, { key: 'year', label: 'Yearly' }]
              .map(({ key, label }) => (
                <button key={key} onClick={() => setRevPeriod(key)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all font-medium
                    ${revPeriod === key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {label}
                </button>
              ))}
          </div>
        </div>
        {revDocData.length === 0 ? (
          <div className='flex items-center justify-center h-[200px] text-slate-300 text-sm'>
            No paid appointments for this period
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={revDocData} barSize={32}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
              <XAxis dataKey='name' tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => fmtR(v)} />
              <Tooltip content={<RupeeTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey='revenue' name='Revenue' radius={[4, 4, 0, 0]}>
                {revDocData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ══ DOCTORS & PATIENTS ══ */}
      <SectionLabel>Doctors &amp; Patients</SectionLabel>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3'>

        <div className={`${card} lg:col-span-2`}>
          <p className='text-sm font-semibold text-slate-700'>Top Doctors by Appointments</p>
          <p className='text-xs text-slate-400 mb-4'>Ranked by booking count</p>
          <ResponsiveContainer width='100%' height={190}>
            <BarChart data={stats.topDoctors || []} layout='vertical' barSize={18} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' horizontal={false} />
              <XAxis type='number' tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type='category' dataKey='name' tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip {...TS} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey='count' radius={[0, 4, 4, 0]}>
                {(stats.topDoctors || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={card}>
          <p className='text-sm font-semibold text-slate-700'>Patient Gender Split</p>
          <p className='text-xs text-slate-400 mb-1'>From appointment records</p>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie data={stats.genderData || []} cx='50%' cy='42%'
                innerRadius={50} outerRadius={76} paddingAngle={3}
                dataKey='value' labelLine={false} label={renderPieLabel}>
                {(stats.genderData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconSize={8} iconType='circle'
                formatter={v => <span style={{ fontSize: 10, color: '#64748b' }}>{v}</span>} />
              <Tooltip {...TS} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(stats.specData || []).length > 0 && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3'>
          <div className={card}>
            <p className='text-sm font-semibold text-slate-700'>Appointments by Speciality</p>
            <p className='text-xs text-slate-400 mb-1'>Department distribution</p>
            <ResponsiveContainer width='100%' height={210}>
              <PieChart>
                <Pie data={stats.specData || []} cx='50%' cy='42%'
                  outerRadius={70} paddingAngle={2}
                  dataKey='value' labelLine={false} label={renderPieLabel}>
                  {(stats.specData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend iconSize={8} iconType='circle'
                  formatter={v => <span style={{ fontSize: 9, color: '#64748b' }}>
                    {v.length > 13 ? v.slice(0, 13) + '…' : v}
                  </span>} />
                <Tooltip {...TS} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='lg:col-span-2 grid grid-cols-2 gap-3'>
            {[
              { label: 'Cancellation Rate', value: stats.total ? ((stats.cancelled / stats.total) * 100).toFixed(1) + '%' : '0%', color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Completion Rate', value: stats.total ? ((stats.completed / stats.total) * 100).toFixed(1) + '%' : '0%', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Revenue Collected', value: fmtR(stats.revenue || 0), color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Available Doctors', value: (doctors || []).filter(d => d.available).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Paid Appointments', value: stats.paid || 0, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Total Doctors', value: dashData.doctors, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map(s => (
              <div key={s.label} className={`${card} ${s.bg} border-0`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className='text-xs text-slate-500 mt-1'>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ RECENT ACTIVITY ══ */}
      <SectionLabel>Recent Activity</SectionLabel>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3'>

        <div className={card}>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-sm font-semibold text-slate-700'>Recent Appointments</p>
              <p className='text-xs text-slate-400'>Latest bookings across platform</p>
            </div>
            <button onClick={() => navigate('/all-appointments')}
              className='text-xs text-indigo-600 hover:text-indigo-800 font-medium'>View all →</button>
          </div>
          <table className='w-full text-xs'>
            <thead>
              <tr className='border-b border-slate-100'>
                {['Patient', 'Doctor', 'Date', 'Status', ''].map(h => (
                  <th key={h} className='text-left text-slate-400 font-medium pb-2 pr-2'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dashData.latestAppointments || []).map((item, i) => {
                const initials = (item.userData?.name || 'U')
                  .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                const bgs = ['#ede9fe', '#d1fae5', '#fee2e2', '#e0f2fe', '#fef9c3']
                const txs = ['#5b21b6', '#065f46', '#991b1b', '#0c4a6e', '#78350f']
                return (
                  <tr key={i} className='border-b border-slate-50 hover:bg-slate-50'>
                    <td className='py-2 pr-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0'
                          style={{ background: bgs[i % 5], color: txs[i % 5] }}>{initials}</div>
                        <span className='text-slate-700 font-medium truncate max-w-[70px]'>
                          {(item.userData?.name || 'Patient').split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className='py-2 pr-2 text-slate-500 truncate max-w-[80px]'>{item.docData?.name}</td>
                    <td className='py-2 pr-2 text-slate-400 whitespace-nowrap'>{slotDateFormat(item.slotDate)}</td>
                    <td className='py-2 pr-2'>
                      {item.cancelled
                        ? <span className='px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium text-[10px]'>Cancelled</span>
                        : item.isCompleted
                          ? <span className='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium text-[10px]'>Completed</span>
                          : item.payment
                            ? <span className='px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-medium text-[10px]'>Confirmed</span>
                            : <span className='px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium text-[10px]'>Pending</span>
                      }
                    </td>
                    <td className='py-2 text-right'>
                      {!item.cancelled && !item.isCompleted && (
                        <button onClick={() => cancelAppointment(item._id)}
                          className='text-[10px] text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50'>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={card}>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-sm font-semibold text-slate-700'>Doctor Overview</p>
              <p className='text-xs text-slate-400'>Registered doctors at a glance</p>
            </div>
            <button onClick={() => navigate('/doctor-list')}
              className='text-xs text-indigo-600 hover:text-indigo-800 font-medium'>View all →</button>
          </div>
          <table className='w-full text-xs'>
            <thead>
              <tr className='border-b border-slate-100'>
                {['Doctor', 'Speciality', 'Rating', 'Status'].map(h => (
                  <th key={h} className='text-left text-slate-400 font-medium pb-2 pr-2'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(doctors || []).slice(0, 5).map((doc, i) => (
                <tr key={i} className='border-b border-slate-50 hover:bg-slate-50'>
                  <td className='py-2 pr-2'>
                    <div className='flex items-center gap-2'>
                      <img src={doc.image} alt='' className='w-6 h-6 rounded-full object-cover flex-shrink-0' />
                      <span className='text-slate-700 font-medium truncate max-w-[70px]'>
                        {doc.name.replace('Dr. ', '')}
                      </span>
                    </div>
                  </td>
                  <td className='py-2 pr-2 text-slate-500 truncate max-w-[80px]'>{doc.speciality}</td>
                  <td className='py-2 pr-2 text-amber-600 font-medium'>
                    {doc.averageRating > 0 ? (
                      <div className='flex items-center gap-1'>
                        <img
                          src={assets.filledStar}
                          alt="star"
                          className='w-4 h-4'
                        />
                        <span>{doc.averageRating.toFixed(1)}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className='py-2'>
                    {doc.available
                      ? <span className='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium text-[10px]'>Available</span>
                      : <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[10px]'>Unavailable</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  )
}

export default Dashboard