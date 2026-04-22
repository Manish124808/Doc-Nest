import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='flex flex-col md:flex-row bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl px-4 md:px-8 lg:px-8 overflow-hidden'>

            {/* Left */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-[8vw] md:pb-16'>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight'>
                    Find & Book Trusted Doctors Instantly
                </p>
                <p className='text-white/80 text-sm sm:text-base'>
                    Your Health, Our Priority — Book with Confidence
                </p>
                <p className='text-white/70 text-sm leading-relaxed'>
                    Explore verified doctors, compare profiles, and book appointments in just a few clicks.
                </p>
                <a
                    href='#speciality'
                    className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-700 text-sm font-medium hover:scale-105 transition-all duration-300 shadow-md mt-2'
                >
                    Book Now
                    <img className='w-3' src={assets.arrow_icon} alt='arrow' />
                </a>
            </div>

            {/* Right */}
            <div className='md:w-1/2 flex items-end justify-center md:justify-end relative min-h-[220px] md:min-h-0'>
                <img
                    className='w-full max-w-sm md:max-w-none md:absolute md:bottom-0 h-auto rounded-lg object-contain'
                    src={assets.header_img}
                    alt="Doctor illustration"
                />
            </div>
        </div>
    )
}

export default Header