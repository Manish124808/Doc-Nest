import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-6xl mx-auto'>

      <div className='text-center pt-10 sm:pt-14'>
        <p className='text-2xl sm:text-3xl text-gray-500'>
          CONTACT <span className='text-gray-900 font-semibold'>DOCNEST</span>
        </p>
      </div>

      <div className='my-10 sm:my-14 flex flex-col md:flex-row items-center gap-8 md:gap-12'>

        <img
          className='w-full max-w-sm md:max-w-[400px] rounded-xl shadow-md object-cover'
          src={assets.contact_image}
          alt='Contact DocNest'
          loading='lazy'
        />

        <div className='flex flex-col justify-center items-start gap-6 text-gray-600 w-full'>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Our Office</p>
            <p className='text-gray-500 mt-2 leading-6 text-sm sm:text-base'>
              Sir Chhotu Ram Institute of Engineering &amp; Technology<br />
              CCS University, Meerut, Uttar Pradesh, India
            </p>
          </div>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Contact Info</p>
            <p className='text-gray-500 mt-2 leading-6 text-sm sm:text-base'>
              Tel:{' '}
              <a href='tel:+916386295382' className='hover:text-indigo-600 transition'>
                +91 63862 95382
              </a>
              <br />
              Email:{' '}
              <a href='mailto:manish.kushwaha.codes@gmail.com' className='hover:text-indigo-600 transition'>
                manish.kushwaha.codes@gmail.com
              </a>
            </p>
          </div>

          <div>
            <p className='font-semibold text-base sm:text-lg text-gray-800'>Careers at DocNest</p>
            <p className='text-gray-500 mt-2 text-sm sm:text-base'>
              Join our team and help us build the future of healthcare.
            </p>
          </div>

          <a
            href='mailto:manish.kushwaha.codes@gmail.com'
            className='mt-1 border border-gray-800 px-6 sm:px-8 py-2.5 sm:py-3 text-sm rounded-full
              hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md
              text-gray-800 font-medium inline-block'
          >
            Explore Jobs &rarr;
          </a>

        </div>
      </div>

    </div>
  )
}

export default Contact
