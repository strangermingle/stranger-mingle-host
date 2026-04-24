import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sign In — Host Dashboard',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-[80px]" />

        <div className="relative z-10 max-w-md px-12 space-y-8">
          <div className="flex items-center gap-4 mb-12">
            <Image src="/logo-2.svg" alt="Stranger Mingle" width={200} height={50} className="brightness-0 invert" />
          </div>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Host<br />
            <span className="text-indigo-400">Dashboard</span>
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Welcome back. This is a private workspace for verified and invited hosts only.
            Manage your events, track attendance, and monitor your earnings — all in one place.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">Invite</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Only</span>
            </div>
            <div className="w-px h-10 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">Verified</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hosts</span>
            </div>
            <div className="w-px h-10 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">Secure</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-4">
            <Image src="/logo-2.svg" alt="Stranger Mingle" width={180} height={45} />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Sign in to your host dashboard
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed pt-4">
            This dashboard is restricted to invited hosts only.
            <br />
            If you need access, please contact the Stranger Mingle team.
          </p>
        </div>
      </div>
    </div>
  )
}
