'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../lib/validations/auth.schemas'
import { supabaseAdmin } from '../lib/supabase/admin'
import crypto from 'crypto'
import { resend } from '../lib/resend'
import { env } from '../lib/env'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function loginAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Invalid login details' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    console.error('Login error:', error.message, error.status)
    // Clearer error for unconfirmed email
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please confirm your email address before logging in. Check your inbox for a verification link.' }
    }
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function registerAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = registerSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid registration details' }
  }

  const { email, password, username: initialUsername, phone, gender, date_of_birth } = parsed.data

  const supabase = await createClient()

  // 1. Prepare username from input
  let username = initialUsername
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
  
  if (!username) username = 'user'

  // Check uniqueness and append random numbers if needed
  let isUnique = false
  let finalUsername = username
  let attempts = 0
  
  while (!isUnique && attempts < 10) {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', finalUsername)
      .single()
    
    if (!existing) {
      isUnique = true
    } else {
      finalUsername = `${username}${Math.floor(Math.random() * 10000)}`
      attempts++
    }
  }

  // 2. Sign up the user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create account.' }
  }

  // 3. Generate anonymous_alias 
  const adjectives = ['Blue', 'Red', 'Quick', 'Happy', 'Clever', 'Brave', 'Wild', 'Calm']
  const animals = ['Fox', 'Bear', 'Wolf', 'Owl', 'Hawk', 'Lion', 'Tiger', 'Seal']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  const anonymous_alias = `${adj}${animal}${num}`

  // 4. Insert into our custom public.users table
  const password_hash = hashPassword(password)
  
  const { error: insertError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    username: finalUsername,
    email,
    phone,
    gender,
    date_of_birth,
    anonymous_alias,
    password_hash,
  })

  if (insertError) {
    console.error('Failed to initialize profile. Error:', insertError)
    return { error: 'User account created but failed to initialize profile.' }
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPasswordAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = forgotPasswordSchema.safeParse(data)

  if (!parsed.success) {
    // Return early but keeping success: true simulates email exists for security
    return { success: true }
  }

  const email = parsed.data.email

  try {
    // 1. Get user ID from our public users table
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (user) {
      // 2. Generate recovery link via Admin Auth API
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
        }
      })

      if (!linkError && linkData?.properties?.action_link) {
        // 3. Send email via Resend
        await resend.emails.send({
          from: 'Stranger Mingle <team@strangermingle.com>',
          to: [email],
          subject: 'Reset Your Password — Stranger Mingle',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1f2937; background-color: #f9fafb;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Stranger Mingle</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
                <p style="font-size: 16px; line-height: 26px; color: #4b5563; margin-bottom: 24px;">
                  We received a request to reset your password for your Stranger Mingle account. Click the button below to choose a new password.
                </p>
                
                <div style="margin-top: 40px; text-align: center;">
                  <a href="${linkData.properties.action_link}" style="background-color: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
                    Set New Password
                  </a>
                </div>
                
                <p style="margin-top: 32px; font-size: 13px; color: #9ca3af; line-height: 20px; text-align: center;">
                  If you didn't request a password reset, you can safely ignore this email. This link will expire shortly.
                </p>
              </div>
              
              <div style="margin-top: 32px; text-align: center; font-size: 13px; color: #9ca3af; line-height: 20px;">
                <p style="margin-bottom: 8px;">You're receiving this because you use Stranger Mingle.</p>
                <p style="margin: 0;">&copy; 2026 Stranger Mingle. All rights reserved.</p>
              </div>
            </div>
          `
        });
      }
    }
  } catch (err) {
    // Log error but don't expose to client
    console.error('forgotPasswordAction custom flow error:', err)
  }

  // Never reveal if email exists or not
  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = resetPasswordSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid password details' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Sync password_hash in public.users
  const user = (await supabase.auth.getUser()).data.user
  if (user) {
    const password_hash = hashPassword(parsed.data.password)
    await supabaseAdmin.from('users').update({
      password_hash,
      updated_at: new Date().toISOString()
    }).eq('id', user.id)
  }

  return { success: true }
}

export async function checkUsernameAction(username: string) {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('users') as any)
    .select('id')
    .eq('username', username)
    .single()

  if (data) {
    return { available: false }
  }
  return { available: true }
}
