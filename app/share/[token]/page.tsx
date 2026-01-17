import { Metadata } from 'next'
import { ShareContent } from './ShareContent'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { generateExcerptWithFallback } from '@/lib/excerpt'

interface SharePageProps {
  params: Promise<{ token: string }>
}

/**
 * Generates Open Graph and Twitter meta tags for shared testimonies.
 * This enables rich link previews when shared on social media.
 */
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params

  try {
    const repository = new SupabaseTestimonyRepository()
    const testimony = await repository.findPublicByShareToken(token)

    if (!testimony) {
      return {
        title: 'Testimony Not Found',
        description: 'The requested testimony could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://testimony.pro'
    const excerpt = generateExcerptWithFallback(testimony)
    const shareUrl = `${baseUrl}/share/${token}`
    const ogImageUrl = `${baseUrl}/og-image.svg`

    return {
      title: testimony.title,
      description: excerpt,
      openGraph: {
        title: testimony.title,
        description: excerpt,
        url: shareUrl,
        type: 'article',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${testimony.title} - A Personal Testimony`,
          },
        ],
        siteName: 'Testimony Pro',
      },
      twitter: {
        card: 'summary_large_image',
        title: testimony.title,
        description: excerpt,
        images: [ogImageUrl],
      },
    }
  } catch (error) {
    console.error('[Share Page] Error generating metadata:', error)
    return {
      title: 'Share Testimony',
      description: 'Read and share this personal testimony of faith.',
    }
  }
}

export default async function ShareTestimonyPage({ params }: SharePageProps) {
  const { token } = await params

  return <ShareContent token={token} />
}
