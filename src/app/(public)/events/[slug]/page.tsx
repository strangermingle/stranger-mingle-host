import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/lib/repositories/events.repository'
import { EventDetailHero } from '@/components/events/EventDetailHero'
import { MapPinIcon, GlobeIcon, ClockIcon } from 'lucide-react'
import { generateEventMetadata } from '@/lib/metadata'
import ShareButtons from '@/components/events/ShareButtons'
import { EventDiscussions } from '@/components/events/EventDiscussions'
import { EventReviews } from '@/components/events/EventReviews'
import { getRelatedEvents } from '@/lib/repositories/events.repository'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface PageProps {
  params: { slug: string }
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event || event.status !== 'published') {
    return { title: 'Event Not Found' }
  }

  return generateEventMetadata(event)
}

export const dynamic = 'force-dynamic'

export default async function EventDetailPage(props: PageProps) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const isBookingSuccess = searchParams.booking === 'success'
  const bookingRef = searchParams.ref as string

  const supabase = await createClient()
  const event = await getEventBySlug(slug)

  if (!event || event.status !== 'published') {
    notFound()
  }

  // Fetch booking details if success flag is present
  let bookingForModal = null
  if (isBookingSuccess && bookingRef) {
    const { data: b } = await (supabaseAdmin
        .from('bookings') as any)
        .select(`
            id,
            booking_ref,
            attendee_name,
            attendee_email,
            events (
                title,
                start_datetime,
                end_datetime,
                cover_image_url,
                location:locations (
                    venue_name,
                    city
                ),
                slug
            ),
            tickets (
                id,
                ticket_number,
                qr_code_data,
                booking_items (
                    id,
                    ticket_tiers (
                        name
                    )
                )
            )
        `)
        .eq('booking_ref', bookingRef)
        .single()
    
    if (b) {
        bookingForModal = {
            bookingRef: b.booking_ref,
            attendeeName: b.attendee_name,
            attendeeEmail: b.attendee_email,
            eventTitle: b.events?.title,
            eventDate: b.events?.start_datetime,
            eventEndDate: b.events?.end_datetime,
            coverImageUrl: b.events?.cover_image_url,
            eventSlug: b.events?.slug,
            venueName: b.events?.location?.venue_name,
            city: b.events?.location?.city,
            tickets: b.tickets?.map((t: any) => ({
                id: t.id,
                ticketNumber: t.ticket_number,
                tierName: t.booking_items?.ticket_tiers?.name || 'General',
                qrCodeData: t.qr_code_data
            })) || []
        }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Parallel fetches
  const [
    { data: ticketTiers },
    { data: images },
    { data: agenda },
    { data: faqs },
    { data: host },
    { data: discussionsData },
    { data: reviewsData },
    { data: followData },
    { data: bookingData },
    { data: likeData },
    { data: saveData },
    { data: interestData },
    relatedEventsData,
  ] = await Promise.all([
    (supabase.from('ticket_tiers') as any).select('*').eq('event_id', event.id).eq('is_active', true).order('price'),
    (supabase.from('event_images') as any).select('*').eq('event_id', event.id).order('sort_order'),
    (supabase.from('event_agenda') as any).select('*').eq('event_id', event.id).order('sort_order'),
    (supabase.from('event_faqs') as any).select('*').eq('event_id', event.id).order('sort_order'),
    (supabase.from('host_profiles') as any).select('*').eq('id', event.host_id).single(),
    (supabase.from('event_discussions') as any).select('*, user:users(username, avatar_url, anonymous_alias)').eq('event_id', event.id).order('created_at', { ascending: true }),
    (supabase.from('event_reviews') as any).select('*, user:users(username, avatar_url), review_helpful_votes(id)').eq('event_id', event.id).eq('is_approved', true).order('created_at', { ascending: false }),
    user ? (supabase.from('host_follows') as any).select('id').eq('follower_id', user.id).eq('host_id', event.host_id).maybeSingle() : Promise.resolve({ data: null }),
    user ? (supabase.from('bookings') as any).select('id').eq('user_id', user.id).eq('event_id', event.id).eq('status', 'confirmed').maybeSingle() : Promise.resolve({ data: null }),
    user ? (supabase.from('event_likes') as any).select('id').eq('user_id', user.id).eq('event_id', event.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? (supabase.from('event_saves') as any).select('id').eq('user_id', user.id).eq('event_id', event.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? (supabase.from('event_interests') as any).select('id').eq('user_id', user.id).eq('event_id', event.id).maybeSingle() : Promise.resolve({ data: null }),
    getRelatedEvents(event.id, event.city || '')
  ])

  const relatedEvents = (relatedEventsData as any) || []

  const discussions = (discussionsData || []).map((d: any) => ({
    ...d,
    user: d.user || { username: 'Unknown', avatar_url: null, anonymous_alias: 'Ghost' }
  }))

  const reviews = (reviewsData || []).map((r: any) => ({
    ...r,
    user: r.user || { username: 'Anonymous', avatar_url: null },
    helpful_count: r.review_helpful_votes?.length || 0,
    is_verified_attendee: !!r.booking_id
  }))

  const isFollowing = !!followData?.id
  const hasBooking = bookingData?.id
  const isLiked = !!likeData?.id
  const isSaved = !!saveData?.id
  const isInterested = !!interestData?.id

  const minPrice = ticketTiers && ticketTiers.length > 0 
    ? Math.min(...ticketTiers.map((t: any) => t.price)) 
    : 0

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.start_datetime,
    endDate: event.end_datetime || event.start_datetime,
    eventAttendanceMode: event.event_type === 'online' ? 'https://schema.org/OnlineEventAttendanceMode' : event.event_type === 'hybrid' ? 'https://schema.org/MixedEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': event.event_type === 'online' ? 'VirtualLocation' : 'Place',
      name: event.venue_name || 'TBA',
      url: event.online_event_url || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address_line_1 || '',
        addressLocality: event.city,
        addressRegion: event.state || '',
        postalCode: event.postal_code || '',
        addressCountry: event.country || 'IN',
      }
    },
    image: event.cover_image_url ? [event.cover_image_url] : [],
    description: event.meta_description || event.short_description || event.description,
    organizer: {
      '@type': 'Organization',
      name: host?.organisation_name || host?.display_name || event.host_display_name || 'Stranger Mingle',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/hosts/${host?.slug || (event as any).host_username || ''}`
    },
    offers: (ticketTiers || []).map((tier: any) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: tier.currency || 'INR',
      availability: tier.sold_count < tier.total_quantity ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}#tickets-section`,
      validFrom: tier.sale_start_at || event.created_at
    })),
    isAccessibleForFree: minPrice === 0,
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (event as any).rating_avg || 4.5,
        reviewCount: (event as any).rating_count || reviews.length,
        bestRating: 5,
        worstRating: 1
      }
    })
  }

  // FAQ Schema
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq: any) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': process.env.NEXT_PUBLIC_SITE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Events',
        'item': `${process.env.NEXT_PUBLIC_SITE_URL}/events`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': event.city || 'Local',
        'item': `${process.env.NEXT_PUBLIC_SITE_URL}/${(event.city || '').toLowerCase()}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': event.title,
        'item': `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`
      }
    ]
  }

  return (
    <article className="bg-white pb-20">
      {/* Inject Structured Data (Minimal) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <EventDetailHero 
        event={event} 
        hostProfile={host} 
        hostUser={(event as any).host}
        isFollowing={isFollowing}
        isLiked={isLiked}
        isSaved={isSaved}
        isInterested={isInterested}
        minPrice={minPrice}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
            {/* About Section */}
            {(event.description || event.short_description) && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-2xl font-bold text-gray-900 mb-4">About this event</h2>
                <div className="prose prose-indigo max-w-none text-gray-600">
                  <p className="whitespace-pre-wrap">{event.description || event.short_description}</p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm font-bold text-indigo-950 uppercase tracking-tight">Host Preview - Share Link</p>
                  <ShareButtons 
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`} 
                    title={event.title} 
                  />
                </div>
              </section>
            )}

            {/* Event Gallery */}
            {images && images.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <h2 id="gallery-heading" className="text-2xl font-bold text-gray-900 mb-4">Event Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img: any) => (
                    <div key={img.id} className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                      <Image 
                        src={img.image_url} 
                        alt={img.alt_text || 'Event image'} 
                        fill 
                        className="object-cover transition hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Location / Venue details */}
            <section aria-labelledby="location-heading">
               <h2 id="location-heading" className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
               <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-start gap-4">
                     <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                        {event.event_type === 'online' ? <GlobeIcon className="h-6 w-6" /> : <MapPinIcon className="h-6 w-6" />}
                     </div>
                     <div>
                        <h3 className="font-semibold text-gray-900">
                           {event.event_type === 'online' ? 'Online Event' : (event as any).location?.venue_name || event.venue_name || 'Location to be announced'}
                        </h3>
                        {event.event_type !== 'online' && (
                           <p className="mt-1 text-gray-600">
                              {[(event as any).location?.address_line1 || event.address_line_1, (event as any).location?.address_line2 || event.address_line_2, (event as any).location?.city || event.city].filter(Boolean).join(', ')}
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            </section>

            {/* Agenda */}
            {agenda && agenda.length > 0 && (
              <section aria-labelledby="agenda-heading">
               <h2 id="agenda-heading" className="text-2xl font-bold text-gray-900 mb-4">Agenda</h2>
                <div className="space-y-6 rounded-xl border border-gray-200 p-6">
                  {(agenda || []).map((item: any, idx: number) => (
                    <div key={item.id} className="relative flex gap-4">
                      {idx !== (agenda || []).length - 1 && (
                         <div className="absolute left-[11px] top-8 h-full w-0.5 bg-gray-200" />
                      )}
                      
                      <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      </div>
                      
                      <div className="pb-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                           <ClockIcon className="h-4 w-4" />
                           {new Date(item.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="mt-1 font-bold text-gray-900">{item.title}</h3>
                        {item.description && <p className="mt-2 text-sm text-gray-600">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <hr className="border-gray-100" />

            {/* Reviews Preview */}
            <section aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="text-2xl font-bold text-gray-900 mb-6">Attendee Reviews</h2>
              <EventReviews 
                  eventId={event.id} 
                  initialReviews={reviews} 
                  hasBooking={null}
              />
            </section>

            <hr className="border-gray-100" />

            {/* Discussion Preview */}
            <section aria-labelledby="discussions-heading">
              <h2 id="discussions-heading" className="text-2xl font-bold text-gray-900 mb-6">Event Discussion</h2>
              <EventDiscussions 
                eventId={event.id} 
                initialDiscussions={discussions} 
                currentUserId={user?.id}
              />
            </section>
        </div>
      </main>
    </article>
  )
}
