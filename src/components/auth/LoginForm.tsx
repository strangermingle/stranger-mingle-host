'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations/auth.schemas'
import { loginAction } from '@/actions/auth.actions'
import { sendGAEvent } from '@/lib/gtag'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail } from 'lucide-react'

export function LoginForm() {
  const [isMounted, setIsMounted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const router = useRouter()

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    sendGAEvent({
      action: 'login_attempt',
      category: 'auth',
      label: data.email,
    })

    try {
      const result = await loginAction(formData)

      if (result?.error) {
        setErrorMsg(result.error)
        setIsLoading(false)
        sendGAEvent({
          action: 'login_failed',
          category: 'auth',
          label: data.email,
        })
      } else if (result?.success) {
        sendGAEvent({
          action: 'login_success',
          category: 'auth',
          label: data.email,
        })
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login submission error:', err)
      // Hide NEXT_REDIRECT internal errors if they still occur
      if (err.message !== 'NEXT_REDIRECT') {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="w-full space-y-4">
        <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMsg && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 font-medium">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-red-500" />
            </div>
            {errorMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              {...register('email')}
              id="email"
              type="email"
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-wider transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              {...register('password')}
              id="password"
              type="password"
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-zinc-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}
