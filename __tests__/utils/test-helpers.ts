/**
 * Helper to wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Helper to create a mock implementation that resolves after a delay
 */
export function createDelayedMock<T>(value: T, delay: number = 100) {
  return jest.fn().mockImplementation(
    () => new Promise((resolve) => setTimeout(() => resolve(value), delay))
  )
}

/**
 * Helper to create a mock that rejects with an error
 */
export function createRejectedMock(error: Error | string) {
  const err = typeof error === 'string' ? new Error(error) : error
  return jest.fn().mockRejectedValue(err)
}

/**
 * Helper to reset all mocks
 */
export function resetAllMocks() {
  jest.clearAllMocks()
  jest.resetAllMocks()
}

/**
 * Helper to create a mock Date
 */
export function mockDate(isoDate: string) {
  const mockDate = new Date(isoDate)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
  return mockDate
}

/**
 * Helper to restore Date
 */
export function restoreDate() {
  jest.spyOn(global, 'Date').mockRestore()
}
