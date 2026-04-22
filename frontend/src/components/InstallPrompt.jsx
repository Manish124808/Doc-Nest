import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showBanner, setShowBanner] = useState(false)
    const [installing, setInstalling] = useState(false)
    const [installed, setInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) return

        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Show after 3 seconds
            setTimeout(() => setShowBanner(true), 3000)
        }

        window.addEventListener('beforeinstallprompt', handler)
        window.addEventListener('appinstalled', () => {
            setInstalled(true)
            setShowBanner(false)
        })

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        setInstalling(true)
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowBanner(false)
            setInstalled(true)
        }
        setInstalling(false)
        setDeferredPrompt(null)
    }

    if (!showBanner || installed) return null

    return (
        <div className='fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40
            bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden
            animate-[slideUp_0.4s_ease-out]'>
            <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center gap-3'>
                <img src='/icons/icon-96.png' alt='DocNest' className='w-10 h-10 rounded-xl' />
                <div>
                    <p className='text-white font-semibold text-sm'>Install DocNest App</p>
                    <p className='text-indigo-100 text-xs'>Works offline · Fast · No browser needed</p>
                </div>
                <button onClick={() => setShowBanner(false)}
                    className='ml-auto text-white/70 hover:text-white text-lg leading-none'>✕</button>
            </div>

            {/* Mini loading bar on install */}
            {installing && (
                <div className='h-1 bg-indigo-100'>
                    <div className='h-1 bg-gradient-to-r from-indigo-600 to-purple-600 animate-[progress_2s_ease-in-out_infinite]' style={{width:'60%'}} />
                </div>
            )}

            <div className='p-4 flex gap-2'>
                <button onClick={() => setShowBanner(false)}
                    className='flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition'>
                    Not Now
                </button>
                <button onClick={handleInstall} disabled={installing}
                    className='flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60'>
                    {installing ? 'Installing…' : 'Install Free'}
                </button>
            </div>
        </div>
    )
}

export default InstallPrompt
