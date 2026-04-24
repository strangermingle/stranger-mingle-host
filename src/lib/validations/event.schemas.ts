import { z } from 'zod'

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(255, 'Title cannot exceed 255 characters'),
    host_id: z.string().uuid('Invalid host page selected'),
    category_id: z.string().uuid('Invalid category selected'),
    start_datetime: z.string().datetime({ message: 'Invalid start date' }),
    end_datetime: z.string().datetime({ message: 'Invalid end date' }),
    timezone: z.string().min(1, 'Timezone is required'),
    ticketing_mode: z.enum(['platform', 'external', 'free', 'rsvp', 'none']),
    event_type: z.enum(['in_person', 'online', 'hybrid']),
    cover_image_url: z.string().url('Cover image is required').optional().or(z.literal('')),
    vertical_poster_url: z.string().url('Vertical poster (4:5) is required').optional().or(z.literal('')),
    description: z.string().optional(),
    short_description: z
      .string()
      .max(500, 'Short description must be 500 characters or less')
      .optional(),
    location_id: z.string().uuid('Invalid location selected').optional().or(z.literal('')),
    location: z.object({
      venue_name: z.string().optional().nullable().or(z.literal('')),
      address_line_1: z.string().optional().nullable().or(z.literal('')),
      city: z.string().optional().nullable().or(z.literal('')),
      state: z.string().optional().nullable().or(z.literal('')),
      country: z.string().optional().nullable().or(z.literal('')),
      postal_code: z.string().optional().nullable().or(z.literal('')),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
    }).optional().nullable(),
    online_event_url: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
    online_platform: z.string().optional(),
    online_url_reveal: z.string().optional(),
    external_ticket_url: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
    max_capacity: z
      .number()
      .int('Capacity must be a whole number')
      .positive('Capacity must be positive')
      .optional()
      .nullable(),
    is_age_restricted: z.boolean().optional().default(false),
    min_age: z
      .number()
      .int()
      .positive('Age must be a positive number')
      .optional()
      .nullable(),
    doors_open_at: z.string().optional(),
    refund_policy: z.enum(['no_refund', 'flexible', 'moderate', 'strict', 'custom']).optional().default('no_refund'),
    refund_policy_text: z.string().optional(),
    is_recurring: z.boolean().optional().default(false),
    recurrence_rule: z.string().optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional().default('published'),
    meta_title: z.string().max(70, 'Meta title should be 70 characters or less').optional().or(z.literal('')),
    meta_description: z.string().max(160, 'Meta description should be 160 characters or less').optional().or(z.literal('')),
    cover_image_alt: z.string().optional().or(z.literal('')),
    vertical_poster_alt: z.string().optional().or(z.literal('')),
    ticket_tiers: z.array(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string(),
        description: z.string().optional(),
        tier_type: z.string(),
        price: z.number().min(0),
        total_quantity: z.number().int().positive(),
        max_per_booking: z.number().int().positive(),
        sale_start_at: z.string().optional(),
        sale_end_at: z.string().optional(),
        perks: z.array(z.string()).optional(),
      })
    ).optional(),
    agenda: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        start_time: z.string(),
        end_time: z.string().optional(),
      })
    ).optional(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).optional(),
    tags: z.array(z.string()).optional(),
    cohosts: z.array(z.string().uuid()).optional(),
    age_restrictions: z.array(
      z.object({
        restriction_text: z.string(),
        min_age: z.number().int().optional().nullable(),
      })
    ).optional(),
  })
  .refine(
    (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
    {
      message: 'End date must be after start date',
      path: ['end_datetime'],
    }
  )
  .refine(
    (data) => {
      if (['online', 'hybrid'].includes(data.event_type)) {
        return true
      }
      return true
    },
    {
      message: 'Online event link is highly recommended for online events',
      path: ['online_event_url'],
    }
  )
  .refine(
    (data) => {
      if (data.ticketing_mode === 'external') {
        return !!data.external_ticket_url
      }
      return true
    },
    {
      message: 'External ticket URL is required for external ticketing mode',
      path: ['external_ticket_url'],
    }
  )

// Make all fields optional for the update schema, but keep refining logic
// Since createEventSchema uses .refine(), we grab its inner schema safely
const _baseEventSchema = z.object({
  title: z.string().min(5).max(255),
  host_id: z.string().uuid(),
  category_id: z.string().uuid(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  timezone: z.string().min(1),
  ticketing_mode: z.enum(['platform', 'external', 'free', 'rsvp', 'none']),
  event_type: z.enum(['in_person', 'online', 'hybrid']),
  cover_image_url: z.string().url(),
  vertical_poster_url: z.string().url(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  location_id: z.string().uuid().optional().or(z.literal('')),
  location: z.object({
    venue_name: z.string().optional().nullable(),
    address_line_1: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  }).optional().nullable(),
  online_event_url: z.string().url().optional().or(z.literal('')),
  online_platform: z.string().optional(),
  online_url_reveal: z.string().optional(),
  external_ticket_url: z.string().url().optional().or(z.literal('')),
  max_capacity: z.number().int().positive().optional().nullable(),
    is_age_restricted: z.boolean().optional().default(false),
    min_age: z.number().int().positive().optional().nullable(),
    doors_open_at: z.string().optional(),
    refund_policy: z.enum(['no_refund', 'flexible', 'moderate', 'strict', 'custom']).optional().default('no_refund'),
    refund_policy_text: z.string().optional(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_rule: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional().default('published'),
  meta_title: z.string().max(70).optional().or(z.literal('')),
  meta_description: z.string().max(160).optional().or(z.literal('')),
  cover_image_alt: z.string().optional().or(z.literal('')),
  vertical_poster_alt: z.string().optional().or(z.literal('')),
  ticket_tiers: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      description: z.string().optional(),
      tier_type: z.string(),
      price: z.number().min(0),
      total_quantity: z.number().int().positive(),
      max_per_booking: z.number().int().positive(),
      sale_start_at: z.string().optional(),
      sale_end_at: z.string().optional(),
      perks: z.array(z.string()).optional(),
    })
  ).optional(),
  agenda: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      start_time: z.string(),
      end_time: z.string().optional(),
    })
  ).optional(),
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).optional(),
  tags: z.array(z.string()).optional(),
  cohosts: z.array(z.string().uuid()).optional(),
  age_restrictions: z.array(
    z.object({
      restriction_text: z.string(),
      min_age: z.number().int().optional().nullable(),
    })
  ).optional(),
})

export const updateEventSchema = _baseEventSchema.partial().refine(
  (data: any) => {
    // Only check date order if both are provided during the update
    if (data.start_datetime && data.end_datetime) {
      return new Date(data.end_datetime) > new Date(data.start_datetime)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['end_datetime'],
  }
)

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
