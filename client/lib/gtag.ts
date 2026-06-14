export const GA_ID = 'G-RLWZRJCF44'

export function updateGtagConsent(granted: boolean) {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).gtag
  if (typeof g !== 'function') return
  g('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  })
}

export function readStoredConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem('factyo-cookie-consent')
  if (v === 'granted' || v === 'denied') return v
  return null
}

export function saveConsent(granted: boolean) {
  localStorage.setItem('factyo-cookie-consent', granted ? 'granted' : 'denied')
  updateGtagConsent(granted)
}
