import React, { useState } from 'react';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentProcessorProps {
  amount: number;
  trackId: string;
  trackTitle: string;
  artistName: string;
  onSuccess: (downloadUrl: string, receiptEmail: string) => void;
  onError: (error: string) => void;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  email: string;
  name: string;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  trackId,
  trackTitle,
  artistName,
  onSuccess,
  onError
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentData>>({});

  const validatePaymentData = (): boolean => {
    const newErrors: Partial<PaymentData> = {};

    // Card number validation (simplified)
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Valid card number required';
    }

    // Expiry date validation
    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Valid expiry date required (MM/YY)';
    }

    // CVV validation
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV required';
    }

    // Email validation
    if (!paymentData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
      newErrors.email = 'Valid email address required';
    }

    // Name validation
    if (!paymentData.name || paymentData.name.trim().length < 2) {
      newErrors.name = 'Full name required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (!validatePaymentData()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In production, integrate with Stripe or your payment processor
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          trackId,
          customerEmail: paymentData.email,
          customerName: paymentData.name,
          // Note: Never send actual card details to your server
          // Use Stripe Elements or similar for secure card processing
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Generate secure download URL
        const downloadUrl = await generateSecureDownloadUrl(trackId, paymentData.email);
        
        // Send confirmation email
        await sendDownloadEmail(paymentData.email, trackTitle, artistName, downloadUrl);
        
        onSuccess(downloadUrl, paymentData.email);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSecureDownloadUrl = async (trackId: string, email: string): Promise<string> => {
    // Generate a secure, time-limited download URL
    const token = btoa(`${trackId}:${email}:${Date.now()}`);
    return `${window.location.origin}/api/secure-download/${token}`;
  };

  const sendDownloadEmail = async (email: string, title: string, artist: string, downloadUrl: string) => {
    // Send email with download link
    await fetch('/api/send-download-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        title,
        artist,
        downloadUrl,
      }),
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">Secure Payment</h3>
      </div>

      {/* Security Indicators */}
      <div className="flex items-center justify-center space-x-4 mb-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-1 text-green-700">
          <Shield size={16} />
          <span className="text-sm font-medium">SSL Secured</span>
        </div>
        <div className="flex items-center space-x-1 text-green-700">
          <Lock size={16} />
          <span className="text-sm font-medium">256-bit Encryption</span>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={paymentData.cardNumber}
            onChange={(e) => setPaymentData({
              ...paymentData,
              cardNumber: formatCardNumber(e.target.value)
            })}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={19}
          />
          {errors.cardNumber && (
            <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              value={paymentData.expiryDate}
              onChange={(e) => setPaymentData({
                ...paymentData,
                expiryDate: formatExpiryDate(e.target.value)
              })}
              placeholder="MM/YY"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expiryDate ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={5}
            />
            {errors.expiryDate && (
              <p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={paymentData.cvv}
              onChange={(e) => setPaymentData({
                ...paymentData,
                cvv: e.target.value.replace(/\D/g, '')
              })}
              placeholder="123"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cvv ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={4}
            />
            {errors.cvv && (
              <p className="text-red-600 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={paymentData.name}
            onChange={(e) => setPaymentData({
              ...paymentData,
              name: e.target.value
            })}
            placeholder="John Doe"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={paymentData.email}
            onChange={(e) => setPaymentData({
              ...paymentData,
              email: e.target.value
            })}
            placeholder="john@example.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Download link will be sent to this email
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{trackTitle} by {artistName}</span>
          <span className="font-semibold">${amount}</span>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={processPayment}
        disabled={isProcessing}
        className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            <span>Complete Purchase - ${amount}</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment information is encrypted and secure. We never store your card details.
      </p>
    </div>
  );
};

export default PaymentProcessor;