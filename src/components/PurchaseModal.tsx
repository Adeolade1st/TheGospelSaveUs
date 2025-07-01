import React, { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  title: string;
  artist: string;
  price: number;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  title,
  artist,
  price
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // In a real implementation, this would integrate with your payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPurchase();
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Track</h3>
            <p className="text-gray-600">Get instant access to high-quality audio</p>
          </div>

          {/* Track Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-gray-600 text-sm">by {artist}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-2xl font-bold text-green-600">${price.toFixed(2)}</span>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CreditCard size={14} />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">Instant download after purchase</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">High-quality MP3 file</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">Email backup download link</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">Unlimited listening</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Lock size={12} />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <CreditCard size={12} />
              <span>Secure Payment</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Buy Now - ${price.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>

          {/* Payment Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment processed by Stripe. No card details stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;