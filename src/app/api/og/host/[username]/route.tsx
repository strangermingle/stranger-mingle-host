import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  try {
    const supabase = await createClient()
    const { data: host } = await supabase
      .from('host_profiles')
      .select(`
        display_name,
        tagline,
        logo_url,
        rating_avg,
        follower_count,
        user:users!host_profiles_user_id_fkey ( avatar_url )
      `)
      .eq('user:users!host_profiles_user_id_fkey(username)', username)
      .single() as any

    if (!host) {
      return new Response('Not Found', { status: 404 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: 'linear-gradient(to bottom right, #1e1b4b, #000)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '800px',
              padding: '60px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '60px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <img
              src={host.logo_url || host.user.avatar_url || 'https://host.strangermingle.com/placeholder-avatar.jpg'}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '6px solid #4f46e5',
                marginBottom: '30px',
              }}
            />

            <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
              {host.display_name}
            </div>

            <div style={{ fontSize: '28px', color: '#a5b4fc', marginBottom: '40px', textAlign: 'center' }}>
              {host.tagline || 'Verified Host on Stranger Mingle'}
            </div>

            <div style={{ display: 'flex', gap: '60px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{host.rating_avg} ★</div>
                <div style={{ fontSize: '18px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Rating</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{host.follower_count}</div>
                <div style={{ fontSize: '18px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>Stranger Mingle</div>
            <div style={{ fontSize: '24px', color: '#6366f1' }}>Host Profile</div>
          </div>
        </div>
      ) as any,
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
