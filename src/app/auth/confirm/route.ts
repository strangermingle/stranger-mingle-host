import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.user) {
      // Upon successful verification, update DB field
      await (supabase
        .from('users') as any)
        .update({ email_verified_at: new Date().toISOString() })
        .eq('id', data.user.id)
        
      redirect(next)
    }
  }

  // Redirect the user to an error page with some instructions
  redirect('/login?error=Could not verify your email address. The link may have expired.')
}
