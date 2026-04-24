/* ──────────────────────────────────────────────────────────────
 * Google Analytics (gtag.js) helper for Stranger Mingle Host Dashboard.
 * Uses the standard gtag() function rather than raw dataLayer.push.
 * ────────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Typed wrapper around `window.gtag('event', ...)`.
 * Falls back to dataLayer.push when gtag isn't loaded yet.
 */
export const sendGAEvent = ({
  action,
  category,
  label,
  value,
  ...rest
}: {
  action: string
  category: string
  label?: string
  value?: number
  [key: string]: unknown
}) => {
  if (typeof window === 'undefined') return

  const params: Record<string, unknown> = {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  }

  // Prefer gtag() if available (fully initialised)
  if (window.gtag) {
    window.gtag('event', action, params)
    return
  }

  // Fallback to dataLayer if gtag not ready yet
  if (window.dataLayer) {
    window.dataLayer.push({
      event: action,
      ...params,
    })
  }
}

/**
 * Track a virtual page-view (useful for SPA-style navigation).
 */
export const sendGAPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined') return

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: title,
    })
  }
}

/**
 * Set a user-level property for all subsequent events (e.g. host_id, role).
 */
export const setGAUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('set', 'user_properties', properties)
}
