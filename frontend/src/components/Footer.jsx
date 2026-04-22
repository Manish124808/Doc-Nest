import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className='bg-gray-900 text-gray-300 mt-20'>
            <div className='md:mx-10 px-6 py-12 grid gap-10 sm:grid-cols-[2fr_1fr_1fr]'>

                {/* Left */}
                <div>
                    <img className='mb-5 w-40 bg-white p-2 rounded-md' src={assets.logo} alt="DocNest logo" />
                    <p className='text-gray-400 leading-6 text-sm md:w-2/3'>
                        DocNest connects you with trusted doctors for fast, reliable,
                        and convenient healthcare — anytime, anywhere.
                    </p>
                </div>

                {/* Center */}
                <div>
                    <p className='text-base font-semibold mb-5 text-white'>Company</p>
                    <ul className='flex flex-col gap-3 text-sm'>
                        {[['/', 'Home'], ['/about', 'About Us'], ['/contact', 'Contact Us']].map(([to, label]) => (
                            <li key={to}>
                                <NavLink to={to} onClick={() => window.scrollTo(0, 0)}
                                    className='hover:text-white transition-colors'>{label}</NavLink>
                            </li>
                        ))}
                        <li><span className='hover:text-white transition-colors cursor-pointer'>Privacy Policy</span></li>
                    </ul>
                </div>

                {/* Right — real contact only */}
                <div>
                    <p className='text-base font-semibold mb-5 text-white'>Contact</p>
                    <ul className='flex flex-col gap-3 text-sm'>
                        <li>
                            <a href='tel:+916386295382' className='hover:text-white transition-colors'>
                                +91 63862 95382
                            </a>
                        </li>
                        <li>
                            <a href='mailto:manish.kushwaha.codes@gmail.com'
                                className='hover:text-white transition-colors break-all'>
                                manish.kushwaha.codes@gmail.com
                            </a>
                        </li>
                        <li className='text-gray-500 text-xs mt-1'>
                            SCRIET, CCS University<br />Meerut, UP, India
                        </li>
                    </ul>
                </div>
            </div>

            <div className='border-t border-gray-700 text-center py-5 text-xs text-gray-500'>
                © {new Date().getFullYear()} DocNest — Built by Manish Kushwaha. All Rights Reserved.
            </div>
        </footer>
    )
}

export default Footer
