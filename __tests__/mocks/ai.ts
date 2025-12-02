export function createMockAIProvider() {
  return {
    generateText: jest.fn().mockResolvedValue({
      text: JSON.stringify([
        { text: 'Suggestion 1', explanation: 'This improves clarity' },
        { text: 'Suggestion 2', explanation: 'This enhances impact' },
      ]),
    }),
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify([
                  { text: 'Suggestion 1', explanation: 'This improves clarity' },
                  { text: 'Suggestion 2', explanation: 'This enhances impact' },
                ]),
              },
            },
          ],
        }),
      },
    },
  }
}

export const mockAI = createMockAIProvider()

// Mock the AI SDK
jest.mock('ai', () => ({
  generateText: mockAI.generateText,
}))

jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(() => ({
    chat: mockAI.chat,
  })),
}))
