import '../styles/globals.css'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { registerDiscoveryAnalyticsListener } from '../lib/analytics'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    return registerDiscoveryAnalyticsListener()
  }, [])

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
