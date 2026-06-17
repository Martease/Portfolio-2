import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4">Portfolio (Next)</h1>
        {session ? (
          <>
            <p className="mb-4">Signed in as {session.user?.email}</p>
            <div className="flex gap-2">
              <Link href="/client-portal"><a className="px-4 py-2 bg-blue-600 text-white rounded">Client Portal</a></Link>
              <button onClick={() => signOut()} className="px-4 py-2 bg-gray-200 rounded">Sign out</button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4">You are not signed in.</p>
            <div className="flex gap-2">
              <button onClick={() => signIn()} className="px-4 py-2 bg-green-600 text-white rounded">Sign in</button>
              <Link href="/"><a className="px-4 py-2 bg-gray-200 rounded">Continue browsing</a></Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
