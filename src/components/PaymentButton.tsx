import React from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';

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
    // Redirect to external donation platform or show contact information
    const donationMessage = `Thank you for your interest in supporting our ministry with a $${amount} donation. Please contact us directly to complete your donation.`;
    alert(donationMessage);
    
    // You can replace this with a redirect to an external donation platform
    // window.open('https://your-external-donation-platform.com', '_blank');
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        className={`${className} flex items-center justify-center space-x-2`}
      >
        <CreditCard size={20} />
        {children}
        <ExternalLink size={16} className="ml-1" />
      </button>
    </div>
  );
};

export default PaymentButton;