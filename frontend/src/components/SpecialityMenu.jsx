import React from 'react'
import { specialityData } from '../assets/assets'
import {Link} from 'react-router-dom'


const SpecialityMenu = () => {
    return (
        <div className='flex flex-col items-center gap-8 py-4 bg-gray-50 text-gray-800' id='speciality'>
            <h1 className='text-3xl md:text-4xl font-semibold'>Find Doctors by Speciality</h1>
            <p className='md:w-1/3 text-sm text-center text-gray-500'>Explore top specialists and book appointments in just a few clicks.</p>
            <div className='flex sm:justify-center gap-6 pt-8 w-full overflow-x-auto scrollbar-hide px-4'>
                {specialityData.map((item,index) => (
                    <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-sm bg-white p-4 rounded-xl shadow-md cursor-pointer flex-shrink-0 hover:-translate-y-2 hover:shadow-xl transition-all duration-300' key={index} to={`/doctors/${item.speciality}`} >
                        <img className='w-16 sm:w-20 mb-3' src={item.image} alt="" />
                        <p className='font-medium text-gray-900'>{item.speciality}</p>
                    </Link>
                ))}
            </div>

        </div>
    )
}

export default SpecialityMenu
