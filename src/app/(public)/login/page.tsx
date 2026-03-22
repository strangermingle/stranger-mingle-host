import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import { CheckCircle2, Users, ShieldCheck, Zap, Globe, TrendingUp, Star, MapPin, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Host Login — Stranger Mingle',
  description: 'Manage your events and community on Stranger Mingle',
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-zinc-950 overflow-hidden">
      {/* Dynamic Background with Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />
        <img 
          src="https://res.cloudinary.com/strangermingle/image/upload/v1774180573/cld-sample-2.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/90 to-zinc-950/40" />
      </div>

      <div className="relative z-10 flex w-full flex-col md:flex-row-reverse">
        {/* Right Side: Features & Stats (Swapped to Right) */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-20 lg:px-24">
          <div className="mb-14">
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              GROW YOUR <span className="text-orange-500">TRIBE</span>
            </h1>
            <p className="text-lg font-medium text-zinc-400 max-w-xl">
              Turn your passion for gathering people into a successful hosting career with India&apos;s fastest growing community.
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-14 max-w-xl">
             {[
               { label: 'Connections Made', value: '10,000+', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
               { label: 'Host Satisfaction', value: '4.8/5.0', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
               { label: 'Cities Covered', value: '15+', icon: MapPin, color: 'text-violet-500', bg: 'bg-violet-500/10' },
               { label: 'Secure Payments', value: '100%', icon: Lock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
             ].map((stat, i) => (
               <div key={i} className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-white/10 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
               </div>
             ))}
          </div>

          <div className="space-y-6 max-w-xl">
            {[
              {
                title: 'High Engagement Community',
                desc: 'Access a list of verified members actively looking for weekend plans.',
                icon: TrendingUp
              },
              {
                title: 'Transparent Payouts',
                desc: 'Get your earnings settled automatically after every successful event.',
                icon: ShieldCheck
              }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/50 transition-all">
                  <feature.icon className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Side: Login Form (Swapped to Left) */}
        <div className="flex w-full md:w-[480px] lg:w-[560px] items-center justify-center p-4 md:p-8 border-r border-white/5 flex-shrink-0">
          <div className="relative w-full max-w-md rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* High Energy Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-violet-600" />
            
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-600/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px]" />

            <div className="relative space-y-3 mb-12 text-center">
                <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                  HOST <span className="text-orange-500">DASHBOARD</span>
                </h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="h-px w-8 bg-zinc-800" />
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">ENTER PORTAL</p>
                   <div className="h-px w-8 bg-zinc-800" />
                </div>
            </div>

            <div className="relative">
                <LoginForm />
            </div>

            <div className="mt-12 text-center relative border-t border-white/5 pt-8">
                <p className="text-[9px] font-black text-zinc-100 uppercase tracking-[0.3em]">Authorized Access for HOSTS Only</p>
                <p className="text-[8px] font-bold text-zinc-100 mt-2">© 2026 Stranger Mingle | A brand of Salty Media Production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
