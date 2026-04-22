import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SymptomChecker from '../components/SymptomChecker'

const Home = () => {
  return (
    <div className='px-4 sm:px-8 md:px-16 max-w-7xl mx-auto'>
      <Header />
      <SymptomChecker />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home