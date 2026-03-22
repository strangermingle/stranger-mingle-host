import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password — Stranger Mingle',
  description: 'Reset your Stranger Mingle password',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-center text-gray-900 dark:text-zinc-50">
          Set new password
        </h1>
        <p className="mb-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
          Please enter your new password below.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
