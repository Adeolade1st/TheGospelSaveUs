import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {}
}) => {
  const handlePayment = () => {
    // Direct donation processing - replace with actual payment processor
    window.open('https://www.paypal.com/donate', '_blank');
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        className={`${className} flex items-center justify-center space-x-2`}
      >
        <CreditCard size={20} />
        {children}
      </button>
    </div>
  );
};

export default PaymentButton;