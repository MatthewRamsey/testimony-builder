import {
  buildTwitterShareUrl,
  buildFacebookShareUrl,
  buildLinkedInShareUrl,
  buildWhatsAppShareUrl,
  buildEmailShareUrl,
  getShareUrl,
  getAllShareUrls,
  SharePlatform,
  ShareUrlParams,
} from '@/lib/share-urls'

describe('Share URL Builders', () => {
  const baseParams: ShareUrlParams = {
    url: 'https://example.com/share/abc123',
    title: 'My Testimony',
    excerpt: 'This is my story of faith and transformation.',
  }

  describe('buildTwitterShareUrl', () => {
    it('should build correct Twitter intent URL with text and url', () => {
      const url = buildTwitterShareUrl(baseParams)

      expect(url).toContain('twitter.com/intent/tweet')
      expect(url).toContain('text=')
      expect(url).toContain('url=')
    })

    it('should include title and excerpt in text parameter', () => {
      const url = buildTwitterShareUrl(baseParams)
      const urlObj = new URL(url)
      const text = urlObj.searchParams.get('text')

      expect(text).toContain('My Testimony')
      expect(text).toContain('This is my story')
    })

    it('should include share URL', () => {
      const url = buildTwitterShareUrl(baseParams)
      const urlObj = new URL(url)
      const shareUrl = urlObj.searchParams.get('url')

      expect(shareUrl).toBe('https://example.com/share/abc123')
    })

    it('should work without excerpt', () => {
      const paramsNoExcerpt: ShareUrlParams = {
        url: 'https://example.com/share/abc123',
        title: 'My Testimony',
      }

      const url = buildTwitterShareUrl(paramsNoExcerpt)
      const urlObj = new URL(url)
      const text = urlObj.searchParams.get('text')

      expect(text).toBe('My Testimony')
    })

    it('should properly encode special characters', () => {
      const paramsSpecial: ShareUrlParams = {
        url: 'https://example.com/share/test',
        title: 'Title with & special <chars>',
        excerpt: 'Excerpt with "quotes" and \'apostrophes\'',
      }

      const url = buildTwitterShareUrl(paramsSpecial)

      // URL should be properly encoded
      expect(url).not.toContain(' ')
      expect(url).toContain('%')
    })
  })

  describe('buildFacebookShareUrl', () => {
    it('should build correct Facebook sharer URL', () => {
      const url = buildFacebookShareUrl(baseParams)

      expect(url).toContain('facebook.com/sharer/sharer.php')
      expect(url).toContain('u=')
    })

    it('should only include URL parameter (not title/excerpt)', () => {
      const url = buildFacebookShareUrl(baseParams)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.has('u')).toBe(true)
      expect(urlObj.searchParams.has('text')).toBe(false)
      expect(urlObj.searchParams.has('title')).toBe(false)
    })

    it('should properly encode the share URL', () => {
      const paramsWithSpecialUrl: ShareUrlParams = {
        url: 'https://example.com/share/test?param=value&other=123',
        title: 'Test',
      }

      const url = buildFacebookShareUrl(paramsWithSpecialUrl)
      const urlObj = new URL(url)
      const shareUrl = urlObj.searchParams.get('u')

      expect(shareUrl).toBe('https://example.com/share/test?param=value&other=123')
    })
  })

  describe('buildLinkedInShareUrl', () => {
    it('should build correct LinkedIn share URL', () => {
      const url = buildLinkedInShareUrl(baseParams)

      expect(url).toContain('linkedin.com/sharing/share-offsite')
      expect(url).toContain('url=')
    })

    it('should only include URL parameter', () => {
      const url = buildLinkedInShareUrl(baseParams)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.has('url')).toBe(true)
      expect(urlObj.searchParams.has('title')).toBe(false)
    })
  })

  describe('buildWhatsAppShareUrl', () => {
    it('should build correct WhatsApp share URL', () => {
      const url = buildWhatsAppShareUrl(baseParams)

      expect(url).toContain('wa.me')
      expect(url).toContain('text=')
    })

    it('should include title, excerpt, and URL in text', () => {
      const url = buildWhatsAppShareUrl(baseParams)
      const urlObj = new URL(url)
      const text = urlObj.searchParams.get('text')

      expect(text).toContain('My Testimony')
      expect(text).toContain('This is my story')
      expect(text).toContain('https://example.com/share/abc123')
    })

    it('should work without excerpt', () => {
      const paramsNoExcerpt: ShareUrlParams = {
        url: 'https://example.com/share/abc123',
        title: 'My Testimony',
      }

      const url = buildWhatsAppShareUrl(paramsNoExcerpt)
      const urlObj = new URL(url)
      const text = urlObj.searchParams.get('text')

      expect(text).toContain('My Testimony')
      expect(text).toContain('https://example.com/share/abc123')
      expect(text).not.toContain('undefined')
    })
  })

  describe('buildEmailShareUrl', () => {
    it('should build correct mailto URL', () => {
      const url = buildEmailShareUrl(baseParams)

      expect(url).toContain('mailto:')
      expect(url).toContain('subject=')
      expect(url).toContain('body=')
    })

    it('should use title as subject', () => {
      const url = buildEmailShareUrl(baseParams)
      const urlObj = new URL(url)
      const subject = urlObj.searchParams.get('subject')

      expect(subject).toBe('My Testimony')
    })

    it('should include excerpt and URL in body', () => {
      const url = buildEmailShareUrl(baseParams)
      const urlObj = new URL(url)
      const body = urlObj.searchParams.get('body')

      expect(body).toContain('This is my story')
      expect(body).toContain('https://example.com/share/abc123')
    })

    it('should work without excerpt', () => {
      const paramsNoExcerpt: ShareUrlParams = {
        url: 'https://example.com/share/abc123',
        title: 'My Testimony',
      }

      const url = buildEmailShareUrl(paramsNoExcerpt)
      const urlObj = new URL(url)
      const body = urlObj.searchParams.get('body')

      expect(body).toContain('Read this testimony')
      expect(body).toContain('https://example.com/share/abc123')
    })
  })

  describe('getShareUrl', () => {
    it('should return correct URL for each platform', () => {
      const platforms: SharePlatform[] = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email']

      platforms.forEach((platform) => {
        const url = getShareUrl(platform, baseParams)
        expect(url).toBeTruthy()
        expect(typeof url).toBe('string')
      })
    })

    it('should return Twitter URL for twitter platform', () => {
      const url = getShareUrl('twitter', baseParams)
      expect(url).toContain('twitter.com')
    })

    it('should return Facebook URL for facebook platform', () => {
      const url = getShareUrl('facebook', baseParams)
      expect(url).toContain('facebook.com')
    })

    it('should return LinkedIn URL for linkedin platform', () => {
      const url = getShareUrl('linkedin', baseParams)
      expect(url).toContain('linkedin.com')
    })

    it('should return WhatsApp URL for whatsapp platform', () => {
      const url = getShareUrl('whatsapp', baseParams)
      expect(url).toContain('wa.me')
    })

    it('should return mailto URL for email platform', () => {
      const url = getShareUrl('email', baseParams)
      expect(url).toContain('mailto:')
    })
  })

  describe('getAllShareUrls', () => {
    it('should return URLs for all platforms', () => {
      const urls = getAllShareUrls(baseParams)

      expect(urls.twitter).toContain('twitter.com')
      expect(urls.facebook).toContain('facebook.com')
      expect(urls.linkedin).toContain('linkedin.com')
      expect(urls.whatsapp).toContain('wa.me')
      expect(urls.email).toContain('mailto:')
    })

    it('should return an object with all platform keys', () => {
      const urls = getAllShareUrls(baseParams)

      expect(Object.keys(urls)).toEqual(['twitter', 'facebook', 'linkedin', 'whatsapp', 'email'])
    })
  })

  describe('URL encoding edge cases', () => {
    it('should handle URLs with query parameters', () => {
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test?foo=bar&baz=123',
        title: 'Test',
      }

      const twitterUrl = buildTwitterShareUrl(params)
      const urlObj = new URL(twitterUrl)
      const shareUrl = urlObj.searchParams.get('url')

      expect(shareUrl).toBe('https://example.com/share/test?foo=bar&baz=123')
    })

    it('should handle URLs with hash fragments', () => {
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test#section',
        title: 'Test',
      }

      const facebookUrl = buildFacebookShareUrl(params)
      expect(facebookUrl).toContain('test%23section')
    })

    it('should handle Unicode in title and excerpt', () => {
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test',
        title: 'Mi Testimonio',
        excerpt: 'Esta es mi historia de fe y transformación.',
      }

      const url = buildTwitterShareUrl(params)
      expect(url).toBeTruthy()
      // Should be properly URL encoded
      expect(url).not.toContain(' ')
    })

    it('should handle empty title', () => {
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test',
        title: '',
      }

      const url = buildTwitterShareUrl(params)
      expect(url).toContain('twitter.com')
    })

    it('should handle very long content', () => {
      const longExcerpt = 'A'.repeat(1000)
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test',
        title: 'Test',
        excerpt: longExcerpt,
      }

      const url = buildTwitterShareUrl(params)
      // Should still be a valid URL
      expect(() => new URL(url)).not.toThrow()
    })

    it('should handle newlines in content', () => {
      const params: ShareUrlParams = {
        url: 'https://example.com/share/test',
        title: 'Test\nTitle',
        excerpt: 'Line 1\nLine 2\nLine 3',
      }

      const url = buildWhatsAppShareUrl(params)
      // Should be encoded
      expect(url).not.toContain('\n')
    })
  })
})
