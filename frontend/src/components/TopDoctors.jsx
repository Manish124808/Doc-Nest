import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorCard from './DoctorCard'
import { assets } from '../assets/assets'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl md:text-4xl font-semibold'>
                Top Rated Doctors
            </h1>
            <p className='sm:w-1/3 text-center text-sm text-gray-500'>
                Discover experienced doctors, check availability, and book appointments effortlessly.
            </p>

            <div className='w-full grid gap-4 gap-y-6 pt-5 px-3 sm:px-0 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]'>
                {doctors.slice(0, 10).map((item, index) => (
                    <DoctorCard key={index} item={item} />
                ))}
            </div>

            <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-300'
            >
                <span>View All Doctors</span>

                <span className='transition-transform duration-300 group-hover:translate-x-1'>
                    <img
                        src={assets.arrow_icon}
                        alt="arrow"
                        className='h-4 w-4'
                    />
                </span>
            </button>
        </div>
    )
}

export default TopDoctors