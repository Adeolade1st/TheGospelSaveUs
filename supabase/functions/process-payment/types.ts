/**
 * Type definitions for the payment processing edge function
 */

export interface PaymentRequest {
  amount: number
  currency: string
  payment_method: 'card' | 'paypal' | 'bank_transfer'
  customer: CustomerInfo
  metadata?: Record<string, string>
  idempotency_key: string
  return_url?: string
  cancel_url?: string
}

export interface CustomerInfo {
  email: string
  name: string
  phone?: string
  address?: Address
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
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

export interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export type PaymentProcessor = 'stripe' | 'paypal' | 'square'

export interface ProcessorConfig {
  name: PaymentProcessor
  enabled: boolean
  testMode: boolean
  apiKey?: string
  webhookSecret?: string
}