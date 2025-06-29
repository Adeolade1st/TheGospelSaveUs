/**
 * Client-side payment processing utilities
 * Handles communication with the payment processing edge function
 */

export interface PaymentRequest {
  amount: number
  currency: string
  payment_method: 'card' | 'paypal' | 'bank_transfer'
  customer: {
    email: string
    name: string
    phone?: string
    address?: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  metadata?: Record<string, string>
  return_url?: string
  cancel_url?: string
}

export interface PaymentResponse {
  success: boolean
  payment_id?: string
  client_secret?: string
  redirect_url?: string
  error?: string
  error_code?: string
  timestamp: string
}

class PaymentClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!this.baseUrl || !this.apiKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.')
    }
  }

  /**
   * Generate a unique idempotency key
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Process a payment request
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const idempotencyKey = this.generateIdempotencyKey()
      const url = `${this.baseUrl}/functions/v1/process-payment`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ...request,
          idempotency_key: idempotencyKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Network error', 
          error_code: 'NETWORK_ERROR' 
        }))
        
        throw new Error(errorData.error || `HTTP ${response.status}: Payment failed`)
      }

      const result: PaymentResponse = await response.json()
      return result

    } catch (error) {
      console.error('Payment processing error:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        error_code: 'CLIENT_ERROR',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Validate payment request before sending
   */
  validateRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Amount validation
    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (request.amount > 10000) {
      errors.push('Amount cannot exceed $10,000')
    }

    // Currency validation
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    if (!request.currency || !validCurrencies.includes(request.currency.toUpperCase())) {
      errors.push('Invalid currency')
    }

    // Payment method validation
    const validMethods = ['card', 'paypal', 'bank_transfer']
    if (!request.payment_method || !validMethods.includes(request.payment_method)) {
      errors.push('Invalid payment method')
    }

    // Customer validation
    if (!request.customer) {
      errors.push('Customer information is required')
    } else {
      if (!request.customer.email || !this.isValidEmail(request.customer.email)) {
        errors.push('Valid email address is required')
      }

      if (!request.customer.name || request.customer.name.trim().length < 2) {
        errors.push('Customer name is required')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): Array<{ value: string; label: string }> {
    return [
      { value: 'card', label: 'Credit/Debit Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
    ]
  }
}

// Export singleton instance
export const paymentClient = new PaymentClient()