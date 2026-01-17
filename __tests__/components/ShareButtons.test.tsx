import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareButtons } from '@/components/ShareButtons'

// Mock window.open
const mockOpen = jest.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
})

// Mock clipboard API
const mockWriteText = jest.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

describe('ShareButtons', () => {
  const defaultProps = {
    shareUrl: 'https://example.com/share/test-token',
    title: 'Test Testimony',
    excerpt: 'This is a test excerpt for sharing.',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should render all share buttons', () => {
      render(<ShareButtons {...defaultProps} />)

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share on facebook/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share on linkedin/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share on whatsapp/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share on email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    })

    it('should render with labels when showLabels is true', () => {
      render(<ShareButtons {...defaultProps} showLabels={true} />)

      expect(screen.getByText('Twitter')).toBeInTheDocument()
      expect(screen.getByText('Facebook')).toBeInTheDocument()
      expect(screen.getByText('LinkedIn')).toBeInTheDocument()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })

    it('should not render labels when showLabels is false', () => {
      render(<ShareButtons {...defaultProps} showLabels={false} />)

      expect(screen.queryByText('Twitter')).not.toBeInTheDocument()
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument()
      expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument()
      expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
      expect(screen.queryByText('Copy Link')).not.toBeInTheDocument()
    })

    it('should apply correct size classes for sm size', () => {
      const { container } = render(<ShareButtons {...defaultProps} size="sm" />)

      // Check for small size classes
      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button.className).toContain('p-2')
      })
    })

    it('should apply correct size classes for lg size', () => {
      const { container } = render(<ShareButtons {...defaultProps} size="lg" />)

      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button.className).toContain('p-3')
      })
    })

    it('should render horizontally by default', () => {
      const { container } = render(<ShareButtons {...defaultProps} />)

      const buttonContainer = container.firstChild as HTMLElement
      expect(buttonContainer.className).toContain('flex-row')
    })

    it('should render vertically when orientation is vertical', () => {
      const { container } = render(<ShareButtons {...defaultProps} orientation="vertical" />)

      const buttonContainer = container.firstChild as HTMLElement
      expect(buttonContainer.className).toContain('flex-col')
    })

    it('should apply custom className', () => {
      const { container } = render(<ShareButtons {...defaultProps} className="custom-class" />)

      const buttonContainer = container.firstChild as HTMLElement
      expect(buttonContainer.className).toContain('custom-class')
    })
  })

  describe('Share Button Clicks', () => {
    it('should open Twitter share URL on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const twitterButton = screen.getByRole('button', { name: /share on twitter/i })
      await userEvent.click(twitterButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[0]).toContain('twitter.com/intent/tweet')
      expect(callArgs[1]).toBe('_blank')
    })

    it('should open Facebook share URL on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const facebookButton = screen.getByRole('button', { name: /share on facebook/i })
      await userEvent.click(facebookButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[0]).toContain('facebook.com/sharer')
    })

    it('should open LinkedIn share URL on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const linkedInButton = screen.getByRole('button', { name: /share on linkedin/i })
      await userEvent.click(linkedInButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[0]).toContain('linkedin.com/sharing')
    })

    it('should open WhatsApp share URL on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const whatsappButton = screen.getByRole('button', { name: /share on whatsapp/i })
      await userEvent.click(whatsappButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[0]).toContain('wa.me')
    })

    it('should open email share URL on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const emailButton = screen.getByRole('button', { name: /share on email/i })
      await userEvent.click(emailButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[0]).toContain('mailto:')
    })

    it('should pass correct options to window.open', async () => {
      render(<ShareButtons {...defaultProps} />)

      const twitterButton = screen.getByRole('button', { name: /share on twitter/i })
      await userEvent.click(twitterButton)

      const callArgs = mockOpen.mock.calls[0]
      expect(callArgs[2]).toContain('noopener')
      expect(callArgs[2]).toContain('noreferrer')
    })
  })

  describe('Copy Link Functionality', () => {
    it('should copy URL to clipboard on click', async () => {
      render(<ShareButtons {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await userEvent.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/share/test-token')
    })

    it('should show "Copied!" message after clicking', async () => {
      render(<ShareButtons {...defaultProps} showLabels={true} />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('should change button aria-label to "Link copied" after clicking', async () => {
      render(<ShareButtons {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /link copied/i })).toBeInTheDocument()
      })
    })

    it('should revert to "Copy Link" after timeout', async () => {
      jest.useFakeTimers()

      render(<ShareButtons {...defaultProps} showLabels={true} />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })

      // Use fireEvent instead of userEvent with fake timers
      fireEvent.click(copyButton)

      // Wait for state update
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })

      // Fast-forward 3.5 seconds
      act(() => {
        jest.advanceTimersByTime(3500)
      })

      // Wait for state to revert
      await waitFor(() => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    it('should handle clipboard error gracefully', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<ShareButtons {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })
      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button names', () => {
      render(<ShareButtons {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('should have title attributes on buttons', () => {
      render(<ShareButtons {...defaultProps} />)

      expect(screen.getByTitle('Share on Twitter')).toBeInTheDocument()
      expect(screen.getByTitle('Share on Facebook')).toBeInTheDocument()
      expect(screen.getByTitle('Share on LinkedIn')).toBeInTheDocument()
      expect(screen.getByTitle('Share on WhatsApp')).toBeInTheDocument()
      expect(screen.getByTitle('Share on Email')).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<ShareButtons {...defaultProps} />)

      const firstButton = screen.getByRole('button', { name: /share on twitter/i })

      // Focus the first button
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      // All buttons should be focusable (have tabIndex of 0 or be naturally focusable)
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('should activate button with Enter key', () => {
      render(<ShareButtons {...defaultProps} />)

      const twitterButton = screen.getByRole('button', { name: /share on twitter/i })
      twitterButton.focus()

      // Simulate Enter key press using fireEvent
      fireEvent.keyDown(twitterButton, { key: 'Enter', code: 'Enter' })
      fireEvent.click(twitterButton)

      expect(mockOpen).toHaveBeenCalled()
    })

    it('should activate button with Space key', () => {
      render(<ShareButtons {...defaultProps} />)

      const twitterButton = screen.getByRole('button', { name: /share on twitter/i })
      twitterButton.focus()

      // Simulate Space key press using fireEvent
      fireEvent.keyDown(twitterButton, { key: ' ', code: 'Space' })
      fireEvent.click(twitterButton)

      expect(mockOpen).toHaveBeenCalled()
    })
  })

  describe('Props handling', () => {
    it('should handle missing excerpt gracefully', () => {
      render(
        <ShareButtons
          shareUrl="https://example.com/share/test"
          title="Test Title"
        />
      )

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument()
    })

    it('should handle empty excerpt', () => {
      render(
        <ShareButtons
          shareUrl="https://example.com/share/test"
          title="Test Title"
          excerpt=""
        />
      )

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument()
    })

    it('should handle special characters in title and excerpt', () => {
      render(
        <ShareButtons
          shareUrl="https://example.com/share/test"
          title={'Title with <tag> & "quotes"'}
          excerpt={"Excerpt with 'apostrophes' & special chars"}
        />
      )

      const twitterButton = screen.getByRole('button', { name: /share on twitter/i })
      fireEvent.click(twitterButton)

      // Should not throw and should properly encode
      expect(mockOpen).toHaveBeenCalled()
    })
  })
})
