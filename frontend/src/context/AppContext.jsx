import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'


export const AppContext = createContext()
const AppContextProvider = (props) => {
    const currencySymbol = '₹'
    // Alias so components that destructure `currency` also work
    const currency = currencySymbol
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // Utility: calculate age from a date-of-birth string
    const calculateAge = (dob) => {
        if (!dob) return 'N/A'
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
        return age
    }

    // Utility: format slotDate stored as "day_month_year" → "20 May 2024"
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const slotDateFormat = (slotDate) => {
        if (!slotDate) return ''
        const parts = slotDate.split('_')
        if (parts.length !== 3) return slotDate
        const [day, month, year] = parts
        return `${day} ${months[Number(month) - 1] ?? month} ${year}`
    }

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)



    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { 'Authorization': `Bearer ${token}` } })
            if (data.success) {
                setUserData(data.userData)

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        currency,
        calculateAge,
        slotDateFormat,
        token, setToken,
        backendUrl,
        userData,setUserData,
        loadUserProfileData,
    }
    useEffect(() => {
        getDoctorsData()
    },[])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }

    },[token])


    return (
        <AppContext.Provider value={value}>
            {props.children}

        </AppContext.Provider>
    )
}
export default AppContextProvider