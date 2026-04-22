import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorList = () => {
    const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)
    const [search,    setSearch]    = useState('')
    const [filterSp,  setFilterSp]  = useState('All')
    const [toggling,  setToggling]  = useState(null)

    useEffect(() => {
        if (aToken) getAllDoctors()
    }, [aToken])

    const SPECIALITIES = ['All','General physician','Gynecologist','Dermatologist','Pediatricians','Neurologist','Gastroenterologist']

    const filtered = (doctors || []).filter(doc => {
        const matchSearch = !search || doc.name?.toLowerCase().includes(search.toLowerCase())
        const matchSp = filterSp === 'All' || doc.speciality === filterSp
        return matchSearch && matchSp
    })

    const handleToggle = async (id) => {
        setToggling(id)
        await changeAvailability(id)
        setToggling(null)
    }

    const available   = (doctors || []).filter(d => d.available).length
    const unavailable = (doctors || []).length - available

    return (
        <div className='p-4 sm:p-6 mt-5 w-full overflow-x-hidden'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-xl sm:text-2xl font-bold text-slate-800'>All Doctors</h1>
                    <p className='text-slate-500 text-sm mt-1'>
                        {(doctors || []).length} doctors registered &nbsp;·&nbsp;
                        <span className='text-green-600 font-medium'>{available} available</span>
                        {unavailable > 0 && <span className='text-gray-400'> · {unavailable} unavailable</span>}
                    </p>
                </div>

                <div className='relative w-full sm:w-60'>
                    <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder='Search doctor...'
                        className='w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white' />
                </div>
            </div>

            {/* Speciality Filter */}
            <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
                {SPECIALITIES.map(sp => (
                    <button key={sp} onClick={() => setFilterSp(sp)}
                        className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                            ${filterSp === sp
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'}`}>
                        {sp}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                    <div className='text-5xl mb-4'>🩺</div>
                    <p className='text-sm font-medium'>No doctors found</p>
                    <p className='text-xs mt-1'>Try a different search or filter</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
                    {filtered.map((doc, index) => (
                        <div key={doc._id || index}
                            className='group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300'>

                            {/* Image */}
                            <div className='relative overflow-hidden bg-indigo-50/50 h-44'>
                                <img
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                    src={doc.image} alt={doc.name} />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

                                {/* Rating badge */}
                                {doc.averageRating > 0 && (
                                    <div className='absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm'>
                                        <span className='text-amber-400 text-xs'>⭐</span>
                                        <span className='text-xs font-bold text-gray-700'>{doc.averageRating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className='p-4'>
                                <p className='text-slate-900 font-bold truncate'>{doc.name}</p>
                                <p className='text-primary text-xs font-semibold uppercase tracking-wider mt-0.5 truncate'>{doc.speciality}</p>
                                <p className='text-gray-400 text-xs mt-1'>{doc.experience} experience</p>

                                {/* Divider */}
                                <div className='border-t border-slate-50 mt-3 pt-3 flex items-center justify-between'>
                                    <div className='flex items-center gap-1.5'>
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.available ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                        <p className={`text-xs font-medium ${doc.available ? 'text-green-600' : 'text-gray-400'}`}>
                                            {doc.available ? 'Available' : 'Unavailable'}
                                        </p>
                                    </div>

                                    {/* Toggle */}
                                    <label className='relative inline-flex items-center cursor-pointer'>
                                        <input type='checkbox' className='sr-only peer'
                                            checked={doc.available}
                                            onChange={() => handleToggle(doc._id)}
                                            disabled={toggling === doc._id} />
                                        <div className={`w-9 h-5 rounded-full transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white
                                            ${toggling === doc._id
                                                ? 'bg-gray-200 cursor-wait'
                                                : 'bg-gray-200 peer-checked:bg-primary'}`} />
                                    </label>
                                </div>

                                {/* Stats */}
                                <div className='grid grid-cols-2 gap-2 mt-3'>
                                    <div className='bg-gray-50 rounded-lg px-2 py-1.5 text-center'>
                                        <p className='text-xs font-bold text-gray-700'>{doc.totalReviews || 0}</p>
                                        <p className='text-[10px] text-gray-400'>Reviews</p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg px-2 py-1.5 text-center'>
                                        <p className='text-xs font-bold text-gray-700'>₹{doc.fees}</p>
                                        <p className='text-[10px] text-gray-400'>Fees</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DoctorList