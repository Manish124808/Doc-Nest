import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col md:flex-row bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl px-6 sm:px-10 md:px-14 lg:px-12 my-20 overflow-hidden'>

           
            <div className='flex-1 py-10 sm:py-12 md:py-16 lg:py-24 lg:pl-5 flex flex-col gap-4'>
                <p className='text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight'>
                    Book Appointments Instantly
                </p>
                <p className='text-white/80 text-sm sm:text-base max-w-sm'>
                    Connect with 100+ verified doctors and get the care you need — anytime, anywhere.
                </p>
                <button
                    onClick={() => { navigate('/login'); window.scrollTo(0, 0) }}
                    className='self-start bg-white text-sm sm:text-base text-gray-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full mt-2 hover:scale-105 transition-all duration-300 shadow-md font-medium'
                >
                    Get Started →
                </button>
            </div>

          
            <div className='hidden md:flex md:w-1/2 items-end justify-end relative h-[300px] lg:h-[380px]'>
                <img
                    className='absolute bottom-0 right-0 w-[130%] lg:w-[160%] object-contain drop-shadow-2xl'
                    src={assets.appointment_img}
                    alt="Book appointment illustration"
                />
            </div>
        </div>
    )
}

export default Banner