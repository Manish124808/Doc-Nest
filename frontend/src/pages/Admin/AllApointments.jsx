import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
    const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

    const [search,     setSearch]     = useState('')
    const [filter,     setFilter]     = useState('all')
    const [cancelling, setCancelling] = useState(null)

    useEffect(() => {
        if (aToken) getAllAppointments()
    }, [aToken])

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this appointment?')) return
        setCancelling(id)
        await cancelAppointment(id)
        setCancelling(null)
    }

    const filtered = (appointments || []).filter(item => {
        const q = search.toLowerCase()
        const matchSearch =
            !q ||
            item.userData?.name?.toLowerCase().includes(q) ||
            item.docData?.name?.toLowerCase().includes(q)

        const matchFilter =
            filter === 'all'       ? true :
            filter === 'cancelled' ? item.cancelled :
            filter === 'completed' ? item.isCompleted :
            filter === 'paid'      ? item.payment && !item.cancelled :
            !item.cancelled && !item.isCompleted && !item.payment

        return matchSearch && matchFilter
    })

    const counts = {
        all:       (appointments || []).length,
        pending:   (appointments || []).filter(a => !a.cancelled && !a.isCompleted && !a.payment).length,
        paid:      (appointments || []).filter(a => a.payment && !a.cancelled).length,
        completed: (appointments || []).filter(a => a.isCompleted).length,
        cancelled: (appointments || []).filter(a => a.cancelled).length,
    }

    const FILTERS = [
        { key: 'all',       label: 'All',       color: 'indigo' },
        { key: 'pending',   label: 'Pending',   color: 'amber'  },
        { key: 'paid',      label: 'Confirmed', color: 'sky'    },
        { key: 'completed', label: 'Completed', color: 'green'  },
        { key: 'cancelled', label: 'Cancelled', color: 'red'    },
    ]

    const colorMap = {
        indigo: { active: 'bg-indigo-600 text-white border-indigo-600', inactive: 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50' },
        amber:  { active: 'bg-amber-500 text-white border-amber-500',   inactive: 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'   },
        sky:    { active: 'bg-sky-500 text-white border-sky-500',       inactive: 'bg-white text-sky-600 border-sky-200 hover:bg-sky-50'         },
        green:  { active: 'bg-green-600 text-white border-green-600',   inactive: 'bg-white text-green-600 border-green-200 hover:bg-green-50'   },
        red:    { active: 'bg-red-500 text-white border-red-500',       inactive: 'bg-white text-red-500 border-red-200 hover:bg-red-50'         },
    }

    return (
        <div className='w-full max-w-7xl mt-5 mx-auto px-4 sm:px-6 flex flex-col h-[calc(100vh-80px)]'>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0'>
                <div>
                    <h1 className='text-xl font-bold text-slate-800'>All Appointments</h1>
                    <p className='text-sm text-slate-400'>{filtered.length} of {counts.all} appointments</p>
                </div>

                <div className='relative w-full sm:w-64'>
                    <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder='Search patient or doctor...'
                        className='w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white' />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className='flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1'>
                {FILTERS.map(f => {
                    const c = colorMap[f.color]
                    const isActive = filter === f.key
                    return (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isActive ? c.active : c.inactive}`}>
                            {f.label} ({counts[f.key]})
                        </button>
                    )
                })}
            </div>

            <div className='bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col'>

                <div className='hidden sm:grid grid-cols-[0.5fr_2fr_0.8fr_2fr_2fr_1fr_1fr] px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Doctor</p>
                    <p>Fees</p>
                    <p>Action</p>
                </div>

                {/* Rows */}
                <div className='flex-1 overflow-y-auto divide-y divide-gray-50'>
                    {filtered.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                            <div className='text-4xl mb-3'>📅</div>
                            <p className='text-sm font-medium'>No appointments found</p>
                            <p className='text-xs mt-1'>Try adjusting your search or filter</p>
                        </div>
                    ) : filtered.map((item, index) => (
                        <div key={item._id || index}
                            className='flex flex-wrap sm:grid sm:grid-cols-[0.5fr_2fr_0.8fr_2fr_2fr_1fr_1fr] items-center px-6 py-3.5 text-gray-600 hover:bg-gray-50/50 transition text-sm gap-y-1'>

                            <p className='hidden sm:block text-gray-400 font-medium'>{index + 1}</p>

                            {/* Patient */}
                            <div className='flex items-center gap-2.5 min-w-0 w-full sm:w-auto'>
                                <img className='w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100'
                                    src={item.userData?.image} alt='' />
                                <div className='min-w-0'>
                                    <p className='font-medium text-gray-800 truncate'>{item.userData?.name}</p>
                                    <p className='text-xs text-gray-400 sm:hidden'>{slotDateFormat(item.slotDate)}</p>
                                </div>
                            </div>

                            {/* Age */}
                            <p className='hidden sm:block text-gray-500'>{calculateAge(item.userData?.dob)}</p>

                            {/* Date */}
                            <div className='hidden sm:block'>
                                <p className='text-gray-700'>{slotDateFormat(item.slotDate)}</p>
                                <p className='text-xs text-gray-400'>{item.slotTime}</p>
                            </div>

                            {/* Doctor */}
                            <div className='flex items-center gap-2.5 min-w-0'>
                                <img className='w-8 h-8 rounded-full object-cover flex-shrink-0 bg-gray-100 ring-1 ring-gray-100'
                                    src={item.docData?.image} alt='' />
                                <div className='min-w-0'>
                                    <p className='font-medium text-gray-800 truncate'>{item.docData?.name}</p>
                                    <p className='text-xs text-gray-400 truncate'>{item.docData?.speciality}</p>
                                </div>
                            </div>

                            {/* Fees */}
                            <p className='font-semibold text-gray-800'>{currency}{item.amount}</p>

                            {/* Action */}
                            <div className='flex items-center gap-2'>
                                {item.cancelled ? (
                                    <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-500'>Cancelled</span>
                                ) : item.isCompleted ? (
                                    <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600'>Completed</span>
                                ) : item.payment ? (
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-600'>Confirmed</span>
                                        <button onClick={() => handleCancel(item._id)} disabled={cancelling === item._id}
                                            className='disabled:opacity-50'>
                                            <img className='w-7 cursor-pointer hover:scale-110 transition' src={assets.cancel_icon} alt='cancel' />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleCancel(item._id)} disabled={cancelling === item._id}
                                        className='disabled:opacity-50'>
                                        <img className='w-7 cursor-pointer hover:scale-110 transition' src={assets.cancel_icon} alt='cancel' />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AllAppointments