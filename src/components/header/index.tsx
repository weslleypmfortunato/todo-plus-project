import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from 'next/image'

export function Header() {

  const { data: session, status } = useSession()

  return (
    <header className="w-full h-16 bg-black flex items-center justify-center fixed top-0 left-0">
      <section className="px-4 w-full flex items-center max-w-5xl justify-between">
        <nav className="flex items-center">
          <Link href='/'>
            <h1 className='text-white text-3xl'>Tasks<span className="text-red-500 font-bold pl-0.5">+</span></h1>
          </Link>

          { session?.user && (
            <Link href='/dashboard' className="text-black bg-white rounded-lg ml-3 px-2 py-0.5 text-xs">
              My Dashboard
            </Link>
          )}
        </nav>

        {status === "loading" ? (
          <></>
        ) : session ? (
          <button 
            className='text-white hover:text-black bg-transparent hover:bg-white hover:font-extrabold px-6 py-0.5 rounded-3xl border border-white hover:scale-105 transform duration-500' 
            onClick={() => signOut()}>
            Hi, {session?.user?.name?.split(" ")[0]}
          </button>
        ) : (
          <button
            className='text-white hover:text-black bg-transparent hover:bg-white hover:font-extrabold px-6 py-0.5 rounded-3xl border border-white hover:scale-105 transform duration-500' 
            onClick={() => signIn("google")}>
            Log in
          </button>
        )}
      </section>
    </header>
  )
}
