import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorCard = ({ item }) => {
    const { backendUrl, token, userData } = useContext(AppContext)
    const navigate = useNavigate()
    const [liked, setLiked] = useState(item.likedBy?.includes(userData?._id) || false)
    const [likes, setLikes] = useState(item.likes || 0)
    const [views, setViews] = useState(item.views || 0)

    useEffect(() => {
        if (userData?._id) setLiked(item.likedBy?.includes(userData._id) || false)
    }, [userData, item.likedBy])

    const handleCardClick = async () => {
        try { await axios.post(backendUrl + `/api/doctor/view/${item._id}`); setViews(p => p + 1) } catch {}
        navigate(`/appointment/${item._id}`)
        scrollTo(0, 0)
    }

    const handleLike = async (e) => {
        e.stopPropagation()
        if (!token) { toast.warn('Please login to like a doctor'); return }
        try {
            const { data } = await axios.post(backendUrl + `/api/doctor/like/${item._id}`, {},
                { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) { setLiked(data.liked); setLikes(p => data.liked ? p + 1 : p - 1) }
        } catch (err) { toast.error(err.message) }
    }

    return (
        <div
            onClick={handleCardClick}
            className='group relative rounded-2xl overflow-hidden cursor-pointer
                bg-white border border-slate-100
                shadow-sm hover:shadow-xl
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:scale-[1.02]'
        >
            {/* Doctor image */}
            <div className='relative overflow-hidden h-52 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100'>
                <img
                    className='w-full h-full object-cover object-top
                        transition-transform duration-500 group-hover:scale-105'
                    src={item.image}
                    alt={item.name}
                    loading='lazy'
                />
                {/* Glassmorphism overlay on hover */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                {/* Stats badges — glassmorphism */}
                <div className='absolute top-2 left-2 flex flex-col gap-1.5'>
                    {[
                        { icon: assets.eye, val: views >= 1000 ? (views/1000).toFixed(1)+'k' : views },
                        { icon: liked ? assets.filledheart : assets.heart, val: likes >= 1000 ? (likes/1000).toFixed(1)+'k' : likes, onClick: handleLike },
                        { icon: assets.comment, val: item.totalReviews || 0 },
                    ].map((b, i) => (
                        <div
                            key={i}
                            onClick={b.onClick}
                            className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white
                                backdrop-blur-md bg-white/20 border border-white/30 shadow-sm
                                transition-transform duration-200 hover:scale-110 w-fit'
                        >
                            <img src={b.icon} className='w-3.5 h-3.5' alt='' />
                            <span>{b.val}</span>
                        </div>
                    ))}
                </div>

                {/* Availability badge */}
                <div className='absolute top-2 right-2'>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/30
                        ${item.available ? 'bg-green-500/80 text-white' : 'bg-gray-400/80 text-white'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-white animate-pulse' : 'bg-gray-200'}`} />
                        {item.available ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className='p-4'>
                <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                        <p className='text-gray-900 font-semibold text-base truncate group-hover:text-indigo-700 transition-colors'>
                            {item.name}
                        </p>
                        <p className='text-gray-500 text-sm mt-0.5'>{item.speciality}</p>
                    </div>
                    <div className='flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg'>
                        <img src={assets.filledStar} className='w-3.5 h-3.5' alt='star' />
                        <span className='text-xs font-semibold text-amber-700'>
                            {item.averageRating > 0 ? item.averageRating.toFixed(1) : '—'}
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-between mt-3 pt-3 border-t border-slate-100'>
                    <span className='text-xs text-slate-500'>{item.experience}</span>
                    <span className='text-sm font-bold text-indigo-700'>₹{item.fees}</span>
                </div>

                {/* Book button — slides up on hover */}
                <div className='mt-3 overflow-hidden h-0 group-hover:h-9 transition-all duration-300'>
                    <button className='w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                        text-white text-xs font-semibold hover:opacity-90 transition-opacity'>
                        Book Appointment →
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DoctorCard
