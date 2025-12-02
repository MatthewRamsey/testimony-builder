export interface CheckoutSessionData {
  customerId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CheckoutSession {
  id: string
  url: string
}

export interface IPaymentProvider {
  createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSession>
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean
  constructEvent(payload: string | Buffer, signature: string): any
}

