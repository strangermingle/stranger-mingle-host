import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RESEND_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  CLOUDINARY_FOLDER_LANDSCAPE: z.string().optional().default('landscape_posters'),
  CLOUDINARY_FOLDER_VERTICAL: z.string().optional().default('vertical_posters'),
  CLOUDINARY_FOLDER_PROFILE: z.string().optional().default('profile_images'),
  CLOUDINARY_FOLDER_LOGO: z.string().optional().default('host_logo'),
});

const isServer = typeof window === 'undefined';

const processEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_LANDSCAPE: process.env.CLOUDINARY_FOLDER_LANDSCAPE,
  CLOUDINARY_FOLDER_VERTICAL: process.env.CLOUDINARY_FOLDER_VERTICAL,
  CLOUDINARY_FOLDER_PROFILE: process.env.CLOUDINARY_FOLDER_PROFILE,
  CLOUDINARY_FOLDER_LOGO: process.env.CLOUDINARY_FOLDER_LOGO,
};

// Only require secret keys on the server
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  if (isServer) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables on server. Please check your .env file or Vercel settings.');
  } else {
    // On the client, we just log a warning for missing NEXT_PUBLIC_* variables
    // and only for those that ARE indeed prefixed but missing.
    const missingPublic = Object.keys(parsed.error.flatten().fieldErrors).filter(k => k.startsWith('NEXT_PUBLIC_'));
    if (missingPublic.length > 0) {
      console.warn('⚠️ Missing public environment variables on client:', missingPublic);
    }
  }
}

export const env = (parsed.success ? parsed.data : processEnv) as z.infer<typeof envSchema> & {
    // Strong types for when it's accessed on server
    RAZORPAY_KEY_SECRET: string;
    RAZORPAY_WEBHOOK_SECRET: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
};

