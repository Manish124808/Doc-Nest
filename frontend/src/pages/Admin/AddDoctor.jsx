import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
    const [docImg,     setDocImg]     = useState(null)
    const [name,       setName]       = useState('')
    const [email,      setEmail]      = useState('')
    const [password,   setPassword]   = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees,       setFees]       = useState('')
    const [about,      setAbout]      = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree,     setDegree]     = useState('')
    const [address1,   setAddress1]   = useState('')
    const [address2,   setAddress2]   = useState('')
    const [loading,    setLoading]    = useState(false)
    const [showPass,   setShowPass]   = useState(false)

    const { backendUrl, aToken } = useContext(AdminContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        if (!docImg) return toast.error('Please upload a doctor image')
        if (Number(fees) <= 0) return toast.error('Fees must be greater than 0')

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('image',      docImg)
            formData.append('name',       name.trim())
            formData.append('email',      email.trim().toLowerCase())
            formData.append('password',   password)
            formData.append('experience', experience)
            formData.append('fees',       Number(fees))
            formData.append('about',      about.trim())
            formData.append('speciality', speciality)
            formData.append('degree',     degree.trim())
            formData.append('address',    JSON.stringify({ line1: address1.trim(), line2: address2.trim() }))

            const { data } = await axios.post(
                backendUrl + '/api/admin/add-doctor',
                formData,
                { headers: { Authorization: `Bearer ${aToken}` } }
            )

            if (data.success) {
                toast.success(data.message)
                setDocImg(null); setName(''); setPassword(''); setEmail('')
                setAddress1(''); setAddress2(''); setDegree(''); setAbout(''); setFees('')
                setExperience('1 Year'); setSpeciality('General physician')
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Server error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-400 text-gray-700 text-sm'
    const lbl = 'block text-sm font-semibold text-gray-600 mb-1.5 ml-1'

    const SPECIALITIES = ['General physician','Gynecologist','Dermatologist','Pediatricians','Neurologist','Gastroenterologist']

    return (
        <div className='p-4 sm:p-6 mt-5 min-h-screen bg-[#F8F9FD] w-full'>
            <div className='max-w-5xl mx-auto'>

                {/* Header */}
                <div className='mb-6'>
                    <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>Doctor Onboarding</h1>
                    <p className='text-gray-500 text-sm mt-1'>Fill in professional details to register a new practitioner.</p>
                </div>

                <form onSubmit={onSubmitHandler} className='bg-white border border-gray-100 shadow-xl shadow-blue-500/5 rounded-2xl overflow-hidden'>

                    {/* Upload Section */}
                    <div className='p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100'>
                        <div className='flex flex-col sm:flex-row items-center gap-5'>
                            <label htmlFor='doc-img' className='relative cursor-pointer group flex-shrink-0'>
                                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 group-hover:opacity-90 transition-all'>
                                    <img
                                        className='w-full h-full object-cover'
                                        src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                                        alt='profile'
                                    />
                                </div>
                                <div className='absolute bottom-1 right-1 bg-primary p-1.5 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform'>
                                    <svg className='w-3.5 h-3.5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
                                    </svg>
                                </div>
                            </label>
                            <input onChange={e => setDocImg(e.target.files[0])} type='file' id='doc-img' accept='image/*' hidden />
                            <div className='text-center sm:text-left'>
                                <h3 className='text-base sm:text-lg font-bold text-gray-700'>Profile Photo</h3>
                                <p className='text-sm text-gray-500 mt-1'>Upload a professional headshot. PNG or JPG, max 2MB.</p>
                                {docImg && (
                                    <p className='text-xs text-green-600 mt-1 font-medium'>✓ {docImg.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className='p-6 sm:p-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5'>

                            {/* Left */}
                            <div className='space-y-5'>
                                <div>
                                    <label className={lbl}>Full Name</label>
                                    <input onChange={e => setName(e.target.value)} value={name}
                                        className={inp} type='text' placeholder='e.g. Dr. Adam Smith' required />
                                </div>
                                <div>
                                    <label className={lbl}>Email Address</label>
                                    <input onChange={e => setEmail(e.target.value)} value={email}
                                        className={inp} type='email' placeholder='doctor@hospital.com' required />
                                </div>
                                <div>
                                    <label className={lbl}>Password</label>
                                    <div className='relative'>
                                        <input onChange={e => setPassword(e.target.value)} value={password}
                                            className={inp + ' pr-12'} type={showPass ? 'text' : 'password'}
                                            placeholder='Set a strong password' required minLength={6} />
                                        <button type='button' onClick={() => setShowPass(p => !p)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium'>
                                            {showPass ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Experience</label>
                                    <select onChange={e => setExperience(e.target.value)} value={experience} className={inp}>
                                        {[...Array(15)].map((_, i) => (
                                            <option key={i} value={`${i + 1} Year`}>{i + 1} Year{i > 0 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Right */}
                            <div className='space-y-5'>
                                <div>
                                    <label className={lbl}>Speciality</label>
                                    <select onChange={e => setSpeciality(e.target.value)} value={speciality} className={inp}>
                                        {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Education / Degree</label>
                                    <input onChange={e => setDegree(e.target.value)} value={degree}
                                        className={inp} type='text' placeholder='e.g. MBBS, MD' required />
                                </div>
                                <div>
                                    <label className={lbl}>Consultation Fees (₹)</label>
                                    <input onChange={e => setFees(e.target.value)} value={fees}
                                        className={inp} type='number' placeholder='0' min='1' required />
                                </div>
                                <div>
                                    <label className={lbl}>Clinic Address</label>
                                    <div className='space-y-3'>
                                        <input onChange={e => setAddress1(e.target.value)} value={address1}
                                            className={inp} type='text' placeholder='Building / Street' required />
                                        <input onChange={e => setAddress2(e.target.value)} value={address2}
                                            className={inp} type='text' placeholder='Locality / Suite' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className='mt-6'>
                            <label className={lbl}>Professional Bio</label>
                            <textarea onChange={e => setAbout(e.target.value)} value={about}
                                className={inp + ' min-h-[110px] resize-none'}
                                placeholder="Briefly describe the doctor's expertise and background..." required />
                        </div>

                        {/* Submit */}
                        <div className='mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
                            <p className='text-xs text-gray-400 text-center sm:text-left'>
                                Make sure all information is accurate before submitting.
                            </p>
                            <button type='submit' disabled={loading}
                                className='w-full sm:w-auto bg-primary text-white font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {loading ? (
                                    <>
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                        Creating...
                                    </>
                                ) : 'Create Doctor Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddDoctor