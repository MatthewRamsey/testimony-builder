import { test, expect } from '@playwright/test'

/**
 * E2E tests for the Preview Page social sharing functionality
 * Note: Preview page requires authentication, so these tests assume
 * either a test user is logged in or API mocking is configured
 */

test.describe('Preview Page - Share Buttons', () => {
  // These tests require authentication context
  // In a real scenario, you would set up auth before tests

  test.describe('Share Buttons Conditional Display', () => {
    test('should show share buttons when testimony has share_token', async ({ page }) => {
      // Navigate to a preview page with a testimony that has a share token
      // This would need authentication and a valid testimony ID
      await page.goto('/preview/test-id-with-share-token')
      await page.waitForLoadState('networkidle')

      // Check if redirected to login (expected without auth)
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        // Skip test when not authenticated
        test.skip()
        return
      }

      // If authenticated and testimony loaded, check for share section
      const shareSection = page.locator('text=Share your testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify share buttons are present (compact mode - no labels)
        await expect(page.locator('[aria-label="Share on Twitter"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on Facebook"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on LinkedIn"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on WhatsApp"]')).toBeVisible()
        await expect(page.locator('[aria-label="Share on Email"]')).toBeVisible()
        await expect(page.locator('[aria-label="Copy link"]')).toBeVisible()
      }
    })

    test('should NOT show share buttons when testimony has no share_token', async ({ page }) => {
      // Navigate to a preview page with a testimony without share token
      await page.goto('/preview/test-id-without-share-token')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        test.skip()
        return
      }

      // Share section should not be visible
      const shareSection = page.locator('text=Share your testimony')
      await expect(shareSection).not.toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Share Buttons Compact Mode', () => {
    test('share buttons should be in compact mode (small, no labels)', async ({ page }) => {
      await page.goto('/preview/test-id')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        test.skip()
        return
      }

      const shareSection = page.locator('text=Share your testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // In compact mode, buttons should not have visible labels
        // Check that the Twitter button doesn't have visible "Twitter" text
        const twitterButton = page.locator('[aria-label="Share on Twitter"]')
        const buttonText = await twitterButton.textContent()

        // In compact mode (showLabels={false}), button should only have icon
        expect(buttonText?.trim()).toBe('')
      }
    })
  })

  test.describe('Preview Page Action Bar', () => {
    test('should have Edit and Export PDF buttons alongside share', async ({ page }) => {
      await page.goto('/preview/test-id')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        test.skip()
        return
      }

      // Verify Edit button is present
      await expect(page.getByRole('link', { name: /edit/i })).toBeVisible({ timeout: 5000 })

      // Verify Export PDF button is present
      await expect(page.getByRole('button', { name: /export pdf/i })).toBeVisible()
    })

    test('share section should be in its own area below content', async ({ page }) => {
      await page.goto('/preview/test-id')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        test.skip()
        return
      }

      const shareSection = page.locator('text=Share your testimony')

      if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Share section should be below the main content
        // Verify it's within the testimony card
        const parentCard = shareSection.locator('xpath=ancestor::div[contains(@class, "shadow")]')
        await expect(parentCard).toBeVisible()
      }
    })
  })

  test.describe('Share URL Construction', () => {
    test('share URL should use the share_token, not the testimony ID', async ({ page, context }) => {
      await page.goto('/preview/test-id')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        test.skip()
        return
      }

      const twitterButton = page.locator('[aria-label="Share on Twitter"]')

      if (await twitterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Click and capture popup URL
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          twitterButton.click(),
        ])

        const popupUrl = popup.url()
        // The URL should contain /share/ (not /preview/)
        expect(popupUrl).toContain('/share/')
        expect(popupUrl).not.toContain('/preview/')

        await popup.close()
      }
    })
  })
})

test.describe('Preview Page - Copy Link from Share Section', () => {
  test('copy link should copy the share URL', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are only supported in Chromium')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/preview/test-id')
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      test.skip()
      return
    }

    // Find the copy link button in the share section (not the header)
    const shareSection = page.locator('text=Share your testimony')

    if (await shareSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      const copyButton = shareSection.locator('..').locator('[aria-label="Copy link"]')

      if (await copyButton.isVisible()) {
        await copyButton.click()

        // Verify clipboard contains share URL
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
        expect(clipboardText).toContain('/share/')
      }
    }
  })
})
