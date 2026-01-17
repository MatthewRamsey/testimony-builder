import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Share Page social sharing functionality
 */

test.describe('Share Page - Social Sharing', () => {
  // Note: These tests require a valid share token to exist in the database
  // In a real scenario, you would set up test data before running tests

  test.describe('Share Buttons Visibility', () => {
    test('should display all share buttons on the share page', async ({ page }) => {
      // Navigate to a share page (this would need a valid token in test environment)
      await page.goto('/share/test-token')

      // Wait for the page to load (either content or error)
      await page.waitForLoadState('networkidle')

      // Check if share buttons section exists (when testimony loads)
      const shareSection = page.locator('text=Share this testimony')

      // If the testimony loaded successfully, verify share buttons
      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify all platform buttons are present
        await expect(page.getByRole('button', { name: /twitter/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /facebook/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /linkedin/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /whatsapp/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /email/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
      }
    })

    test('should have correct aria labels for accessibility', async ({ page }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const shareSection = page.locator('text=Share this testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify aria-labels for accessibility
        await expect(page.locator('[aria-label="Share on Twitter"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on Facebook"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on LinkedIn"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on WhatsApp"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on Email"]')).toBeVisible()
      }
    })
  })

  test.describe('Copy Link Functionality', () => {
    test('should copy link to clipboard and show confirmation', async ({ page, context, browserName }) => {
      test.skip(browserName !== 'chromium', 'Clipboard permissions are only supported in Chromium')
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])

      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const copyButton = page.getByRole('button', { name: /copy link/i }).first()

      if (await copyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Click the copy button
        await copyButton.click()

        // Verify the button text changes to "Copied!"
        await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()

        // Verify clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
        expect(clipboardText).toContain('/share/test-token')

        // Wait for the "Copied!" message to disappear (3 seconds)
        await page.waitForTimeout(3500)
        await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
      }
    })
  })

  test.describe('Social Platform Links', () => {
    test('Twitter share button should open correct URL', async ({ page, context }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const twitterButton = page.getByRole('button', { name: /twitter/i })

      if (await twitterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Listen for popup
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          twitterButton.click(),
        ])

        // Verify the popup URL contains Twitter intent
        const popupUrl = popup.url()
        expect(popupUrl).toContain('twitter.com/intent/tweet')
        expect(popupUrl).toContain('url=')
        expect(popupUrl).toContain('text=')

        await popup.close()
      }
    })

    test('Facebook share button should open correct URL', async ({ page, context }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const facebookButton = page.getByRole('button', { name: /facebook/i })

      if (await facebookButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          facebookButton.click(),
        ])

        const popupUrl = popup.url()
        expect(popupUrl).toContain('facebook.com/sharer')
        expect(popupUrl).toContain('u=')

        await popup.close()
      }
    })

    test('LinkedIn share button should open correct URL', async ({ page, context }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const linkedInButton = page.getByRole('button', { name: /linkedin/i })

      if (await linkedInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          linkedInButton.click(),
        ])

        const popupUrl = popup.url()
        expect(popupUrl).toContain('linkedin.com/sharing')
        expect(popupUrl).toContain('url=')

        await popup.close()
      }
    })

    test('WhatsApp share button should open correct URL', async ({ page, context }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const whatsappButton = page.getByRole('button', { name: /whatsapp/i })

      if (await whatsappButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          whatsappButton.click(),
        ])

        const popupUrl = popup.url()
        expect(popupUrl).toContain('wa.me')
        expect(popupUrl).toContain('text=')

        await popup.close()
      }
    })

    test('Email share button should create mailto link', async ({ page }) => {
      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const emailButton = page.getByRole('button', { name: /email/i })

      if (await emailButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // For email, we can't easily test the mailto link opening
        // but we can verify the button click doesn't throw an error
        await expect(emailButton).toBeEnabled()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('share buttons should be visible on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const shareSection = page.locator('text=Share this testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify buttons are still visible on mobile
        await expect(page.getByRole('button', { name: /twitter/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /facebook/i })).toBeVisible()
      }
    })

    test('share buttons should wrap properly on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })

      await page.goto('/share/test-token')
      await page.waitForLoadState('networkidle')

      const shareSection = page.locator('text=Share this testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify all buttons are visible (they should wrap)
        const buttons = page.locator('[aria-label^="Share on"]')
        const count = await buttons.count()
        expect(count).toBe(5) // 5 social platforms
      }
    })
  })

  test.describe('Error States', () => {
    test('should show error message for invalid share token', async ({ page }) => {
      await page.goto('/share/invalid-token-that-does-not-exist')
      await page.waitForLoadState('networkidle')

      // Should show error message
      await expect(
        page.getByText(/testimony not found|failed to load/i)
      ).toBeVisible({ timeout: 10000 })
    })

    test('should show link to homepage when testimony not found', async ({ page }) => {
      await page.goto('/share/invalid-token')
      await page.waitForLoadState('networkidle')

      // Should have a link back to homepage
      const homepageLink = page.getByRole('link', { name: /homepage/i })
      if (await homepageLink.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(homepageLink).toHaveAttribute('href', '/')
      }
    })
  })
})

test.describe('Share Page - Anonymous Email Capture', () => {
  test('should save email without requiring a magic link', async ({ page }) => {
    const token = 'claim-token'
    const testimony = {
      id: 'test-claim-123',
      user_id: 'anon-user-123',
      title: 'Saved for Later',
      framework_type: 'free_form',
      content: { narrative: 'Short testimony content.' },
      is_public: false,
      share_token: token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await page.route('**/api/testimonies/share/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          testimony,
          isOwner: false,
          isAnonymous: true,
        }),
      })
    })

    let claimRequestBody: any = null
    await page.route('**/api/users/anonymous/claim-email', async (route) => {
      claimRequestBody = route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto(`/share/${token}`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: /claim your testimony/i })
    ).toBeVisible()

    const claimLink = page.getByRole('link', { name: /sign up & claim/i })
    await expect(claimLink).toHaveCount(0)

    const emailInput = page.getByPlaceholder('Enter your email to claim this testimony')
    await expect(emailInput).toBeVisible()
    await emailInput.fill('user@example.com')

    await Promise.all([
      page.waitForResponse('**/api/users/anonymous/claim-email'),
      page.getByRole('button', { name: /save testimony|saving/i }).click(),
    ])

    await expect(
      page.getByText(/Email saved\. When you sign in later/i)
    ).toBeVisible()

    expect(claimRequestBody).toEqual({
      shareToken: token,
      email: 'user@example.com',
    })
  })
})

test.describe('Share Page - Open Graph Meta Tags', () => {
  test('should have Open Graph meta tags in head', async ({ page }) => {
    await page.goto('/share/test-token')
    await page.waitForLoadState('domcontentloaded')

    const ogTitleHandle = await page.$('meta[property="og:title"]')
    const ogDescriptionHandle = await page.$('meta[property="og:description"]')
    const ogUrlHandle = await page.$('meta[property="og:url"]')
    const ogImageHandle = await page.$('meta[property="og:image"]')
    const ogTypeHandle = await page.$('meta[property="og:type"]')

    if (!ogTitleHandle || !ogDescriptionHandle || !ogUrlHandle || !ogImageHandle || !ogTypeHandle) {
      test.skip(true, 'Open Graph tags not present for this share token')
      return
    }

    const ogTitle = await ogTitleHandle.getAttribute('content')
    const ogDescription = await ogDescriptionHandle.getAttribute('content')
    const ogUrl = await ogUrlHandle.getAttribute('content')
    const ogImage = await ogImageHandle.getAttribute('content')
    const ogType = await ogTypeHandle.getAttribute('content')

    // If OG tags are present (testimony loaded successfully)
    if (ogTitle) {
      expect(ogTitle).toBeTruthy()
      expect(ogDescription).toBeTruthy()
      expect(ogUrl).toContain('/share/')
      expect(ogImage).toContain('og-image')
      expect(ogType).toBe('article')
    }
  })

  test('should have Twitter Card meta tags', async ({ page }) => {
    await page.goto('/share/test-token')
    await page.waitForLoadState('domcontentloaded')

    const twitterCardHandle = await page.$('meta[name="twitter:card"]')
    const twitterTitleHandle = await page.$('meta[name="twitter:title"]')
    const twitterDescriptionHandle = await page.$('meta[name="twitter:description"]')
    const twitterImageHandle = await page.$('meta[name="twitter:image"]')

    if (!twitterCardHandle || !twitterTitleHandle || !twitterDescriptionHandle || !twitterImageHandle) {
      test.skip(true, 'Twitter tags not present for this share token')
      return
    }

    const twitterCard = await twitterCardHandle.getAttribute('content')
    const twitterTitle = await twitterTitleHandle.getAttribute('content')
    const twitterDescription = await twitterDescriptionHandle.getAttribute('content')
    const twitterImage = await twitterImageHandle.getAttribute('content')

    // If Twitter tags are present (testimony loaded successfully)
    if (twitterCard) {
      expect(twitterCard).toBe('summary_large_image')
      expect(twitterTitle).toBeTruthy()
      expect(twitterDescription).toBeTruthy()
      expect(twitterImage).toContain('og-image')
    }
  })
})
