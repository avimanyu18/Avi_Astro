import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.avimanyu.astro.ai',
    appName: 'Avimanyu Astro AI',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
}

export default config
