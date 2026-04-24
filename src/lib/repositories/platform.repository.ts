import { createClient } from '../supabase/server'

export interface PlatformConfig {
  gst_rate_pct: number
  platform_fee_pct: number
  max_tickets_per_booking: number
  currency_default: string
  waitlist_enabled: boolean
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_config')
    .select('key, value')

  if (error) {
    throw new Error(`Failed to fetch platform config: ${error.message}`)
  }

  // Default values
  const config: PlatformConfig = {
    gst_rate_pct: 18,
    platform_fee_pct: 10,
    max_tickets_per_booking: 5,
    currency_default: 'INR',
    waitlist_enabled: true
  }

  if (data) {
    data.forEach((item: any) => {
      switch (item.key) {
        case 'gst_rate_pct':
          config.gst_rate_pct = Number(item.value)
          break
        case 'platform_fee_pct':
          config.platform_fee_pct = Number(item.value)
          break
        case 'max_tickets_per_booking':
          config.max_tickets_per_booking = Number(item.value)
          break
        case 'currency_default':
          config.currency_default = item.value
          break
        case 'waitlist_enabled':
          config.waitlist_enabled = item.value === 'true'
          break
      }
    })
  }

  return config
}
