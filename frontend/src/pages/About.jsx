import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-6xl mx-auto'>

      {/* Heading */}
      <div className='text-center pt-10 sm:pt-14'>
        <p className='text-2xl sm:text-3xl text-gray-500'>
          ABOUT <span className='text-gray-900 font-semibold'>DOCNEST</span>
        </p>
      </div>

      {/* Section 1 */}
      <div className='my-10 sm:my-14 flex flex-col md:flex-row items-center gap-8 md:gap-12'>

        <img
          className='w-full max-w-sm md:max-w-[400px] rounded-xl shadow-md object-cover'
          src={assets.about_image}
          alt='About DocNest'
          loading='lazy'
        />

        <div className='flex flex-col justify-center gap-5 text-gray-600 leading-7 text-sm sm:text-base'>
          <p>
            Welcome to <span className='font-medium text-gray-800'>DocNest</span>, your trusted platform
            for booking doctor appointments quickly and easily. We simplify healthcare access by connecting
            patients with verified medical professionals.
          </p>
          <p>
            At DocNest, we understand the challenges of managing appointments and maintaining health records.
            Our platform is designed to provide a seamless and stress-free experience for users.
          </p>
          <p>
            We are committed to innovation in healthcare technology, continuously improving our platform
            to deliver better services and user experience.
          </p>
          <div>
            <p className='font-semibold text-gray-800 mb-1'>Our Vision</p>
            <p>
              To create a seamless healthcare ecosystem where patients can easily connect with doctors
              and access quality medical care anytime, anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <p className='text-xl sm:text-2xl font-semibold text-gray-700 mb-5'>WHY CHOOSE US</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-20'>
        {[
          {
            title: 'Efficiency',
            desc: 'Book appointments in seconds with our fast and streamlined system.'
          },
          {
            title: 'Convenience',
            desc: 'Access a wide network of trusted doctors from the comfort of your home.'
          },
          {
            title: 'Personalization',
            desc: 'Get personalized recommendations and reminders for better healthcare management.'
          }
        ].map((card, i) => (
          <div
            key={i}
            className='border rounded-xl px-6 py-8 sm:px-8 sm:py-10 flex flex-col gap-3 text-gray-600
              hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white
              transition-all duration-300 shadow-sm hover:shadow-lg cursor-default'
          >
            <b className='text-base sm:text-lg'>{card.title}</b>
            <p className='text-sm sm:text-base'>{card.desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default About