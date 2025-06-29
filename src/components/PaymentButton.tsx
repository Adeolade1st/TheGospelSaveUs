import React, { useState } from 'react';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  customerEmail?: string;
}

interface PaymentResponse {
  success: boolean;
  payment_intent?: any;
  client_secret?: string;
  requires_action?: boolean;
  redirect_url?: string;
  error?: string;
  validation_errors?: Array<{ field: string; message: string }>;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  customerEmail
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate environment variables
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Supabase URL is not configured. Please check your environment variables.');
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase anon key is not configured. Please check your environment variables.');
      }

      // Prepare payment data
      const paymentData = {
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          ministry: 'God Will Provide Outreach Ministry',
          timestamp: new Date().toISOString()
        }
      };

      // Call Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
      const functionUrl = `${baseUrl}/functions/v1/create-payment`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(paymentData),
      });

      const result: PaymentResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.validation_errors) {
          const errorMessages = result.validation_errors.map(err => err.message).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(result.error || `HTTP ${response.status}: Payment failed`);
      }

      // Handle successful payment intent creation
      if (result.client_secret) {
        // Here you would typically integrate with Stripe Elements
        // For now, we'll show a success message
        console.log('Payment intent created successfully:', result.payment_intent?.id);
        console.log('Client secret:', result.client_secret);
        
        // In a real implementation, you would:
        // 1. Use Stripe Elements to collect payment method
        // 2. Confirm the payment using the client_secret
        // 3. Handle 3D Secure authentication if required
        
        alert(`Payment intent created successfully! Amount: $${amount}`);
      }

      if (result.requires_action && result.redirect_url) {
        // Redirect for 3D Secure authentication
        window.location.href = result.redirect_url;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`${className} ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } flex items-center justify-center space-x-2`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            {children}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;