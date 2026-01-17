export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email'

export interface ShareUrlParams {
  url: string
  title: string
  excerpt?: string
}

/**
 * Builds Twitter/X share intent URL.
 * Format: https://twitter.com/intent/tweet?text={text}&url={url}
 */
export function buildTwitterShareUrl({ url, title, excerpt }: ShareUrlParams): string {
  const text = excerpt ? `${title}\n\n${excerpt}` : title
  const params = new URLSearchParams({
    text,
    url,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Builds Facebook share URL.
 * Format: https://www.facebook.com/sharer/sharer.php?u={url}
 * Note: Facebook uses OG tags for title/description, so we only pass the URL.
 */
export function buildFacebookShareUrl({ url }: ShareUrlParams): string {
  const params = new URLSearchParams({
    u: url,
  })
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

/**
 * Builds LinkedIn share URL.
 * Format: https://www.linkedin.com/sharing/share-offsite/?url={url}
 * Note: LinkedIn uses OG tags for title/description.
 */
export function buildLinkedInShareUrl({ url }: ShareUrlParams): string {
  const params = new URLSearchParams({
    url,
  })
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
}

/**
 * Builds WhatsApp share URL.
 * Format: https://wa.me/?text={text+url}
 */
export function buildWhatsAppShareUrl({ url, title, excerpt }: ShareUrlParams): string {
  const text = excerpt ? `${title}\n\n${excerpt}\n\n${url}` : `${title}\n\n${url}`
  const params = new URLSearchParams({
    text,
  })
  return `https://wa.me/?${params.toString()}`
}

/**
 * Builds Email mailto link.
 * Format: mailto:?subject={subject}&body={body}
 */
export function buildEmailShareUrl({ url, title, excerpt }: ShareUrlParams): string {
  const body = excerpt
    ? `${excerpt}\n\nRead the full testimony: ${url}`
    : `Read this testimony: ${url}`

  const params = new URLSearchParams({
    subject: title,
    body,
  })
  return `mailto:?${params.toString()}`
}

/**
 * Gets the share URL for a specific platform.
 */
export function getShareUrl(platform: SharePlatform, params: ShareUrlParams): string {
  switch (platform) {
    case 'twitter':
      return buildTwitterShareUrl(params)
    case 'facebook':
      return buildFacebookShareUrl(params)
    case 'linkedin':
      return buildLinkedInShareUrl(params)
    case 'whatsapp':
      return buildWhatsAppShareUrl(params)
    case 'email':
      return buildEmailShareUrl(params)
    default:
      return params.url
  }
}

/**
 * Gets all share URLs for a testimony.
 */
export function getAllShareUrls(params: ShareUrlParams): Record<SharePlatform, string> {
  return {
    twitter: buildTwitterShareUrl(params),
    facebook: buildFacebookShareUrl(params),
    linkedin: buildLinkedInShareUrl(params),
    whatsapp: buildWhatsAppShareUrl(params),
    email: buildEmailShareUrl(params),
  }
}
