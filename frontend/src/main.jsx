import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { getApiBaseUrl, pingServer } from './api'

function OnlineOnlyApp() {
    const [online, setOnline] = useState(navigator.onLine)
    const [serverReady, setServerReady] = useState(false)

    useEffect(() => {
        const updateConnection = () => setOnline(navigator.onLine)
        window.addEventListener('online', updateConnection)
        window.addEventListener('offline', updateConnection)
        return () => {
            window.removeEventListener('online', updateConnection)
            window.removeEventListener('offline', updateConnection)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const checkServer = async () => {
            if (!navigator.onLine || !getApiBaseUrl()) {
                if (!cancelled) setServerReady(false)
                return
            }
            const result = await pingServer()
            if (!cancelled) setServerReady(result.ok)
        }

        checkServer()
        const timer = window.setInterval(checkServer, 10000)
        return () => {
            cancelled = true
            window.clearInterval(timer)
        }
    }, [online])

    if (!online || !serverReady) {
        return (
            <main className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6 text-center">
                <section className="max-w-md space-y-3">
                    <h1 className="text-xl font-semibold text-amber-300">Internet connection required</h1>
                    <p className="text-sm text-slate-400">
                        Avimanyu Astro AI needs an active internet connection and an available online service.
                    </p>
                </section>
            </main>
        )
    }

    return <App />
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <OnlineOnlyApp />
    </React.StrictMode>
)
